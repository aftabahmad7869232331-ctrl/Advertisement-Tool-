import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

await app.register(helmet);

app.get('/api/health', async () => {
  return {
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
  };
});

const port = Number(process.env.API_PORT ?? 3000);
const host = process.env.API_HOST ?? '127.0.0.1';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
