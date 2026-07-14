import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// 1. Proxy NVIDIA API requests (bypasses CORS)
app.use('/api-nvidia', createProxyMiddleware({
  target: 'https://integrate.api.nvidia.com',
  changeOrigin: true,
  pathRewrite: { '^/api-nvidia': '' },
}));

// 2. Proxy IMDb Search requests (bypasses CORS)
app.use('/api-imdb', createProxyMiddleware({
  target: 'https://imdb.iamidiotareyoutoo.com',
  changeOrigin: true,
  pathRewrite: { '^/api-imdb': '' },
}));

// 3. Serve the compiled static React files
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Fallback to index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
