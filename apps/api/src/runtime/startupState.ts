const state = {
  orphanedJobsReconciled: 0,
};

export function setOrphanedJobsReconciled(count: number): void {
  state.orphanedJobsReconciled = count;
}

export function getStartupState(): Readonly<typeof state> {
  return state;
}

