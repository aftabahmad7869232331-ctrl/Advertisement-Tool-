import { buildApplication } from './app.js';
import { getEnvironment } from './config/environment.js';
import { ProcessingJobModel } from './models/ProcessingJob.model.js';
import { setOrphanedJobsReconciled } from './runtime/startupState.js';

const environment = getEnvironment();
const app = await buildApplication();
const orphanedJobs = ProcessingJobModel.reconcileOrphanedJobs();
setOrphanedJobsReconciled(orphanedJobs);
app.log.info({ orphanedJobs }, 'Startup job reconciliation complete');

try {
  await app.listen({ port: environment.API_PORT, host: environment.API_HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
