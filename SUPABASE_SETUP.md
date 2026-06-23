# Supabase Setup Guide

## Database Tables

The following tables have been created in your Supabase project:
- `users` — Stores user account information
- `capsules` — Stores time capsule data

## Storage Bucket (Optional)

To enable photo/video uploads for time capsules:

### 1. Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it `capsule-files`
5. Keep it **Private** (RLS will handle access)
6. Click **Create bucket**

### 2. Set Up Storage RLS Policies

After creating the bucket, click on it and go to **Policies** tab. Create these policies:

**Allow users to upload their own files:**
```sql
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'capsule-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Allow users to view their own files:**
```sql
CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'capsule-files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. (Optional) Add File Path Column to Capsules

If you want to track which file belongs to each capsule, run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE capsules ADD COLUMN file_path TEXT;
```

Then update `pages/create.js` to uncomment the `file_path` line in the capsuleData object.

## Environment Variables

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication

Email/Password authentication is enabled by default in Supabase. Users can sign up and log in using the signup and login pages.

To enable other auth methods (Google, GitHub, etc.):
1. Go to **Authentication** → **Providers**
2. Enable your desired provider
3. Add the provider credentials

## Ready to Go!

Your app is now ready to use. Run:

```bash
npm install
npm run dev
```

Then visit `http://localhost:3000` to test!
