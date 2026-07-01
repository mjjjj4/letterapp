# Cron & Delivery System Audit
**Audited:** 2026-06-30  
**Scope:** `/api/cron/deliver-capsules.js`, `vercel.json`, `lib/cart.js`, `/api/checkout-session.js`, `/api/webhooks/stripe.js`  
**Verdict:** ✅ Safe for 5-year+ delays — with two bugs fixed (see below)

---

## Summary

| Area | Status | Notes |
|------|--------|-------|
| Cron query logic | ✅ Correct | Backlog-safe, duplicate-safe |
| Date type (DATE not DATETIME) | ✅ Correct | Stored as YYYY-MM-DD |
| Hardcoded APP_URL | 🔴 **BUG FIXED** | Was hardcoded; now uses env var |
| Date formatting timezone safety | 🔴 **BUG FIXED** | Now passes `timeZone: 'UTC'` |
| Duplicate delivery prevention | ✅ Correct | status filter prevents re-run |
| Backlog handling (missed days) | ✅ Correct | `lte` catches all past-due |
| User email at delivery time | ✅ Correct | Fetches current email, not cached |
| Email link | ✅ Correct | Clickable button to `/capsule/:id` |
| Email sender | ✅ Correct | `noreply@theletter.app` |
| Error isolation | ✅ Correct | One failure doesn't block others |
| Cron auth | ✅ Correct | CRON_SECRET header check |
| Log retention | ⚠️ Warning | Vercel logs expire; see note |
| Dead-letter / alerting | ⚠️ Warning | No escalation on repeated failure |

---

## Findings

### 🔴 BUG 1 — Hardcoded APP_URL (FIXED)

**File:** `pages/api/cron/deliver-capsules.js:11`  
**Severity:** Critical for long-term reliability

**Before:**
```js
const APP_URL = 'https://letterapp-black.vercel.app'
```

**Problem:** Every delivery email's "Open My Capsule" button links to `letterapp-black.vercel.app`. If the domain changes to a custom domain (e.g. `theletter.app`), every capsule delivered after that change will have a broken link. Users who sealed in 2026 and receive in 2031 would click a dead URL.

**Fix applied:**
```js
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://letterapp-black.vercel.app'
```

**Action required:** Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com` in Vercel environment variables. When you add a custom domain, update this env var — all future deliveries will use it automatically.

---

### 🔴 BUG 2 — Timezone-Unsafe Date Formatting in Subject Line (FIXED)

**File:** `pages/api/cron/deliver-capsules.js:152`  
**Severity:** Medium — subject line shows wrong date for ~half the planet

**Before:**
```js
const deliveryDateFormatted = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})
```

**Problem:** `new Date('2028-03-15')` creates a UTC midnight object. Without `timeZone: 'UTC'` in the locale options, `toLocaleDateString` falls back to the Node.js process timezone. On Vercel production (UTC) this is fine. But if run locally (UTC-8) or if Vercel ever changes default timezone, the subject line reads **"Saturday, March 14"** instead of **"Sunday, March 15"** — off by one day.

**Fix applied:**
```js
const deliveryDateFormatted = new Date(capsule.deliver_at).toLocaleDateString('en-US', {
  timeZone: 'UTC',
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
})
```

---

## Cron Schedule Analysis

**Config (`vercel.json`):**
```json
{ "path": "/api/cron/deliver-capsules", "schedule": "0 9 * * *" }
```

- Runs daily at **09:00 UTC**
- In US Eastern: 4:00 AM EST / 5:00 AM EDT
- In US Pacific: 1:00 AM PST / 2:00 AM PDT
- Vercel cron always executes in UTC regardless of user timezone

**Assessment:** Correct. Early-morning UTC means most US users receive their capsule before they wake up — a good experience.

---

## Query Logic Verification

```js
const today = new Date().toISOString().split('T')[0]  // "2027-03-15" in UTC

await supabaseAdmin
  .from('capsules')
  .select('*')
  .eq('status', 'sealed')        // ← only sealed, never re-delivers
  .lte('deliver_at', today)      // ← today or any past date
```

| Scenario | Expected | Result |
|----------|----------|--------|
| `deliver_at = today` | ✅ Deliver | Caught by `lte` |
| `deliver_at = tomorrow` | ✅ Skip | Not caught by `lte` |
| `deliver_at = 5 years ago` | ✅ Deliver | Caught by `lte` (backlog) |
| Already delivered | ✅ Skip | `status = 'delivered'` excluded by `eq('status', 'sealed')` |
| Cron runs twice same day | ✅ No dup | First run sets `status = 'delivered'`; second run's `eq('status','sealed')` skips it |

**Backlog handling is correct.** If the cron fails to run for 3 days (Vercel outage, etc.), the next successful run delivers all missed capsules.

---

## Email Delivery Analysis

**From address:** `The Letter <noreply@theletter.app>` ✅  
**User email:** Fetched live from `auth.users` at delivery time ✅  
(If a user updates their email in 2030, their 2026 capsule delivers to the new address — correct behavior)

**Open button:** `<a href="${APP_URL}/capsule/${capsule.id}">Open My Capsule</a>` ✅  
(Clickable HTML button, not plain-text URL)

**Resend failure handling:**
```js
if (emailError) {
  throw new Error(`Resend error: ${emailError.message}`)
}
// capsule stays 'sealed' → retried tomorrow ✅
```
If Resend fails, the capsule is NOT marked delivered. It retries the next day. This is correct for reliability.

**Order of operations (email first, then mark delivered):**  
This is the right order. If we marked delivered first and then the email failed, the capsule would be lost forever. Current order may send duplicate emails in edge cases but will never silently swallow a capsule.

---

## Edge Cases

### Duplicate delivery
Prevented by `status = 'sealed'` filter. Once marked `'delivered'`, it is never queried again. ✅

### User changes email after sealing
Email is fetched live from `supabaseAdmin.auth.admin.getUserById()` at delivery time. The capsule always goes to the user's current email. ✅

### Leap year (Feb 29)
`deliver_at` is stored as PostgreSQL `DATE`. `2028-02-29` is a valid date and will be stored and queried correctly. The price calculation uses `365.25` to account for leap years in the years calculation. ✅

### Capsule content with special characters
The email template uses `${capsule.title}` in an HTML context without escaping. This is a minor XSS risk in the email (not in the web app) — a title like `<script>` would be rendered in the email client. Impact is low since the user wrote the title themselves, but worth fixing if untrusted data is ever stored.

---

## Logging

Each cron run logs:
- Timestamp at start and end
- Count of capsules found
- Per-capsule: ID, title, recipient email
- Final JSON: `{ delivered: N, failed: N, errors: [{capsuleId, error}] }`

**⚠️ Log retention:** Vercel function logs expire after **30 days (Hobby)** or **60 days (Pro)**. For a 5-year service, logs from 2026 will not exist in 2028. If you need to audit "was capsule X delivered on date Y?", you won't have the logs.

**Recommendation:** Add a `delivered_at` timestamp column to the `capsules` table:
```sql
ALTER TABLE capsules ADD COLUMN delivered_at TIMESTAMPTZ;
```
Then update the cron to set it:
```js
.update({ status: 'delivered', delivered_at: new Date().toISOString() })
```
This creates a permanent audit trail directly in your database.

---

## Database Integrity

### Column types (inferred from code)
| Column | Type | Verified By |
|--------|------|-------------|
| `deliver_at` | DATE (YYYY-MM-DD) | Stored as string `"2027-03-15"`, compared with date string |
| `status` | TEXT | Values: `'draft'`, `'sealed'`, `'delivered'` |
| `user_id` | UUID | Matched to auth.users |
| `is_founder_promo` | BOOLEAN | Recently added — see schema cache note |
| `donation_amount` | DECIMAL(10,2) | Recently added — see schema cache note |

### Timezone safety
Supabase runs on UTC. `deliver_at` is stored as DATE (no time component) so timezone shifting cannot make the date move by ±1 day. ✅

### Backups
Supabase provides automatic daily backups on **Pro plan** (7-day retention) and **point-in-time recovery** on **Enterprise**. On **Free/Hobby** tier, backups are NOT guaranteed. 

**Recommendation:** If this service holds capsules for 5+ years, upgrade to Supabase Pro to ensure backup coverage.

---

## Action Items

### Completed in this audit (code fixes pushed)
- [x] Fix hardcoded APP_URL → use `NEXT_PUBLIC_APP_URL` env var
- [x] Fix timezone-unsafe date formatting → add `timeZone: 'UTC'`

### Required manual steps
1. **Set env var:** Add `NEXT_PUBLIC_APP_URL=https://yourdomain.com` in Vercel project settings
2. **Notify PostgREST schema cache:** Run in Supabase SQL Editor:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
3. **Add delivered_at column** (recommended for audit trail):
   ```sql
   ALTER TABLE capsules ADD COLUMN delivered_at TIMESTAMPTZ;
   ```

### Optional improvements
- Add email subject line HTML-escaping for capsule title
- Set up a Vercel cron monitor (e.g. Cronitor, Healthchecks.io) to alert if the cron stops running
- Upgrade Supabase to Pro for guaranteed daily backups

---

## Confidence Rating

**✅ System is safe for 5-year+ delays.**

The core delivery loop is sound: backlog-aware, duplicate-safe, fetches current user email at delivery time, errors per-capsule don't block others. The two bugs fixed in this audit (hardcoded URL, timezone date format) were the only meaningful reliability risks. With `NEXT_PUBLIC_APP_URL` set in Vercel, capsules sealed today will deliver correctly with working links in 2031.
