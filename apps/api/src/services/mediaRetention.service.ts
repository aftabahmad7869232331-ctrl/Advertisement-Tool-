export function retentionExpiry(environmentName: string, fallbackHours: number): Date {
  const configured = Number(process.env[environmentName] ?? fallbackHours);
  const hours = Number.isFinite(configured) && configured > 0 ? configured : fallbackHours;
  return new Date(Date.now() + hours * 3_600_000);
}

export function isExpiredTemporaryMedia(input: {
  temporary: boolean;
  expiresAt: Date | null;
}): boolean {
  return input.temporary && input.expiresAt !== null && input.expiresAt.getTime() <= Date.now();
}
