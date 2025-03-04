"use client"; // Enables React Server Components in Next.js

// Import necessary Libraries & Dependencies
import React, { useEffect, useState } from "react";
import Dashboard from "@/components/Dashboard";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

// Define Exported Dashboard Page
export default function DashboardPage() {
  const router = useRouter(); // Setting up the router
  const supabase = createClient(); // Creating Supabase instance
  const [loading, setLoading] = useState(true); // Loading state

  // Redirecting to Login page if user not logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false); // Otherwise stop laoding screen
      }
    });
  }, [supabase.auth, router]);

  // Show loading screen when loading
  if (loading) {
    return (
      <Loader
        // Loading steps
        loadingStates={[
          "Loading Account",
          "Setting Up Dashboard",
          "Finalising Setup",
        ]}
      />
    );
  }

  return (
    <Dashboard /> // Display Dashboard Component
  );
}
