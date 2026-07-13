from ..schemas.health import HealthResponse


def get_health() -> HealthResponse:
    return HealthResponse(status="ok", service="python-ai", version="1.0.0")