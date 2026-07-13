import { initializeDatabase } from '../../apps/api/src/database/connection.js';
import { cleanupLocalArtifacts } from '../../apps/api/src/services/artifactCleanup.service.js';

initializeDatabase();
const result = await cleanupLocalArtifacts();
console.log(JSON.stringify({ status: 'ok', ...result }));
