from django.db import models
from django.conf import settings


class FichaTecnica(models.Model):
    nombre_comun = models.CharField(max_length=150)
    nombre_cientifico = models.CharField(max_length=150, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    usos = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to='fichas/', blank=True, null=True)
    luz = models.CharField(max_length=100, blank=True, null=True)
    riego = models.CharField(max_length=100, blank=True, null=True)
    temperatura_ideal = models.CharField(max_length=100, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre_comun

    def to_dict(self):
        return {
            'id': self.pk,
            'nombre': self.nombre_comun,
            'nombreCientifico': self.nombre_cientifico or '',
            'descripcion': self.descripcion or '',
            'usos': self.usos or '',
            'luz': self.luz or '',
            'riego': self.riego or '',
            'temperaturaIdeal': self.temperatura_ideal or '',
        }


class Curso(models.Model):
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateField(blank=True, null=True)
    duracion = models.CharField(max_length=100, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nombre

    def to_dict(self):
        return {
            'id': self.pk,
            'nombre': self.nombre,
            'descripcion': self.descripcion or '',
            'fecha': str(self.fecha) if self.fecha else '',
            'duracion': self.duracion or '',
        }


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
            'fecha': self.fecha.strftime('%d/%m/%Y %H:%M') if self.fecha else '',
        }
