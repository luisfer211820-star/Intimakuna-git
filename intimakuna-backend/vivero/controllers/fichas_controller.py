import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from ..repositories.ficha_repository import FichaRepository
from ..repositories.registro_repository import RegistroRepository


def _registrar(request, accion, tipo, nombre, detalle=None):
    """Helper interno: persiste un registro de auditoría."""
    usuario = request.user if request.user.is_authenticated else None
    RegistroRepository.create(usuario, accion, tipo, nombre, detalle)


@login_required
@require_http_methods(["GET", "POST"])
def fichas_list(request):
    """Lista todas las fichas (GET) o crea una nueva (POST)."""
    if request.method == "GET":
        fichas = FichaRepository.get_all()
        return JsonResponse([f.to_dict() for f in fichas], safe=False)

    # POST — crear
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    nombre = data.get('nombre', '').strip()
    if not nombre:
        return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)

    ficha = FichaRepository.create(data)
    _registrar(request, 'crear', 'ficha', ficha.nombre_comun, f'ID: {ficha.pk}')
    return JsonResponse(ficha.to_dict(), status=201)


@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
def ficha_detail(request, pk):
    """Detalle, actualización o eliminación de una ficha."""
    ficha = FichaRepository.get_by_id(pk)

    if request.method == "GET":
        return JsonResponse(ficha.to_dict())

    if request.method == "PUT":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        nombre = data.get('nombre', '').strip()
        if not nombre:
            return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)

        ficha = FichaRepository.update(ficha, data)
        _registrar(request, 'editar', 'ficha', ficha.nombre_comun, f'ID: {ficha.pk}')
        return JsonResponse(ficha.to_dict())

    # DELETE
    nombre_antes = ficha.nombre_comun
    ficha_id = ficha.pk
    FichaRepository.delete(ficha)
    _registrar(request, 'eliminar', 'ficha', nombre_antes, f'ID anterior: {ficha_id}')
    return JsonResponse({'ok': True})


@login_required
@require_http_methods(["GET"])
def fichas_eliminadas(request):
    """Lista todas las fichas eliminadas lógicamente."""
    fichas = FichaRepository.get_deleted()
    return JsonResponse([f.to_dict() for f in fichas], safe=False)


@login_required
@require_http_methods(["POST"])
def restaurar_ficha(request, pk):
    """Restaura una ficha eliminada lógicamente."""
    ficha = FichaRepository.get_by_id_including_deleted(pk)
    FichaRepository.restore(ficha)
    _registrar(request, 'restaurar', 'ficha', ficha.nombre_comun, f'ID: {ficha.pk}')
    return JsonResponse({'ok': True})
