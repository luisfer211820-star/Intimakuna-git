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
    precio = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'vivero'

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
            'precio': str(self.precio) if self.precio is not None else '',
        }
