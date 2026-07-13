import { createHash } from 'node:crypto';
import { db } from '../database/connection.js';

export function requestHash(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function findIdempotency(scope: string, key: string): { requestHash: string; jobId: string } | undefined {
  return db.prepare('SELECT request_hash AS requestHash, job_id AS jobId FROM idempotency_keys WHERE client_scope=$scope AND idempotency_key=$key').get({ $scope: scope, $key: key }) as { requestHash: string; jobId: string } | undefined;
}

export function saveIdempotency(scope: string, key: string, hash: string, jobId: string): void {
  db.prepare('INSERT INTO idempotency_keys (client_scope,idempotency_key,request_hash,job_id) VALUES ($scope,$key,$hash,$jobId)').run({ $scope: scope, $key: key, $hash: hash, $jobId: jobId });
}
