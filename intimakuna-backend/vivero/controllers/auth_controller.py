from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required


def login_controller(request):
    """Muestra el formulario de login y autentica al usuario."""
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


def logout_controller(request):
    """Cierra la sesión del usuario."""
    if request.method == "POST":
        logout(request)
    return redirect('login')


@login_required
def panel_controller(request):
    """Renderiza el panel de administración."""
    return render(request, 'vivero/panel.html')
