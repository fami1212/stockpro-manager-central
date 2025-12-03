import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReminderRule {
  days_after_due: number;
  subject: string;
  body: string;
}

const defaultReminderRules: ReminderRule[] = [
  {
    days_after_due: 3,
    subject: "Rappel de paiement - Facture {{invoice_number}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af;">Rappel de paiement</h2>
      <p>Bonjour {{client_name}},</p>
      <p>Nous vous rappelons que la facture <strong>{{invoice_number}}</strong> d'un montant de <strong>{{invoice_total}} MAD</strong> est arrivée à échéance le {{due_date}}.</p>
      <p>Merci de procéder au règlement dans les meilleurs délais.</p>
      <p>Cordialement,<br/>{{company_name}}</p>
    </div>`
  },
  {
    days_after_due: 10,
    subject: "URGENT: Relance de paiement - Facture {{invoice_number}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Relance urgente</h2>
      <p>Bonjour {{client_name}},</p>
      <p>Malgré notre précédent rappel, nous n'avons pas encore reçu le règlement de la facture <strong>{{invoice_number}}</strong> d'un montant de <strong>{{invoice_total}} MAD</strong>.</p>
      <p>La date d'échéance était le {{due_date}}.</p>
      <p>Nous vous prions de bien vouloir régulariser cette situation dans les plus brefs délais.</p>
      <p>Cordialement,<br/>{{company_name}}</p>
    </div>`
  },
  {
    days_after_due: 30,
    subject: "MISE EN DEMEURE - Facture {{invoice_number}}",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #dc2626;">Mise en demeure</h2>
      <p>Bonjour {{client_name}},</p>
      <p>Nous vous mettons en demeure de régler la facture <strong>{{invoice_number}}</strong> d'un montant de <strong>{{invoice_total}} MAD</strong>, impayée depuis plus de 30 jours.</p>
      <p>Date d'échéance: {{due_date}}</p>
      <p>Sans règlement de votre part sous 8 jours, nous serons contraints d'engager des poursuites.</p>
      <p>Cordialement,<br/>{{company_name}}</p>
    </div>`
  }
];

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Process payment reminders cron job started");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get all overdue invoices across all users
    const { data: overdueInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total,
        due_date,
        user_id,
        client_id,
        clients!invoices_client_id_fkey (name, email)
      `)
      .in('status', ['Impayée', 'Partiel'])
      .not('due_date', 'is', null)
      .lt('due_date', todayStr);

    if (invoicesError) {
      console.error("Error fetching overdue invoices:", invoicesError);
      throw invoicesError;
    }

    console.log(`Found ${overdueInvoices?.length || 0} overdue invoices`);

    if (!overdueInvoices || overdueInvoices.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No overdue invoices to process", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let processed = 0;
    let errors: string[] = [];

    for (const invoice of overdueInvoices) {
      try {
        const client = invoice.clients as any;
        if (!client?.email) {
          console.log(`Skipping invoice ${invoice.invoice_number}: no client email`);
          continue;
        }

        const dueDate = new Date(invoice.due_date!);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check how many reminders already sent for this invoice
        const { data: sentReminders, error: remindersError } = await supabase
          .from('sent_invoices')
          .select('id, sent_at')
          .eq('invoice_id', invoice.id)
          .order('sent_at', { ascending: false });

        if (remindersError) {
          console.error(`Error checking sent reminders for ${invoice.invoice_number}:`, remindersError);
          continue;
        }

        const reminderCount = sentReminders?.length || 0;

        // Determine which reminder rule applies
        let applicableRule: ReminderRule | null = null;
        
        if (daysOverdue >= 30 && reminderCount < 3) {
          applicableRule = defaultReminderRules[2]; // Mise en demeure
        } else if (daysOverdue >= 10 && reminderCount < 2) {
          applicableRule = defaultReminderRules[1]; // Second reminder
        } else if (daysOverdue >= 3 && reminderCount < 1) {
          applicableRule = defaultReminderRules[0]; // First reminder
        }

        if (!applicableRule) {
          console.log(`No applicable rule for invoice ${invoice.invoice_number} (${daysOverdue} days overdue, ${reminderCount} reminders sent)`);
          continue;
        }

        // Check last reminder wasn't sent today (avoid spam)
        if (sentReminders && sentReminders.length > 0) {
          const lastSentDate = new Date(sentReminders[0].sent_at).toISOString().split('T')[0];
          if (lastSentDate === todayStr) {
            console.log(`Skipping invoice ${invoice.invoice_number}: reminder already sent today`);
            continue;
          }
        }

        // Get company settings for the user
        const { data: settings } = await supabase
          .from('invoice_settings')
          .select('company_name, company_email')
          .eq('user_id', invoice.user_id)
          .single();

        const companyName = settings?.company_name || 'Votre entreprise';
        const senderEmail = settings?.company_email || 'onboarding@resend.dev';

        const placeholders = {
          company_name: companyName,
          client_name: client.name,
          invoice_number: invoice.invoice_number,
          invoice_total: invoice.total.toFixed(2),
          due_date: new Date(invoice.due_date!).toLocaleDateString('fr-FR')
        };

        const emailSubject = replacePlaceholders(applicableRule.subject, placeholders);
        const emailBody = replacePlaceholders(applicableRule.body, placeholders);

        console.log(`Sending reminder to ${client.email} for invoice ${invoice.invoice_number}`);

        const emailResponse = await resend.emails.send({
          from: `${companyName} <onboarding@resend.dev>`,
          to: [client.email],
          subject: emailSubject,
          html: emailBody,
        });

        console.log(`Email sent for invoice ${invoice.invoice_number}:`, emailResponse);

        // Check for Resend API errors
        if ((emailResponse as any).error) {
          const error = (emailResponse as any).error;
          console.error(`Resend API error for ${invoice.invoice_number}:`, error);
          errors.push(`${invoice.invoice_number}: ${error.message}`);
          
          // Record the failed attempt
          await supabase
            .from('sent_invoices')
            .insert({
              invoice_id: invoice.id,
              sent_to: client.email,
              status: 'failed',
              error_message: error.message,
              user_id: invoice.user_id
            });
          continue;
        }

        // Record the sent reminder
        await supabase
          .from('sent_invoices')
          .insert({
            invoice_id: invoice.id,
            sent_to: client.email,
            status: 'sent',
            user_id: invoice.user_id
          });

        processed++;
      } catch (invoiceError: any) {
        console.error(`Error processing invoice ${invoice.invoice_number}:`, invoiceError);
        errors.push(`${invoice.invoice_number}: ${invoiceError.message}`);
      }
    }

    console.log(`Processed ${processed} reminders, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed, 
        total: overdueInvoices.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
