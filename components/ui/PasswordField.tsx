import React from "react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";

export default function PasswordField({
  // State Parameters
  password,
  setPassword,
  showPassword,
  setShowPassword,
  label,
  labelText,
  className, // Extra className styles for field
  labelClassName, // Extra className styles for label
}: {
  // TypeScript Paramter Types
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  label?: boolean;
  labelText?: string;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <>
      {label && (
        <label
          htmlFor="password"
          className={`block text-sm leading-6 text-neutral-700 dark:text-neutral-400 mt-2 ${labelClassName}`}
        >
          {labelText}
        </label>
      )}

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"} // Show password based on showPassword state
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password
          placeholder="••••••••"
          className={`block w-full bg-gray-100 dark:bg-neutral-800 px-4 rounded-md border dark:border-neutral-700 py-1.5 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)_inset] shadow-input text-black dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 ${className}`}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)} // Show passward if Eye is pressed
          className="absolute inset-y-0 right-3 text-gray-500 dark:text-white-400"
        >
          {/* Updating Eye Icon when Password is shown or hidden */}
          {showPassword ? (
            <IconEye className="h-5 w-5" />
          ) : (
            <IconEyeClosed className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}
