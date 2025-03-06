"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useEffect, useState } from "react";
import {
  IconMoon,
  IconMoonFilled,
  IconSun,
  IconSunFilled,
} from "@tabler/icons-react";
import Tooltip from "./Tooltip";
import { motion, AnimatePresence } from "framer-motion";

// Define and export the ThemeToggle Component
export default function ThemeToggle({
  className = "fixed bottom-7 right-7 z-50", // Bottom right fixed position
}: {
  // TypeScript className Type
  className?: string;
}) {
  // State to track darkMode status
  const [darkMode, setDarkMode] = useState(false);
  // State to track hover status to change theme icon
  const [hovered, setHovered] = useState(false);

  // Check localStorage for a saved theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    // Apply dark mode class to <html>
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true); // Set darkMode status to true
    }
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    if (darkMode) {
      // Remove dark mode class and set theme to localStorage
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // Apply dark mode class and set to localStorage
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode); // Set darkMode status to true
  };

  return (
    <div className={`${className}`}>
      {/* Tooltip to show 'Light Mode' or 'Dark Mode' text on hover */}
      <Tooltip text={darkMode ? "Light Mode" : "Dark Mode"} disabled={false}>
        <button
          onClick={toggleTheme} // Toggle theme on click
          onMouseEnter={() => setHovered(true)} // Track hover state
          onMouseLeave={() => setHovered(false)}
          className="p-2 flex items-center justify-center w-10 rounded-full transition
          duration-200 border border-t-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)]
           dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800
            dark:text-white z-50"
        >
          <div className="relative w-6 h-6">
            {/* AnimatePresence ensures smooth icon transitions */}
            <AnimatePresence mode="wait">
              {darkMode ? (
                // If dark mode is active, display the sun icon
                <motion.div
                  key="sun"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {hovered ? (
                    // Filled sun icon when hovered
                    <IconSunFilled strokeWidth={1.75} className="w-6 h-6" />
                  ) : (
                    // Normal Sun Icon when not hovered
                    <IconSun strokeWidth={1.75} className="w-6 h-6" />
                  )}
                </motion.div>
              ) : (
                // If light mode is active, display the moon icon
                <motion.div
                  key="moon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {hovered ? (
                    // Filled moon icon when hovered
                    <IconMoonFilled
                      strokeWidth={1.75}
                      className="text-neutral-500 w-6 h-6"
                    />
                  ) : (
                    // Normal moon icons when not hovered
                    <IconMoon
                      strokeWidth={1.75}
                      className="text-neutral-500 w-6 h-6"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </Tooltip>
    </div>
  );
}
