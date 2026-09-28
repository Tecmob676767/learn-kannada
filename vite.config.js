import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sendOtpEmail } from './api/send-otp.js';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all environment variables (including non-VITE_ ones) into process.env
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    base: '/',
    plugins: [
      react(),
      {
        name: 'api-otp-server',
        configureServer(server) {
          server.middlewares.use('/api/send-otp', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              return res.end();
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Method not allowed' }));
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              try {
                const parsed = JSON.parse(body || '{}');
                const result = await sendOtpEmail(parsed);
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
