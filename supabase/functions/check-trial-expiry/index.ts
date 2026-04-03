import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Find trial subscriptions that expired in the last 24 hours
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { data: expiredTrials, error } = await supabase
      .from('user_subscriptions')
      .select('user_id, trial_end, plan_id')
      .eq('status', 'trial')
      .lt('trial_end', now.toISOString())
      .gte('trial_end', yesterday.toISOString())

    if (error) throw error

    if (!expiredTrials || expiredTrials.length === 0) {
      return new Response(JSON.stringify({ message: 'No expired trials found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get admin users
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')

    if (!admins || admins.length === 0) {
      return new Response(JSON.stringify({ message: 'No admins found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profiles for expired trials
    const userIds = expiredTrials.map(t => t.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, company')
      .in('id', userIds)

    const profilesMap = new Map((profiles || []).map(p => [p.id, p]))

    // Update expired trials status
    await supabase
      .from('user_subscriptions')
      .update({ status: 'expired', updated_at: now.toISOString() })
      .eq('status', 'trial')
      .lt('trial_end', now.toISOString())

    // Create notifications for each admin about each expired trial
    const notifications: any[] = []
    for (const admin of admins) {
      for (const trial of expiredTrials) {
        const profile = profilesMap.get(trial.user_id)
        const userName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
          : trial.user_id

        notifications.push({
          user_id: admin.user_id,
          title: 'Essai expiré',
          description: `L'essai de ${userName}${profile?.company ? ` (${profile.company})` : ''} a expiré. Email: ${profile?.email || 'N/A'}`,
          type: 'warning',
          category: 'subscription',
          details: {
            expired_user_id: trial.user_id,
            trial_end: trial.trial_end,
            user_email: profile?.email,
          },
        })
      }
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${expiredTrials.length} expired trials, notified ${admins.length} admins`,
        expired_count: expiredTrials.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
