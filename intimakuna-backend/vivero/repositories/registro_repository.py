from ..entities.registro_accion import RegistroAccion


class RegistroRepository:
    """Acceso a datos para RegistroAccion."""

    @staticmethod
    def get_recent(limit: int = 100):
        """Retorna los últimos N registros con su usuario relacionado."""
        return RegistroAccion.objects.select_related('usuario').all()[:limit]

    @staticmethod
    def create(usuario, accion: str, tipo: str, nombre: str, detalle: str = None):
        """Registra una nueva acción del administrador."""
        return RegistroAccion.objects.create(
            usuario=usuario,
            accion=accion,
            tipo_objeto=tipo,
            nombre_objeto=nombre,
            detalle=detalle,
        )
