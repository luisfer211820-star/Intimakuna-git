from .auth_controller import login_controller, logout_controller, panel_controller
from .fichas_controller import fichas_list, ficha_detail, fichas_eliminadas, restaurar_ficha
from .registros_controller import registros_list

__all__ = [
    'login_controller', 'logout_controller', 'panel_controller',
    'fichas_list', 'ficha_detail', 'fichas_eliminadas', 'restaurar_ficha',
    'registros_list'
]
