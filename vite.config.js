import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' → the build works at any path (GitHub Pages subpath, Render, Cloudflare, file://)
export default defineConfig({ base: './', plugins: [react()], build: { outDir: 'dist' } });
