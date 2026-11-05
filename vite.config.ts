/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { createClaudeMiddleware } from './server/claude.ts';

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const claude: Plugin = {
    name: 'claude-image-analysis',
    configureServer(server) {
      server.middlewares.use(createClaudeMiddleware({ apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL, workspaceId: env.ANTHROPIC_WORKSPACE_ID, allowedOrigin: env.CLAUDE_ALLOWED_ORIGIN }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createClaudeMiddleware({ apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL, workspaceId: env.ANTHROPIC_WORKSPACE_ID, allowedOrigin: env.CLAUDE_ALLOWED_ORIGIN }));
    },
  };
  return {
    base: './',
    plugins: [react(), claude],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
