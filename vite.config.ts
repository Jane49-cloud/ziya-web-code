import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router", "react-router-dom"],
          antd: ["antd", "@ant-design/icons"],
          charts: ["recharts", "@ant-design/plots"],
          tiptap: [
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@tiptap/extension-placeholder",
            "@tiptap/extension-image",
            "@tiptap/extension-table",
            "@tiptap/extension-link",
            "@tiptap/extension-underline",
          ],
        },
      },
    },
  },
});
