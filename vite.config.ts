import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Vercel injects environment variables into the Node process.env.
  // We check the loaded env vars first, then fallback to process.env.
  // This ensures we catch the key whether it's in a .env file or the system environment.
  const apiKey = env.API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.warn("⚠️  WARNING: API_KEY is missing in the build environment. The app will not function correctly.");
  } else {
    console.log("✅  API_KEY found in build environment. Injecting into client bundle.");
  }

  return {
    plugins: [react()],
    define: {
      // This specifically replaces 'process.env.API_KEY' with the string value of the key
      'process.env.API_KEY': JSON.stringify(apiKey),
      // This prevents "process is not defined" errors if other libraries access process.env
      'process.env': JSON.stringify({}),
    },
  };
});