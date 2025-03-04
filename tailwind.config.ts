// Import the Config type from Tailwind CSS
import type { Config } from "tailwindcss";

export default {
  // Enable dark mode
  darkMode: "class",

  // Define the files where Tailwind should look for class usage
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
} satisfies Config; // Ensures that object satisfies the Tailwind Config type
