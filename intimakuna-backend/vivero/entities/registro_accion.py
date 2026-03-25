from django.db import models
from django.conf import settings
from django.utils import timezone


class RegistroAccion(models.Model):
    ACCIONES = [
        ('crear', 'Crear'),
        ('editar', 'Editar'),
        ('eliminar', 'Eliminar'),
    ]
    TIPOS = [
        ('ficha', 'Ficha Técnica'),
        ('curso', 'Curso'),
    ]

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acciones',
    )
    accion = models.CharField(max_length=10, choices=ACCIONES)
    tipo_objeto = models.CharField(max_length=10, choices=TIPOS)
    nombre_objeto = models.CharField(max_length=250)
    detalle = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'vivero'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_accion_display()} {self.tipo_objeto}: {self.nombre_objeto}'

    def to_dict(self):
        return {
            'id': self.pk,
            'usuario': self.usuario.username if self.usuario else 'Desconocido',
            'accion': self.accion,
            'accionLabel': self.get_accion_display(),
            'tipoObjeto': self.tipo_objeto,
            'tipoLabel': self.get_tipo_objeto_display(),
            'nombreObjeto': self.nombre_objeto,
            'detalle': self.detalle or '',
            'fecha': timezone.localtime(self.fecha).strftime('%d/%m/%Y %H:%M') if self.fecha else '',
        }
