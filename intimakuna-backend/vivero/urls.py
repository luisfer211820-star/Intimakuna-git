from django.urls import path
from . import controllers

urlpatterns = [
    # Auth
    path('login/', controllers.login_controller, name='login'),
    path('panel/', controllers.panel_controller, name='panel'),
    path('logout/', controllers.logout_controller, name='logout'),

    # API - Fichas Técnicas
    path('api/fichas/', controllers.fichas_list, name='fichas_list'),
    path('api/fichas/eliminadas/', controllers.fichas_eliminadas, name='fichas_eliminadas'),
    path('api/fichas/<int:pk>/', controllers.ficha_detail, name='ficha_detail'),
    path('api/fichas/<int:pk>/restaurar/', controllers.restaurar_ficha, name='restaurar_ficha'),

    # API - Registros de Acciones (auditoría)
    path('api/registros/', controllers.registros_list, name='registros_list'),
]