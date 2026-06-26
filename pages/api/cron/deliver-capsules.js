import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = 'https://letterapp-black.vercel.app'

function deliveryEmailHtml(capsule) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your capsule has arrived</title>
</head>
<body style="margin:0;padding:0;background:#FFE6E1;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFE6E1;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EDBFC6;">

          <!-- Header -->
          <tr>
            <td style="padding:48px 48px 32px;text-align:center;">
              <p style="margin:0 0 20px;font-size:13px;letter-spacing:3px;color:#952323;text-transform:uppercase;font-family:Arial,sans-serif;">The Letter</p>
              <h1 style="margin:0;font-size:30px;color:#393232;font-weight:normal;line-height:1.4;">
                A message from your past self<br/>has arrived.
              </h1>
            </td>
          </tr>

          <!-- Capsule title -->
          <tr>
            <td style="padding:0 48px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#FFE6E1;border-left:3px solid #952323;border-radius:4px;padding:18px 22px;">
                    <p style="margin:0;font-size:18px;color:#393232;font-style:italic;">&ldquo;${capsule.title}&rdquo;</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 48px 40px;text-align:center;">
              <p style="margin:0 0 36px;font-size:17px;color:#555;line-height:1.8;">
                You wrote this for the person you are today.<br/>Take a moment, then open it.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#952323;border-radius:8px;text-align:center;">
                    <a href="${APP_URL}/capsule/${capsule.id}"
                       style="display:inline-block;padding:18px 48px;font-size:16px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">
                      Open My Capsule
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf8f7;padding:24px 48px;border-top:1px solid #EDBFC6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.8;font-family:Arial,sans-serif;">
                The Letter &mdash; Time capsules for your future self.
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
        html: deliveryEmailHtml(capsule),
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
