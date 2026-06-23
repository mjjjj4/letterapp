# Supabase Diagnostic Guide

## Quick Fix: Manually Add Your User

If you already have an account, the trigger won't help (it only applies to NEW signups). 

**Run this SQL to add your existing account to the users table:**

```sql
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

Then try creating a capsule again.

---

## Verify the Trigger Was Created

Run this query to check if the trigger exists:

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'pg_catalog' OR trigger_schema = 'public'
ORDER BY trigger_name;
```

If you don't see `on_auth_user_created` in the results, the trigger wasn't created.

---

## Check What's in Your Tables

Run these queries one at a time to see what data exists:

**Check auth.users:**
```sql
SELECT id, email, created_at FROM auth.users;
```

**Check custom users table:**
```sql
SELECT id, email, created_at FROM public.users;
```

**See the mismatch:**
```sql
SELECT auth_users.id as auth_id, auth_users.email as auth_email,
       custom_users.id as custom_id, custom_users.email as custom_email
FROM auth.users auth_users
FULL OUTER JOIN public.users custom_users ON auth_users.id = custom_users.id
WHERE auth_users.id IS NULL OR custom_users.id IS NULL;
```

This will show you which users exist in auth.users but NOT in public.users.

---

## If the Trigger Still Doesn't Work

Try this alternative trigger syntax:

```sql
-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, new.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Immediate Workaround

1. **Sign up with a BRAND NEW email** that you haven't used before
2. Wait 5 seconds
3. Try creating a capsule immediately

If it works, the trigger is working (you just need to add your existing user). If it still fails, the trigger has an issue.

---

## Report Back With:

- [ ] Did the SQL insert query work? (Run the "manually add your user" query above)
- [ ] What error are you getting now when trying to create a capsule?
- [ ] When you ran the trigger SQL, did it say "Success"?
- [ ] Are you trying with an existing account or a brand new signup?
