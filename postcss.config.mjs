/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // Use the dedicated PostCSS plugin package
    // autoprefixer: {}, // Add if needed, often handled by Next.js
  },
};

export default config;
