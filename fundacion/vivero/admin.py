from django.contrib import admin
from .models import FichaTecnica, Curso, RegistroAccion


@admin.register(FichaTecnica)
class FichaTecnicaAdmin(admin.ModelAdmin):
    list_display = ('nombre_comun', 'nombre_cientifico', 'luz', 'riego', 'temperatura_ideal', 'fecha_creacion')
    search_fields = ('nombre_comun', 'nombre_cientifico')


@admin.register(Curso)
class CursoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'fecha', 'duracion', 'fecha_creacion')
    search_fields = ('nombre',)


@admin.register(RegistroAccion)
class RegistroAccionAdmin(admin.ModelAdmin):
    list_display = ('fecha', 'usuario', 'accion', 'tipo_objeto', 'nombre_objeto')
    list_filter = ('accion', 'tipo_objeto')
    readonly_fields = ('fecha',)
    ordering = ('-fecha',)
