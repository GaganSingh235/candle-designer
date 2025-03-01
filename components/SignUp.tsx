"use client"; // Enables React Server Components in Next.js

// Importing necessary libraries & Components
import React, { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import ThemeToggle from "./ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import PasswordField from "./ui/PasswordField";

// Actual SignUp Component
export default function SignUp() {
  const supabase = createClient(); // Connecting to Supabase

  // Setting variables for User fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false); // Loading State
  const [error, setError] = useState(""); // Error State

  // State to control Email Confirmation Message
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);

  // Handles Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent Page Refesh

    // Checking if fields are empty
    if (!firstName || !lastName || !email || !password) {
      return setError("All fields must be filled in.");
    }

    // Checking Password Length
    if (password.length < 8)
      return setError("Password must be at least 8 characters");

    // Checking Password Security
    if (!/[!@#$%^&*()-=_+,.<>/?'":;{}|]/.test(password)) {
      return setError("Password must contain at least one special character");
    }

    // Checking if password and confirmPassword match
    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }

    setLoading(true); // Start Loading
    setError("");

    // Attempt to create new User Account
    try {
      // Signing Up with User data
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      // Checking for Sign Up Errors
      if (signUpError) {
        return setError(
          signUpError.message.includes("users_email_key")
            ? "An account with this email already exists."
            : `Error saving user data. ${signUpError.message}`
        );
      }

      // Show the Email Confirmtion message
      setConfirmEmailOpen(true);

      // Catching & Displaying any errors
    } catch (error) {
      setError(`An error occurred during sign-up. ${error}`);
    } finally {
      setLoading(false); // Stop Loading
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-neutral-950">
      {/* Left section - Sign-up form */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center w-full justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div>
              <Logo src="/logo/long.png" width={200} />
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
                Sign up for an account
              </h2>
            </div>

            {/* Sign-Up Form */}
            <div className="mt-10">
              <div>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="first-name"
                        className="block text-sm font-medium leading-6 text-neutral-700 dark:text-white"
                      >
                        First Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="first-name"
                          name="firstName"
                          type="text"
                          value={firstName}
                          // Update FirstName
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="last-name"
                        className="block text-sm font-medium leading-6 text-neutral-700 dark:text-white"
                      >
                        Last Name
                      </label>
                      <div className="mt-2">
                        <input
                          id="last-name"
                          name="lastName"
                          type="text"
                          value={lastName}
                          // Update LastName
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-neutral-700 dark:text-white"
                    >
                      Email address
                    </label>

                    <div className="mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // Update Email
                        placeholder="hello@johndoe.com"
                        className="block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <PasswordField
                      password={password}
                      setPassword={setPassword}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      label
                      labelText="Password"
                    />
                  </div>

                  <div className="relative mt-2">
                    <PasswordField
                      password={confirmPassword}
                      setPassword={setConfirmPassword}
                      showPassword={showConfirmPassword}
                      setShowPassword={setShowConfirmPassword}
                      label
                      labelText="Confirm Password"
                    />
                  </div>

                  <div>
                    {/* Show any Errors */}
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#334EB4] dark:bg-white z-10 rounded-lg hover:bg-black text-white dark:text-black dark:hover:bg-white text-sm px-4 mt-10 py-2 flex items-center justify-center w-full"
                      color="whiteBlack"
                      onClick={handleSubmit} // Call handleSumbit when clicked
                    >
                      {loading ? "Signing Up..." : "Sign Up"}
                    </Button>

                    {/* Login Link */}
                    <p className="text-sm text-neutral-600 text-center mt-4">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-black dark:text-white hover:underline"
                      >
                        Log in
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Image with Message */}
      <div className="relative w-full z-20 hidden md:flex border-neutral-100 overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm"
          style={{ backgroundImage: "url('/images/sign-up.jpg')" }}
        />
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto text-black dark:text-white">
          <Logo src="/logo/icon.webp" width={100} />
          <p className="font-semibold text-5xl mt-4">Make a difference!</p>
          <p className=" mt-8">
            Join our community and start designing candles that bring joy and
            meaning to people&apos;s lives. Whether you&apos;re creating for
            yourself or contributing to a greater cause, your creativity makes
            an impact.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Email Confirmation Box */}
      <AnimatePresence>
        {confirmEmailOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg w-96"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Check your Email
              </h2>

              <p className="text-gray-800 dark:text-white mb-4">
                A confirmation link has been sent to you. Click it to access
                your dashboard.
              </p>
            </motion.div>
          </motion.div>
        )}
        <ThemeToggle /> {/* Display theme toggle */}
      </AnimatePresence>
    </div>
  );
}
