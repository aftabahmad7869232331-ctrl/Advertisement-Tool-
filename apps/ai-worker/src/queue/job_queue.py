from __future__ import annotations

import queue
import threading
from dataclasses import dataclass, field
from typing import Callable


@dataclass
class QueuedJob:
    job_id: str
    run: Callable[[Callable[[], bool]], None]
    cancelled: threading.Event = field(default_factory=threading.Event)


class QueueFullError(RuntimeError):
    pass


class InProcessJobQueue:
    def __init__(self, concurrency: int = 1, max_size: int = 20) -> None:
        self._queue: queue.Queue[QueuedJob | None] = queue.Queue(maxsize=max_size)
        self._jobs: dict[str, QueuedJob] = {}
        self._active: set[str] = set()
        self._lock = threading.Lock()
        self._workers = [threading.Thread(target=self._worker, daemon=True) for _ in range(max(1, concurrency))]
        for worker in self._workers:
            worker.start()

    def enqueue(self, job: QueuedJob) -> bool:
        with self._lock:
            if job.job_id in self._jobs:
                return False
            if self._queue.full():
                raise QueueFullError("AI worker queue full hai.")
            self._jobs[job.job_id] = job
            self._queue.put_nowait(job)
            return True

    def cancel(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return False
            job.cancelled.set()
            return True

    def stats(self) -> dict[str, int]:
        with self._lock:
            return {"queueDepth": self._queue.qsize(), "activeJobs": len(self._active)}

    def shutdown(self) -> None:
        for _ in self._workers:
            self._queue.put(None)
        for worker in self._workers:
            worker.join(timeout=5)

    def _worker(self) -> None:
        while True:
            job = self._queue.get()
            if job is None:
                self._queue.task_done()
                return
            with self._lock:
                self._active.add(job.job_id)
            try:
                if not job.cancelled.is_set():
                    job.run(job.cancelled.is_set)
            finally:
                with self._lock:
                    self._active.discard(job.job_id)
                    self._jobs.pop(job.job_id, None)
                self._queue.task_done()
