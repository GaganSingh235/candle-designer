// For handling API responses in Next.js
import { NextResponse } from "next/server";
// Supabase client for database interactions
import { createClient } from "@supabase/supabase-js";

// Create a Supabase admin client using env variables
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_AUTH_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define exported POST requests to delete a user
export async function POST(req: Request) {
  try {
    // Parse JSON request body to extract userId
    const { userId } = await req.json();

    // Return error if no userId provided
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Attempt to delete the user from Supabase
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    // Return error if failed to delete user
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Otherwise return success response
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    // Catch and return any unexpected server errors
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
