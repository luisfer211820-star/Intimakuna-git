import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import FichaTecnica, Curso, RegistroAccion


# ============ HELPERS ============

def registrar(request, accion, tipo, nombre, detalle=None):
    """Registra una acción del administrador."""
    RegistroAccion.objects.create(
        usuario=request.user if request.user.is_authenticated else None,
        accion=accion,
        tipo_objeto=tipo,
        nombre_objeto=nombre,
        detalle=detalle,
    )


# ============ AUTH VIEWS ============

def login_view(request):
    error = False
    if request.method == "POST":
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('panel')
        else:
            error = True
    return render(request, 'vivero/login.html', {'error': error})


def logout_view(request):
    if request.method == "POST":
        logout(request)
    return redirect('login')


@login_required
def panel_view(request):
    return render(request, 'vivero/panel.html')


# ============ API: FICHAS TÉCNICAS ============

@login_required
@require_http_methods(["GET", "POST"])
def fichas_list(request):
    if request.method == "GET":
        fichas = FichaTecnica.objects.all().order_by('id')
        return JsonResponse([f.to_dict() for f in fichas], safe=False)

    # POST - Crear nueva ficha
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    nombre = data.get('nombre', '').strip()
    if not nombre:
        return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)

    ficha = FichaTecnica.objects.create(
        nombre_comun=nombre,
        nombre_cientifico=data.get('nombreCientifico', '').strip() or None,
        descripcion=data.get('descripcion', '').strip() or None,
        usos=data.get('usos', '').strip() or None,
        luz=data.get('luz', '').strip() or None,
        riego=data.get('riego', '').strip() or None,
        temperatura_ideal=data.get('temperaturaIdeal', '').strip() or None,
    )

    registrar(request, 'crear', 'ficha', ficha.nombre_comun,
              f'ID: {ficha.pk}')

    return JsonResponse(ficha.to_dict(), status=201)


@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
def ficha_detail(request, pk):
    ficha = get_object_or_404(FichaTecnica, pk=pk)

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

        ficha.nombre_comun = nombre
        ficha.nombre_cientifico = data.get('nombreCientifico', '').strip() or None
        ficha.descripcion = data.get('descripcion', '').strip() or None
        ficha.usos = data.get('usos', '').strip() or None
        ficha.luz = data.get('luz', '').strip() or None
        ficha.riego = data.get('riego', '').strip() or None
        ficha.temperatura_ideal = data.get('temperaturaIdeal', '').strip() or None
        ficha.save()

        registrar(request, 'editar', 'ficha', ficha.nombre_comun,
                  f'ID: {ficha.pk}')

        return JsonResponse(ficha.to_dict())

    # DELETE
    nombre_antes = ficha.nombre_comun
    ficha_id = ficha.pk
    ficha.delete()

    registrar(request, 'eliminar', 'ficha', nombre_antes,
              f'ID anterior: {ficha_id}')

    return JsonResponse({'ok': True})


# ============ API: CURSOS ============

@login_required
@require_http_methods(["GET", "POST"])
def cursos_list(request):
    if request.method == "GET":
        cursos = Curso.objects.all().order_by('id')
        return JsonResponse([c.to_dict() for c in cursos], safe=False)

    # POST - Crear nuevo curso
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)

    nombre = data.get('nombre', '').strip()
    if not nombre:
        return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)

    fecha = data.get('fecha', '').strip() or None

    curso = Curso.objects.create(
        nombre=nombre,
        descripcion=data.get('descripcion', '').strip() or None,
        fecha=fecha if fecha else None,
        duracion=data.get('duracion', '').strip() or None,
    )

    registrar(request, 'crear', 'curso', curso.nombre,
              f'ID: {curso.pk}')

    return JsonResponse(curso.to_dict(), status=201)


@login_required
@require_http_methods(["GET", "PUT", "DELETE"])
def curso_detail(request, pk):
    curso = get_object_or_404(Curso, pk=pk)

    if request.method == "GET":
        return JsonResponse(curso.to_dict())

    if request.method == "PUT":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)

        nombre = data.get('nombre', '').strip()
        if not nombre:
            return JsonResponse({'error': 'El nombre es obligatorio'}, status=400)

        fecha = data.get('fecha', '').strip() or None

        curso.nombre = nombre
        curso.descripcion = data.get('descripcion', '').strip() or None
        curso.fecha = fecha if fecha else None
        curso.duracion = data.get('duracion', '').strip() or None
        curso.save()

        registrar(request, 'editar', 'curso', curso.nombre,
                  f'ID: {curso.pk}')

        return JsonResponse(curso.to_dict())

    # DELETE
    nombre_antes = curso.nombre
    curso_id = curso.pk
    curso.delete()

    registrar(request, 'eliminar', 'curso', nombre_antes,
              f'ID anterior: {curso_id}')

    return JsonResponse({'ok': True})


# ============ API: REGISTROS DE ACCIONES ============

@login_required
@require_http_methods(["GET"])
def registros_list(request):
    registros = RegistroAccion.objects.select_related('usuario').all()[:100]
    return JsonResponse([r.to_dict() for r in registros], safe=False)