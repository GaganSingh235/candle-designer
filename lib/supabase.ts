// Import createBrowserClient function from installed Supabase package
import { createBrowserClient } from "@supabase/ssr";

// Define exported function to create Supabase client instance
export const createClient = () =>
  createBrowserClient(
    // Use env variables to securely store Supabase URL and anonymous key
    process.env.NEXT_PUBLIC_URL!,
    process.env.NEXT_PUBLIC_ANON_KEY!
  );
