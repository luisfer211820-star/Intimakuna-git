from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('login/', views.login_view, name='login'),
    path('panel/', views.panel_view, name='panel'),
    path('logout/', views.logout_view, name='logout'),

    # API - Fichas Técnicas
    path('api/fichas/', views.fichas_list, name='fichas_list'),
    path('api/fichas/<int:pk>/', views.ficha_detail, name='ficha_detail'),

    # API - Cursos
    path('api/cursos/', views.cursos_list, name='cursos_list'),
    path('api/cursos/<int:pk>/', views.curso_detail, name='curso_detail'),

    # API - Registros de Acciones (auditoría)
    path('api/registros/', views.registros_list, name='registros_list'),
]