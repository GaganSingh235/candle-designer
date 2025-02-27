// Import necessary Libraries & Dependencies
import React from "react";
import Image from "next/image";
import Link from "next/link";

// Define the reusable Logo component
export default function Logo({
  // Parameters
  href = "/", // link
  width = 200,
  className, // Additional classNames to style the Button
  withText = false, // State to display Logo text
  text = "Candle Designer",
  src, // Image Source
}: {
  // TypeScript Parameter Types
  href?: string;
  width?: number;
  className?: string;
  withText?: boolean;
  text?: string;
  src: string;
}) {
  return (
    <Link
      href={href} // Logo Link
      className={`relative z-20 mr-4 flex items-center space-x-2 
        px-2 py-1 text-sm font-normal text-black ${className}`}
    >
      {/* Logo Image */}
      <Image
        src={src}
        alt="logo"
        width={width}
        height={width}
        priority
        className="rounded-full"
      />
      {/* Display Logo Text */}
      {withText && (
        <span
          className="flex text-black dark:text-white
         font-semibold text-md pl-2"
        >
          {text}
        </span>
      )}
    </Link>
  );
}
