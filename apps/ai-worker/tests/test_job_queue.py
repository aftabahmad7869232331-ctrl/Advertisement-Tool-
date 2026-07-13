import threading
import time

import pytest

from src.queue.job_queue import InProcessJobQueue, QueueFullError, QueuedJob


def test_queue_enforces_concurrency_and_deduplicates() -> None:
    queue = InProcessJobQueue(concurrency=1, max_size=2)
    gate = threading.Event()
    active = 0
    maximum = 0

    def run(_cancelled):
        nonlocal active, maximum
        active += 1
        maximum = max(maximum, active)
        gate.wait(1)
        active -= 1

    assert queue.enqueue(QueuedJob("one", run)) is True
    assert queue.enqueue(QueuedJob("one", run)) is False
    assert queue.enqueue(QueuedJob("two", run)) is True
    time.sleep(0.05)
    assert queue.stats()["activeJobs"] == 1
    assert maximum == 1
    gate.set()
    queue.shutdown()


def test_queue_limit_and_cancellation() -> None:
    queue = InProcessJobQueue(concurrency=1, max_size=1)
    gate = threading.Event()
    queue.enqueue(QueuedJob("active", lambda _cancelled: gate.wait(1)))
    time.sleep(0.05)
    queue.enqueue(QueuedJob("queued", lambda _cancelled: None))
    with pytest.raises(QueueFullError):
        queue.enqueue(QueuedJob("overflow", lambda _cancelled: None))
    assert queue.cancel("queued") is True
    gate.set()
    queue.shutdown()
