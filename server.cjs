const path = require('node:path');

process.env.NODE_ENV = 'production';

const express = require('express');
const { createRequestHandler } = require('expo-server/adapter/express');

const app = express();
const clientBuildDirectory = path.join(process.cwd(), 'dist/client');
const serverBuildDirectory = path.join(process.cwd(), 'dist/server');

app.disable('x-powered-by');
app.get('/healthz', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});
app.use(
  express.static(clientBuildDirectory, {
    extensions: ['html'],
    maxAge: '1h',
  }),
);
app.all('/{*path}', createRequestHandler({ build: serverBuildDirectory }));

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => {
  console.info(`Adventure Escape server listening on port ${port}.`);
});
