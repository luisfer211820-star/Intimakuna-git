# Importamos las entidades para que Django las detecte como modelos de esta app
from .entities.ficha_tecnica import FichaTecnica
from .entities.registro_accion import RegistroAccion

__all__ = ['FichaTecnica', 'RegistroAccion']
