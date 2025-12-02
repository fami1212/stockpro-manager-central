import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvoiceRequest {
  invoiceId: string;
  recipientEmail: string;
  recipientName: string;
  emailTemplateId?: string;
  customSubject?: string;
  customBody?: string;
  invoicePdfBase64?: string;
  invoiceNumber: string;
  invoiceTotal: number;
  companyName: string;
  dueDate?: string;
}

const defaultEmailTemplate = {
  subject: "Facture {{invoice_number}} - {{company_name}}",
  body: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">{{company_name}}</h1>
      </div>
      
      <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
        <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
          Bonjour {{client_name}},
        </p>
        
        <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
          Veuillez trouver ci-joint votre facture <strong>{{invoice_number}}</strong>.
        </p>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%;">
            <tr>
              <td style="color: #64748b; padding: 8px 0;">Numéro de facture:</td>
              <td style="color: #1e293b; font-weight: bold; text-align: right;">{{invoice_number}}</td>
            </tr>
            <tr>
              <td style="color: #64748b; padding: 8px 0;">Montant total:</td>
              <td style="color: #1e40af; font-weight: bold; font-size: 18px; text-align: right;">{{invoice_total}} MAD</td>
            </tr>
            {{#if due_date}}
            <tr>
              <td style="color: #64748b; padding: 8px 0;">Date d'échéance:</td>
              <td style="color: #1e293b; font-weight: bold; text-align: right;">{{due_date}}</td>
            </tr>
            {{/if}}
          </table>
        </div>
        
        <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
          Pour toute question concernant cette facture, n'hésitez pas à nous contacter.
        </p>
        
        <p style="color: #334155; font-size: 16px;">
          Cordialement,<br/>
          <strong>{{company_name}}</strong>
        </p>
      </div>
      
      <div style="background: #1e293b; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
        </p>
      </div>
    </div>
  `
};

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  // Handle conditional blocks
  result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (_, key, content) => {
    return data[key] ? content : '';
  });
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send invoice email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const {
      invoiceId,
      recipientEmail,
      recipientName,
      emailTemplateId,
      customSubject,
      customBody,
      invoicePdfBase64,
      invoiceNumber,
      invoiceTotal,
      companyName,
      dueDate
    }: SendInvoiceRequest = await req.json();

    console.log(`Sending invoice ${invoiceNumber} to ${recipientEmail}`);

    // Get email template if specified
    let emailSubject = customSubject || defaultEmailTemplate.subject;
    let emailBody = customBody || defaultEmailTemplate.body;

    if (emailTemplateId) {
      const { data: template } = await supabase
        .from('email_templates')
        .select('subject, body')
        .eq('id', emailTemplateId)
        .eq('user_id', user.id)
        .single();

      if (template) {
        emailSubject = template.subject;
        emailBody = template.body;
      }
    }

    // Replace placeholders
    const placeholders = {
      company_name: companyName,
      client_name: recipientName,
      invoice_number: invoiceNumber,
      invoice_total: invoiceTotal.toFixed(2),
      due_date: dueDate || ''
    };

    emailSubject = replacePlaceholders(emailSubject, placeholders);
    emailBody = replacePlaceholders(emailBody, placeholders);

    // Prepare email options
    const emailOptions: any = {
      from: `${companyName} <onboarding@resend.dev>`,
      to: [recipientEmail],
      subject: emailSubject,
      html: emailBody,
    };

    // Add PDF attachment if provided
    if (invoicePdfBase64) {
      emailOptions.attachments = [
        {
          filename: `${invoiceNumber}.pdf`,
          content: invoicePdfBase64,
        },
      ];
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Email sent successfully:", emailResponse);

    // Record the sent invoice
    const { error: recordError } = await supabase
      .from('sent_invoices')
      .insert({
        invoice_id: invoiceId,
        sent_to: recipientEmail,
        email_template_id: emailTemplateId || null,
        status: 'sent',
        user_id: user.id
      });

    if (recordError) {
      console.error("Error recording sent invoice:", recordError);
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
