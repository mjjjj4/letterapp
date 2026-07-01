import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

function emailShell(bodyContent) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#FFFBF5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBF5;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFBF5;border-radius:10px;overflow:hidden;border:1px solid rgba(77,0,0,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:#4D0000;padding:20px 16px;text-align:center;">
              <p style="margin:0;font-size:22px;color:#FFFBF5;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:1px;">The Letter</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:56px 48px;text-align:center;background:#FFFBF5;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#393232;padding:16px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#FFFBF5;font-family:Arial,sans-serif;">&copy; 2026 The Letter &nbsp;|&nbsp; hello@theletter.app</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function day3Html() {
  return emailShell(`
    <h1 style="margin:0 0 24px;font-size:28px;color:#4D0000;font-weight:normal;line-height:1.5;font-family:Georgia,serif;">
      Something is coming.
    </h1>
    <p style="margin:0;font-size:17px;color:#393232;line-height:1.9;">
      In three days, a message from your past self arrives.<br/>Get ready to reconnect.
    </p>
  `)
}

function day2Html() {
  return emailShell(`
    <h1 style="margin:0 0 24px;font-size:28px;color:#4D0000;font-weight:normal;line-height:1.5;font-family:Georgia,serif;">
      Do you remember who you were?
    </h1>
    <p style="margin:0;font-size:17px;color:#393232;line-height:1.9;">
      Two days until your capsule opens.<br/>Think about who you were when you wrote it.
    </p>
  `)
}

function day1Html() {
  return emailShell(`
    <h1 style="margin:0 0 24px;font-size:28px;color:#4D0000;font-weight:normal;line-height:1.5;font-family:Georgia,serif;">
      Tomorrow.
    </h1>
    <p style="margin:0;font-size:17px;color:#393232;line-height:1.9;">
      Tomorrow at 9am, your capsule opens.<br/>Tonight, prepare yourself.
    </p>
  `)
}

// Returns the target date string (YYYY-MM-DD UTC) that is `daysAhead` days from today
function targetDate(daysAhead) {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() + daysAhead)
  return d.toISOString().split('T')[0]
}

export default async function handler(req, res) {
  console.log('=== Countdown Emails Cron Started ===', new Date().toISOString())

  const authHeader = req.headers.authorization
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.error('Unauthorized cron request')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' })
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  }

  // Determine which emails to send based on UTC hour:
  // Morning run (14:00 UTC = 9am EST): send Day -3 and Day -2 emails
  // Evening run (23:00 UTC = 6pm EST): send Day -1 email
  const utcHour = new Date().getUTCHours()
  const isEveningRun = utcHour >= 20

  const emailJobs = isEveningRun
    ? [{ daysAhead: 1, subject: 'Tomorrow', html: day1Html() }]
    : [
        { daysAhead: 3, subject: 'Something is coming', html: day3Html() },
        { daysAhead: 2, subject: 'Do you remember who you were?', html: day2Html() },
      ]

  console.log(`Run type: ${isEveningRun ? 'evening (Day -1)' : 'morning (Day -3, Day -2)'}`)

  const results = { sent: 0, failed: 0, errors: [] }

  for (const job of emailJobs) {
    const date = targetDate(job.daysAhead)
    console.log(`Checking Day -${job.daysAhead}: deliver_at = ${date}`)

    const { data: capsules, error: fetchError } = await supabaseAdmin
      .from('capsules')
      .select('id, user_id')
      .eq('status', 'sealed')
      .eq('deliver_at', date)

    if (fetchError) {
      console.error(`Failed to fetch capsules for Day -${job.daysAhead}:`, fetchError.message)
      results.errors.push({ day: job.daysAhead, error: fetchError.message })
      continue
    }

    console.log(`  Found ${capsules?.length ?? 0} capsule(s) for Day -${job.daysAhead}`)

    for (const capsule of capsules ?? []) {
      try {
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(capsule.user_id)

        if (userError || !userData?.user?.email) {
          throw new Error(`Could not fetch email for user_id ${capsule.user_id}: ${userError?.message}`)
        }

        const userEmail = userData.user.email
        console.log(`  [Day -${job.daysAhead}] Sending to: ${userEmail} (capsule ${capsule.id})`)

        const { error: emailError } = await resend.emails.send({
          from: 'The Letter <noreply@theletter.app>',
          to: userEmail,
          subject: job.subject,
          html: job.html,
        })

        if (emailError) {
          throw new Error(`Resend error: ${emailError.message}`)
        }

        console.log(`  [Day -${job.daysAhead}] Sent ✓`)
        results.sent++
      } catch (err) {
        console.error(`  [Day -${job.daysAhead}] Failed for capsule ${capsule.id}:`, err.message)
        results.failed++
        results.errors.push({ day: job.daysAhead, capsuleId: capsule.id, error: err.message })
      }
    }
  }

  console.log('=== Countdown Cron Complete ===', results)
  return res.status(200).json(results)
}
