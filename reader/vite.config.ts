import { defineConfig, type Plugin } from 'vite';

const GOOGLE_DRIVE_FILE_ID = /^[A-Za-z0-9_-]{1,200}$/;

function googleDriveDevProxy(): Plugin {
  return {
    name: 'biblioteca-google-drive-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET') {
          next();
          return;
        }

        const path = request.url?.split('?')[0] ?? '';
        if (!path.startsWith('/api/google-drive/')) {
          next();
          return;
        }
        const fileId = decodeURIComponent(path.replace('/api/google-drive/', ''));
        if (!GOOGLE_DRIVE_FILE_ID.test(fileId)) {
          response.statusCode = 400;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ error: 'Invalid Google Drive file ID.' }));
          return;
        }

        try {
          let upstream = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
          if ((upstream.headers.get('content-type') ?? '').includes('text/html')) {
            upstream = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`);
          }
          if (!upstream.ok) throw new Error(`Google Drive returned ${upstream.status} ${upstream.statusText}`);

          const bytes = new Uint8Array(await upstream.arrayBuffer());
          const signature = new TextDecoder().decode(bytes.slice(0, 4));
          if (signature !== '%PDF') throw new Error('Google Drive did not return a PDF publication.');

          response.statusCode = 200;
          response.setHeader('Content-Type', 'application/pdf');
          response.setHeader('Content-Length', String(bytes.byteLength));
          response.setHeader('Content-Disposition', 'inline');
          response.setHeader('Cache-Control', 'no-store');
          response.end(bytes);
        } catch (error) {
          response.statusCode = 502;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({
            error: 'The Google Drive publication could not be loaded through the local development proxy.',
            detail: error instanceof Error ? error.message : 'Unknown upstream error',
          }));
        }
      });
    },
  };
}

export default defineConfig({
  root: 'demo',
  plugins: [googleDriveDevProxy()],
  server: {
    fs: { allow: ['..'] },
  },
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
});
