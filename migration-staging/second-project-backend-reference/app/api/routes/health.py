from fastapi import APIRouter

from ...schemas.health import HealthResponse
from ...services.health import get_health

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return get_health()