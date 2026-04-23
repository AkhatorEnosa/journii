# Supabase Setup Guide for Journii

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a project name and database password
3. Wait for the project to be created

## 2. Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  pnl NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON public.trades(date);
CREATE INDEX IF NOT EXISTS idx_trades_user_date ON public.trades(user_id, date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trades_updated_at
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Since we're using Clerk for authentication (not Supabase Auth),
-- we need to use policies that work with the anon key.
-- Option 1: Allow all operations for authenticated users (recommended for development)
-- Option 2: Use a service role key in your backend (recommended for production)

-- For development with Clerk + Supabase, we'll allow all operations
-- The user_id is still stored for tracking purposes, but RLS doesn't enforce it
-- since auth.uid() returns NULL when using Clerk

-- Create RLS policies that allow all users to perform all operations
-- This is acceptable for development since Clerk handles authentication
CREATE POLICY "Enable all access for trades table"
  ON public.trades
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want to enforce user_id matching, you would need to:
-- 1. Use Supabase Auth alongside Clerk
-- 2. Or create a custom function that validates the user_id
-- 3. Or use a backend API route with service role key
```

## 3. Get Supabase Credentials

1. Go to your project settings
2. Navigate to API section
3. Copy the following:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 4. Update Environment Variables

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 5. Test the Integration

1. Run `npm run build` to ensure no TypeScript errors
2. Start the development server with `npm run dev`
3. Log in and try creating a trade
4. Check your Supabase dashboard to verify the trade was stored

## 6. (Optional) Set up Supabase Auth with Clerk

If you want to use Supabase Auth alongside Clerk, you'll need to:

1. Create a Supabase user for each Clerk user
2. Link the Clerk user ID with the Supabase user ID
3. Update the RLS policies to work with your auth setup

For now, we're using Clerk for authentication and just storing the Clerk user ID in the `user_id` field.

## 7. Migration from Local Storage

The application will automatically use Supabase when the environment variables are set. Existing local storage data will not be automatically migrated. If you need to migrate existing data, you can:

1. Export data from localStorage
2. Use Supabase's import feature or write a migration script
3. Import the data into the trades table

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**: Make sure the RLS policies are correctly set up
2. **Environment Variables**: Double-check that the environment variables are correctly set
3. **CORS Issues**: Ensure your Supabase project allows requests from your domain
4. **Date Format**: The date field expects YYYY-MM-DD format

### Debugging:

1. Check the browser console for any errors
2. Use Supabase's query builder to verify data
3. Test the connection using Supabase's built-in tools