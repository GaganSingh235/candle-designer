"use client"; // Enables React Server Components

// Importing necessary libraries & Components
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Define and export the Tooltip Component
export default function Tooltip({
  // Parameters
  children,
  text,
  position = "top",
  distance = 10,
}: {
  // TypeScript parameter types
  className?: string;
  children: React.ReactNode;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  distance?: number;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false); // State to track Hover Status
  const [isMobile, setIsMobile] = useState(false); // State to track mobile screen status
  let timeout: NodeJS.Timeout | null = null; // Timeout reference for autohiding on mobile

  // Check if the user is on a mobile device
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  // Handle touch interactions for mobile devices
  const handleTouchStart = () => {
    setHovered(true);
    if (isMobile) {
      if (timeout) clearTimeout(timeout); // Clear existing timeout
      timeout = setTimeout(() => setHovered(false), 1000); // Hide tooltip after 1 sec
    }
  };

  // Positon styles for tooltip location relative to object
  const positionStyles = {
    top: {
      bottom: `calc(100% + ${distance}px)`,
      transform: "translateX(-50%)",
    },
    bottom: {
      top: `calc(100% + ${distance}px)`,
      transform: "translateX(-50%)",
    },
    left: {
      top: "50%",
      right: `calc(100% + ${distance * 2}px)`,
      transform: "translateY(-50%)",
    },
    right: {
      top: "50%",
      left: `calc(100% + ${distance * 2}px)`,
      transform: "translateY(-50%)",
    },
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)} // Track hover state
      onMouseLeave={() => setHovered(false)}
      onTouchStart={handleTouchStart} // Handle touch logic for mobile users
      className="relative flex items-center justify-center"
    >
      {/* AnimatePresence ensures smooth entry/exit animations */}
      <AnimatePresence>
        {/* Show tooltip when hovered on element */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-2 py-0.5 z-50 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute w-fit text-xs"
            style={positionStyles[position]}
          >
            {text} {/* Tooltip text */}
          </motion.div>
        )}
      </AnimatePresence>
      {children}{" "}
      {/* Wrapped child element / object tooltip is being applied to */}
    </div>
  );
}
