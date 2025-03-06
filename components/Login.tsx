"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PasswordField from "./ui/PasswordField";

// Define Exported Login Component
export default function Login() {
  const router = useRouter(); // Set up page router
  const supabase = createClient(); // Set up Supabase Connection

  // Setting variables for User fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initial loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isClicked, setIsClicked] = useState(false); // Click status tracker

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent Page Refresh

    setLoading(true); // Start Loading
    setError(""); // Set errors to be empty

    if (!email || !password) {
      return setError("All fields must be filled in.");
    }

    // Attempt to login the user
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Set and display errors
      if (error) {
        setError(`Error: ${error}`);
        setLoading(false);
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(`An error occurred during login. ${error}`);
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  return (
    <div className="relative w-full z-0 overflow-hidden bg-white dark:bg-neutral-950">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-10 blur-sm z-0"
        style={{
          backgroundImage: "url('/images/login.jpg')", // Background Login Image
        }}
      />
      {/* Login Form in the Centre */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex h-screen max-w-lg flex-col items-center justify-center"
      >
        <Logo className="pl-5" src="/logo/short.png" width={100} />
        <h1 className="mt-4 mb-2 text-xl font-bold text-neutral-800 dark:text-white md:text-4xl z-50">
          Log into your account
        </h1>

        {/* Email Field */}
        <motion.input
          // When "Continue with Email" is clicked, fields animate into appearance
          initial={{
            height: "0px",
            opacity: 0,
          }}
          animate={{
            height: isClicked ? "38px" : "0px",
            opacity: isClicked ? 1 : 0,
            marginTop: isClicked ? "24px" : "0px",
          }}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email
          placeholder="hello@johndoe.com"
          className="block w-80 md:w-full rounded-md border dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] px-4 pl-4 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 mb-2 z-50"
          required
        />

        {/* Password Fields */}
        <motion.div
          // When "Continue with Email" is clicked, fields animate into appearance
          initial={{
            height: "0px",
            opacity: 0,
          }}
          animate={{
            height: isClicked ? "38px" : "0px",
            opacity: isClicked ? 1 : 0,
          }}
          className="relative w-80 md:w-full"
        >
          <PasswordField
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            className="mt-0"
          />
        </motion.div>

        {/* Display any errors */}
        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
        <Button
          // Track clicks and handle Login Logic
          onClick={(e) => {
            if (!isClicked) return setIsClicked(true);
            handleSubmit(e);
          }}
          className="w-80 md:w-full rounded-lg bg-[#334EB4] dark:bg-white hover:bg-black dark:hover:bg-white px-4 py-2.5 text-white dark:text-black dark:hover:text-black text-sm mt-2"
          color="whiteBlack"
        >
          {loading ? "Logging In..." : "Continue with Login"}{" "}
          {/* Display default and loding text*/}
        </Button>

        {/* Sign Up Link */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-4 z-50">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/sign-up"
            className="text-black dark:text-white hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
      <ThemeToggle /> {/* Theme Toggle */}
    </div>
  );
}
