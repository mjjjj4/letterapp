import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = 'https://letterapp-black.vercel.app'

function deliveryEmailHtml(capsule, deliveryDateFormatted) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your capsule is ready to open</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:40px 40px 30px;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;color:#aaa;text-transform:uppercase;">The Letter</p>
              <h1 style="margin:0;font-size:28px;color:#fff;font-weight:normal;line-height:1.3;">Your capsule is ready</h1>
            </td>
          </tr>

          <!-- Date ribbon -->
          <tr>
            <td style="background:#2d2d44;padding:14px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;color:#c9c9e0;letter-spacing:1px;">
                Sealed for: <strong style="color:#fff;">${deliveryDateFormatted}</strong>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 36px;">
              <p style="margin:0 0 20px;font-size:17px;color:#333;line-height:1.7;">
                The day has arrived.
              </p>
              <p style="margin:0 0 20px;font-size:17px;color:#333;line-height:1.7;">
                A little while ago, you sat down and wrote something honest — a message meant only for the version of you reading it today. You captured who you were, what you were feeling, what you hoped for.
              </p>
              <p style="margin:0 0 20px;font-size:17px;color:#333;line-height:1.7;">
                That moment is waiting for you inside:
              </p>

              <!-- Capsule title box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="background:#f8f7ff;border-left:4px solid #5c5ce0;border-radius:4px;padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#888;text-transform:uppercase;">Your capsule</p>
                    <p style="margin:0;font-size:20px;color:#1a1a2e;font-weight:bold;">${capsule.title}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:17px;color:#333;line-height:1.7;">
                Take a quiet moment. Then open it.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#5c5ce0;border-radius:8px;text-align:center;">
                    <a href="${APP_URL}/capsule/${capsule.id}"
                       style="display:inline-block;padding:16px 40px;font-size:16px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">
                      Open My Capsule →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;color:#aaa;text-align:center;">
                Or copy this link into your browser:<br/>
                <a href="${APP_URL}/capsule/${capsule.id}" style="color:#5c5ce0;">${APP_URL}/capsule/${capsule.id}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8;padding:24px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#bbb;line-height:1.6;">
                The Letter — Time capsules for your future self.<br/>
                This email was sent because a capsule you created reached its delivery date.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export default async function handler(req, res) {
  console.log('=== Deliver Capsules Cron Started ===', new Date().toISOString())

  // Vercel cron requests include an Authorization header with the CRON_SECRET
  // In production this protects the endpoint from unauthorized calls
  const authHeader = req.headers.authorization
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.error('Unauthorized cron request')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Check required env vars
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' })
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  }

  // Today's date in YYYY-MM-DD (UTC)
  const today = new Date().toISOString().split('T')[0]
  console.log('Checking for capsules to deliver on:', today)

  // Fetch all sealed capsules whose deliver_at is today or earlier (catch any missed days)
  const { data: capsules, error: fetchError } = await supabaseAdmin
    .from('capsules')
    .select('*')
    .eq('status', 'sealed')
    .lte('deliver_at', today)

  if (fetchError) {
    console.error('Failed to fetch capsules:', fetchError.message)
    return res.status(500).json({ error: fetchError.message })
  }

  console.log(`Found ${capsules?.length ?? 0} capsule(s) to deliver`)

  if (!capsules || capsules.length === 0) {
    return res.status(200).json({ delivered: 0, message: 'No capsules to deliver today' })
  }

  const results = { delivered: 0, failed: 0, errors: [] }

  for (const capsule of capsules) {
    console.log(`Processing capsule: ${capsule.id} — "${capsule.title}"`)

    try {
      // Fetch the user's email from auth.users via Supabase admin
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(capsule.user_id)

      if (userError || !userData?.user?.email) {
        throw new Error(`Could not fetch user email for user_id ${capsule.user_id}: ${userError?.message}`)
      }

      const userEmail = userData.user.email
      console.log(`  Sending to: ${userEmail}`)

      const deliveryDateFormatted = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      // Send the delivery email
      const { error: emailError } = await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: userEmail,
        subject: `Your capsule is ready — ${deliveryDateFormatted}`,
        html: deliveryEmailHtml(capsule, deliveryDateFormatted),
      })

      if (emailError) {
        throw new Error(`Resend error: ${emailError.message}`)
      }

      console.log(`  Email sent successfully`)

      // Mark the capsule as delivered
      const { error: updateError } = await supabaseAdmin
        .from('capsules')
        .update({ status: 'delivered' })
        .eq('id', capsule.id)

      if (updateError) {
        throw new Error(`Supabase update error: ${updateError.message}`)
      }

      console.log(`  Status updated to "delivered"`)
      results.delivered++
    } catch (err) {
      console.error(`  Failed for capsule ${capsule.id}:`, err.message)
      results.failed++
      results.errors.push({ capsuleId: capsule.id, error: err.message })
    }
  }

  console.log('=== Cron Complete ===', results)
  return res.status(200).json(results)
}
