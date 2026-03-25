from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from ..repositories.registro_repository import RegistroRepository


@login_required
@require_http_methods(["GET"])
def registros_list(request):
    """Retorna el historial de las últimas 100 acciones del administrador."""
    registros = RegistroRepository.get_recent(limit=100)
    return JsonResponse([r.to_dict() for r in registros], safe=False)
