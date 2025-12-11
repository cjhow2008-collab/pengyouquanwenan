import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/zhipu-api': {
          target: 'https://open.bigmodel.cn/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/zhipu-api/, '')
        }
      }
    },
    // Mock Vercel Serverless Function for Local Dev
    configureServer: (server) => {
      server.middlewares.use('/api/zhipu-token', async (req, res, next) => {
        try {
          const { SignJWT } = await import('jose');
          const apiKey = env.VITE_ZHIPU_API_KEY || "66321099747d436885cb4c73732c4b70.peCjC0n85E9IucU9";
          const [id, secret] = apiKey.split('.');
          const secretKey = new TextEncoder().encode(secret);
          const token = await new SignJWT({ api_key: id, timestamp: Date.now() })
            .setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' })
            .setExpirationTime('5m')
            .sign(secretKey);

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ token }));
        } catch (e) {
          console.error("Local Token Gen Error:", e);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Local Token Gen Failed" }));
        }
      });
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
