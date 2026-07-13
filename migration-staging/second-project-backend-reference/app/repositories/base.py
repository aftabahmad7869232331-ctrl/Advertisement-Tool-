"""Generic repository contract."""

from typing import Generic, Protocol, TypeVar

T = TypeVar("T")


class Repository(Protocol, Generic[T]):
    def get(self, item_id: str) -> T | None: ...

    def list(self) -> list[T]: ...

    def save(self, item: T) -> T: ...
