from ..entities.ficha_tecnica import FichaTecnica


class FichaRepository:
    """Acceso a datos para FichaTecnica."""

    @staticmethod
    def get_all():
        """Retorna todas las fichas activas ordenadas por id."""
        return FichaTecnica.objects.filter(is_deleted=False).order_by('id')

    @staticmethod
    def get_deleted():
        """Retorna todas las fichas eliminadas lógicamente."""
        return FichaTecnica.objects.filter(is_deleted=True).order_by('-fecha_actualizacion')

    @staticmethod
    def get_by_id(pk):
        """Retorna una ficha activa por su clave primaria o lanza 404."""
        from django.shortcuts import get_object_or_404
        return get_object_or_404(FichaTecnica, pk=pk, is_deleted=False)

    @staticmethod
    def get_by_id_including_deleted(pk):
        """Retorna una ficha por su clave primaria sin importar is_deleted."""
        from django.shortcuts import get_object_or_404
        return get_object_or_404(FichaTecnica, pk=pk)

    @staticmethod
    def create(data: dict) -> FichaTecnica:
        """Crea y persiste una nueva FichaTecnica."""
        precio_val = data.get('precio', '').strip()
        precio_val = float(precio_val) if precio_val else None

        return FichaTecnica.objects.create(
            nombre_comun=data.get('nombre', '').strip(),
            nombre_cientifico=data.get('nombreCientifico', '').strip() or None,
            descripcion=data.get('descripcion', '').strip() or None,
            usos=data.get('usos', '').strip() or None,
            luz=data.get('luz', '').strip() or None,
            riego=data.get('riego', '').strip() or None,
            temperatura_ideal=data.get('temperaturaIdeal', '').strip() or None,
            precio=precio_val,
        )

    @staticmethod
    def update(ficha: FichaTecnica, data: dict) -> FichaTecnica:
        """Actualiza los campos de una ficha existente."""
        precio_val = data.get('precio', '').strip()
        precio_val = float(precio_val) if precio_val else None

        ficha.nombre_comun = data.get('nombre', '').strip()
        ficha.nombre_cientifico = data.get('nombreCientifico', '').strip() or None
        ficha.descripcion = data.get('descripcion', '').strip() or None
        ficha.usos = data.get('usos', '').strip() or None
        ficha.luz = data.get('luz', '').strip() or None
        ficha.riego = data.get('riego', '').strip() or None
        ficha.temperatura_ideal = data.get('temperaturaIdeal', '').strip() or None
        ficha.precio = precio_val
        ficha.save()
        return ficha

    @staticmethod
    def delete(ficha: FichaTecnica):
        """Elimina lógicamente una ficha."""
        ficha.is_deleted = True
        ficha.save()

    @staticmethod
    def restore(ficha: FichaTecnica):
        """Restaura una ficha eliminada lógicamente."""
        ficha.is_deleted = False
        ficha.save()
