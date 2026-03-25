# Intimakuna — Fundación Indígena

Proyecto dividido en dos carpetas:

```
Intimakuna-git/
├── intimakuna-backend/     ← Servidor Django (Python)
│   ├── manage.py
│   ├── db.sqlite3
│   ├── fundacion/          ← Configuración del proyecto Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── vivero/             ← Aplicación principal
│       ├── models.py
│       ├── views.py
│       ├── urls.py
│       ├── admin.py
│       ├── migrations/
│       ├── static/vivero/  ← Archivos estáticos servidos por Django
│       │   ├── styles.css
│       │   ├── app.js
│       │   └── img/
│       └── templates/vivero/
│           ├── login.html
│           └── panel.html
│
├── intimakuna-frontend/    ← Frontend standalone (HTML + CSS + JS)
│   ├── index.html          ← Login (sin Django tags, rutas relativas)
│   ├── panel.html          ← Panel de administración
│   └── assets/
│       ├── css/styles.css
│       ├── js/app.js
│       └── img/login_bg.jpg
│
└── .venv/                  ← Entorno virtual Python
```

---

## Ejecutar el backend

```powershell
# Activar entorno virtual
.\.venv\Scripts\activate

# Ir al backend
cd intimakuna-backend

# Iniciar servidor de desarrollo
python manage.py runserver
```

El panel estará disponible en: **http://127.0.0.1:8000**

---

## Editar el frontend

La carpeta `intimakuna-frontend/` contiene los archivos fuente del frontend con rutas relativas (sin template tags de Django). Úsala para editar el diseño de forma independiente.

> **Importante:** Cuando hagas cambios en `intimakuna-frontend/assets/`, cópialos también a `intimakuna-backend/vivero/static/vivero/` para que Django los sirva correctamente.

---

## APIs del backend

| Método | URL | Descripción |
|--------|-----|-------------|
| GET/POST | `/accounts/api/fichas/` | Listar y crear fichas técnicas |
| GET/PUT/DELETE | `/accounts/api/fichas/<id>/` | Detalle de una ficha |
| GET/POST | `/accounts/api/cursos/` | Listar y crear cursos |
| GET/PUT/DELETE | `/accounts/api/cursos/<id>/` | Detalle de un curso |
| GET | `/accounts/api/registros/` | Historial de acciones |
