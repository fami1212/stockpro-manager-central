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
    // Verify the caller is authenticated and is an admin
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

    // Verify caller's JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !caller) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if caller is admin
    const { data: isAdmin } = await supabaseAdmin.rpc('has_role', { _user_id: caller.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { email, password, firstName, lastName, company } = await req.json();

    // Input validation
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

    console.log('Admin user creation requested by:', caller.id);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, company }
    });

    if (authError) throw authError;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: authData.user!.id, role: 'admin', granted_by: caller.id });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ success: true, message: 'Compte admin créé avec succès', userId: authData.user!.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred while creating the account' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
