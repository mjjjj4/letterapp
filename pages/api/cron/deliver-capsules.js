import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://letterapp-black.vercel.app').replace(/\/$/, '')

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
          <tr>
            <td style="background:#4D0000;padding:20px 16px;text-align:center;">
              <p style="margin:0;font-size:22px;color:#FFFBF5;font-family:Georgia,'Times New Roman',serif;font-weight:normal;letter-spacing:1px;">The Letter</p>
            </td>
          </tr>
          ${bodyContent}
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

function selfDeliveryEmailHtml(capsule) {
  return emailShell(`
    <tr>
      <td style="padding:48px 48px 32px;text-align:center;">
        <p style="margin:0 0 20px;font-size:13px;letter-spacing:3px;color:#8A2323;text-transform:uppercase;font-family:Arial,sans-serif;">Your capsule has arrived</p>
        <h1 style="margin:0;font-size:30px;color:#4D0000;font-weight:normal;line-height:1.4;font-family:Georgia,serif;">
          A message from your past self<br/>has arrived.
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 48px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#F5E8E8;border-left:3px solid #8A2323;border-radius:4px;padding:18px 22px;">
              <p style="margin:0;font-size:18px;color:#3A2418;font-style:italic;">&ldquo;${capsule.title}&rdquo;</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 48px 40px;text-align:center;">
        <p style="margin:0 0 36px;font-size:17px;color:#3A2418;line-height:1.8;font-family:Arial,sans-serif;">
          You wrote this for the person you are today.<br/>Take a moment, then open it.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:#8A2323;border-radius:8px;text-align:center;">
              <a href="${APP_URL}/capsule/${capsule.id}"
                 style="display:inline-block;padding:18px 48px;font-size:16px;color:#FFFBF5;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">
                Open My Capsule
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `)
}

function giftDeliveryEmailHtml(capsule) {
  return emailShell(`
    <tr>
      <td style="padding:48px 48px 32px;text-align:center;">
        <p style="margin:0 0 20px;font-size:13px;letter-spacing:3px;color:#8A2323;text-transform:uppercase;font-family:Arial,sans-serif;">A gift has arrived</p>
        <h1 style="margin:0;font-size:30px;color:#4D0000;font-weight:normal;line-height:1.4;font-family:Georgia,serif;">
          Your gift from<br/><em>${capsule.gift_from_name}</em> is ready.
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 48px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#F5E8E8;border-left:3px solid #8A2323;border-radius:4px;padding:18px 22px;">
              <p style="margin:0;font-size:18px;color:#3A2418;font-style:italic;">&ldquo;${capsule.title}&rdquo;</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 48px 40px;text-align:center;">
        <p style="margin:0 0 36px;font-size:17px;color:#3A2418;line-height:1.8;font-family:Arial,sans-serif;">
          ${capsule.gift_from_name} wrote this for you.<br/>Open it when you&rsquo;re ready.
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="background:#8A2323;border-radius:8px;text-align:center;">
              <a href="${APP_URL}/capsule/${capsule.id}"
                 style="display:inline-block;padding:18px 48px;font-size:16px;color:#FFFBF5;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;letter-spacing:0.5px;">
                Open My Gift
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `)
}

export default async function handler(req, res) {
  console.log('=== Deliver Capsules Cron Started ===', new Date().toISOString())

  const authHeader = req.headers.authorization
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.error('Unauthorized cron request')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' })
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' })
  }

  const today = new Date().toISOString().split('T')[0]
  console.log('Checking for capsules to deliver on:', today)

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
    console.log(`Processing capsule: ${capsule.id} — "${capsule.title}"${capsule.is_gift ? ' [GIFT]' : ''}`)

    try {
      let recipientEmail
      let subject
      let html

      if (capsule.is_gift && capsule.gift_recipient_email) {
        // Gift: deliver to the recipient, not the capsule owner
        recipientEmail = capsule.gift_recipient_email
        subject = `Your gift from ${capsule.gift_from_name} is ready! 🎁`
        html = giftDeliveryEmailHtml(capsule)
        console.log(`  Gift delivery to recipient: ${recipientEmail}`)
      } else {
        // Self capsule: deliver to the capsule owner
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(capsule.user_id)
        if (userError || !userData?.user?.email) {
          throw new Error(`Could not fetch user email for user_id ${capsule.user_id}: ${userError?.message}`)
        }
        recipientEmail = userData.user.email
        const deliveryDateFormatted = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
          timeZone: 'UTC',
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
        subject = `Your capsule is ready — ${deliveryDateFormatted}`
        html = selfDeliveryEmailHtml(capsule)
        console.log(`  Self delivery to: ${recipientEmail}`)
      }

      const { error: emailError } = await resend.emails.send({
        from: 'The Letter <noreply@theletter.app>',
        to: recipientEmail,
        subject,
        html,
      })

      if (emailError) {
        throw new Error(`Resend error: ${emailError.message}`)
      }

      console.log(`  Email sent successfully`)

      const { error: updateError } = await supabaseAdmin
        .from('capsules')
        .update({ status: 'delivered', delivered_at: new Date().toISOString() })
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
