import type { Config } from "tailwindcss";

// Tailwind v4: JavaScript/TypeScript config is no longer the primary method.
// Theme, plugins, etc., should be defined in your main CSS file using @theme, @utility, etc.
// This file can often be removed entirely if not using @config in CSS,
// or kept minimal like this if needed for specific tooling integrations.
export default {
    darkMode: ["class"],
    content: [
        // Ensure paths cover all files using Tailwind classes
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Example: If using pages router
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        // Add other paths if necessary
    ],
    // theme: {}, // REMOVED - Define in globals.css @theme
    // plugins: [], // REMOVED - Define custom utilities/components in globals.css
} satisfies Config;