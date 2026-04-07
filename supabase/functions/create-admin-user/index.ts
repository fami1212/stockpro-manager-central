import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: caller.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { email, password, firstName, lastName, company, role, planId } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'user'];
    const assignedRole = validRoles.includes(role) ? role : 'user';

    console.log('User creation requested by:', caller.id, 'role:', assignedRole, 'planId:', planId);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, company }
    });

    if (authError) throw authError;

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Assign the chosen role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: authData.user!.id, role: assignedRole, granted_by: caller.id });

    if (roleError) throw roleError;

    // Assign subscription plan if provided
    if (planId) {
      // Verify plan exists
      const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id, name')
        .eq('id', planId)
        .single();

      if (plan) {
        // Delete any existing trial subscription created by trigger
        await supabaseAdmin
          .from('user_subscriptions')
          .delete()
          .eq('user_id', authData.user!.id);

        const isTrialPlan = plan.name === 'trial';
        const now = new Date().toISOString();

        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: authData.user!.id,
            plan_id: planId,
            status: isTrialPlan ? 'trial' : 'active',
            trial_start: isTrialPlan ? now : null,
            trial_end: isTrialPlan ? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString() : null,
            subscription_start: isTrialPlan ? null : now,
            subscription_end: isTrialPlan ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            payment_method: 'admin',
            activated_by: caller.id,
          });

        if (subError) {
          console.error('Error assigning subscription:', subError);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Compte créé avec succès', userId: authData.user!.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred while creating the account' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
