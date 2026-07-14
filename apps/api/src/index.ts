import { buildApplication } from './app.js';
import { getEnvironment } from './config/environment.js';
import { ProcessingJobModel } from './models/ProcessingJob.model.js';
import { setOrphanedJobsReconciled } from './runtime/startupState.js';
import { cleanupLocalArtifacts } from './services/artifactCleanup.service.js';
import { releaseTerminalCreditReservations } from './services/creditLedger.service.js';

const environment = getEnvironment();
const app = await buildApplication();
const orphanedJobs = ProcessingJobModel.reconcileOrphanedJobs();
setOrphanedJobsReconciled(orphanedJobs);
const releasedReservations = releaseTerminalCreditReservations();
const cleanup = await cleanupLocalArtifacts();
app.log.info({ orphanedJobs, releasedReservations, cleanup }, 'Startup reconciliation complete');

const cleanupInterval = setInterval(() => {
  void cleanupLocalArtifacts().catch((error) => app.log.error(error, 'Scheduled privacy cleanup failed'));
}, Number(process.env.MEDIA_CLEANUP_INTERVAL_MINUTES ?? 60) * 60_000);
cleanupInterval.unref();

try {
  await app.listen({ port: environment.API_PORT, host: environment.API_HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
