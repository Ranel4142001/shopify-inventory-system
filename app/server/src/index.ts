import { connectDatabase } from './db/client';
import { env } from './config/env';
import app from './app';

async function bootstrap(): Promise<void> {
  try {
    // Step 1: Connect to database first
    await connectDatabase();

    // Step 2: Start Express server
    app.listen(env.PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║       Tactile Lab API Server           ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Status:  Running                      ║`);
      console.log(`║  Port:    ${env.PORT}                         ║`);
      console.log(`║  Mode:    ${env.NODE_ENV}                  ║`);
      console.log('╠════════════════════════════════════════╣');
      console.log('║  Endpoints:                            ║');
      console.log('║  GET  /api/health                      ║');
      console.log('║  GET  /api/auth/install                ║');
      console.log('║  GET  /api/auth/callback               ║');
      console.log('║  GET  /api/dashboard                   ║');
      console.log('║  GET  /api/rules                       ║');
      console.log('║  GET  /api/scoring/ranked              ║');
      console.log('║  GET  /api/activity                    ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

bootstrap();