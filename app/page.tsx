"use client"; // Enables React Server Components in Next.js

// Import necessary Libraries & Dependencies
import React, { useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Define Exported Dashboard Page
export default function DashboardPage() {
  const router = useRouter(); // Setting up the router
  const supabase = createClient(); // Creating Supabase instance

  // Redirecting to Login page if user not logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [supabase.auth, router]);

  return (
    <Dashboard /> // Dashboard Component
  );
}
