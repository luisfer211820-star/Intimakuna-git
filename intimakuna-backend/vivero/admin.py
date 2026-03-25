from django.contrib import admin
from .models import FichaTecnica, RegistroAccion


@admin.register(FichaTecnica)
class FichaTecnicaAdmin(admin.ModelAdmin):
    list_display = ('nombre_comun', 'nombre_cientifico', 'luz', 'riego', 'temperatura_ideal', 'precio', 'fecha_creacion')
    search_fields = ('nombre_comun', 'nombre_cientifico')


@admin.register(RegistroAccion)
class RegistroAccionAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'usuario', 'accion', 'tipo_objeto', 'nombre_objeto')
    list_filter = ('accion', 'tipo_objeto')
    readonly_fields = ('fecha',)
    ordering = ('-fecha',)
