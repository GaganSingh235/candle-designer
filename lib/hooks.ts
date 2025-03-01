// Import necessary libraries and dependencies
import React, { useEffect } from "react";

// Define exported hook to detect clicks outside of two referenced elements
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>, // First reference
  ref2: React.RefObject<HTMLElement | null>, // Second reference
  callback: () => void // Function to execute when clicking outside both elements
) {
  useEffect(() => {
    // Handle clicks outside specified elements
    function handleClickOutside(event: MouseEvent) {
      // Check if both refs exist and the clicked target is outside both elements
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        ref2.current &&
        !ref2.current.contains(event.target as Node)
      ) {
        callback(); // Execute provided callback function
      }
    }

    // Event listener to detect clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup to remove event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, ref2, callback]); // Re-run effect if any parameters change
}
