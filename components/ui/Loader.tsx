"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconCircleCheck, IconCircleCheckFilled } from "@tabler/icons-react";

// Define exported Loader component
export default function Loader({
  // Parameters
  loadingStates, // Loading text arrary
  duration = 1000,
  loop = true,
}: {
  // TypeScript Paramter Types
  loadingStates: string[];
  duration?: number;
  loop?: boolean;
}) {
  const [currentState, setCurrentState] = useState(0); // Track current load step

  // Effect to go through each load state after set interval
  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentState(
        (prevState) =>
          loop
            ? prevState === loadingStates.length - 1
              ? 0 // Restar if looping
              : prevState + 1
            : Math.min(prevState + 1, loadingStates.length - 1) // Stop at least once if not looping
      );
    }, duration);

    // Cleanup function to clear timeout on component unount or update
    return () => clearTimeout(timeout);
  }, [currentState, loop, loadingStates.length, duration]);

  return (
    // Smooth transitions when components mount/unmount
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl"
      >
        <div className="h-96 relative flex flex-col justify-start max-w-xl mx-auto mt-40">
          {/* Iterate through each loading state */}
          {loadingStates.map((loadingState, index) => {
            const distance = Math.abs(index - currentState); // Distance from current state
            const opacity = Math.max(1 - distance * 0.2, 0); // Distance from current state

            return (
              <motion.div
                key={index}
                className="text-left flex gap-2 mb-4"
                initial={{ opacity: 0, y: -(currentState * 40) }}
                animate={{ opacity, y: -(currentState * 40) }}
                transition={{ duration: 0.5 }}
              >
                {/* Status icon for each loading state */}
                <div>
                  {index > currentState ? ( // To-do steps show an outlined check icon
                    <IconCircleCheck className="text-black dark:text-white" />
                  ) : (
                    <IconCircleCheckFilled
                      className={`text-black dark:text-white ${
                        currentState === index
                          ? "text-black dark:text-[#344DB6] opacity-100"
                          : ""
                      }`}
                    />
                  )}
                </div>

                {/* Display the loading message */}
                <span
                  className={`text-black dark:text-white ${
                    currentState === index
                      ? "text-black dark:text-[#344DB6] opacity-100"
                      : ""
                  }`}
                >
                  {loadingState} {/* Display loading state */}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Background gradient for a smooth UI effect */}
        <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
      </motion.div>
    </AnimatePresence>
  );
}
