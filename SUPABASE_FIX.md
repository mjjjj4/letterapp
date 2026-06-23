# Foreign Key Constraint Fix

## Problem
When creating a capsule, you get: `"insert or update on table 'capsules' violates foreign key constraint 'capsules_user_id_fkey'"`

This happens because:
- Users are created in Supabase's `auth.users` table when they sign up
- But your custom `users` table is empty
- When creating a capsule, the app tries to use `auth.users.id` as `capsules.user_id`
- The foreign key constraint fails because that ID doesn't exist in the custom `users` table

## Solution

### Option 1: Create an Auto-Trigger (Recommended)

Run this SQL in your Supabase SQL Editor to automatically create a user record when someone signs up:

```sql
-- Create a trigger function to add user to custom users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**This will automatically create a user record in the `users` table whenever someone signs up.**

### Option 2: Manually Add Existing Users

If you already have users who signed up before this fix, run:

```sql
INSERT INTO public.users (id, email, created_at)
SELECT id, email, created_at FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

### Option 3: Update Signup Page (Backup)

The signup page now also tries to insert into the users table. Make sure you have the latest version from GitHub.

## After Applying the Fix

1. Run the SQL above in your Supabase SQL Editor
2. Try signing up again (or sign up as a new user if you already have an account)
3. Create a capsule — it should work now!

## Why This Happens

Supabase's auth.users is separate from your custom tables. You need to either:
- Use a trigger to sync new users automatically (recommended)
- Manually insert after signup
- Use a user management API

The trigger approach is the cleanest and most reliable.
