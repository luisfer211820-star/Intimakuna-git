/* ============================================
   INTIMAKUNA - Admin Panel Application
   Base de datos via Django API
   ============================================
   FRONTEND STANDALONE — intimakuna-frontend/
   ============================================
   BACKEND: Django corriendo en http://127.0.0.1:8000
   Todas las llamadas fetch() usan rutas relativas al backend:
     GET/POST        /accounts/api/fichas/
     GET/PUT/DELETE  /accounts/api/fichas/<id>/
     GET             /accounts/api/registros/
   El CSRF token lo inyecta Django via {% csrf_token %} en panel.html.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // ============ CSRF TOKEN ============
    function getCsrfToken() {
        const el = document.querySelector('[name=csrfmiddlewaretoken]');
        return el ? el.value : '';
    }

    // ============ API HELPERS ============

    async function apiFetch(url, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        };
        if (body !== null) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `Error ${response.status}`);
        }
        return response.json();
    }

    // ============ TABS ============

    const tabs = document.querySelectorAll('.panel-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const target = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));

            this.classList.add('active');
            const content = document.getElementById('tab-' + target);
            if (content) content.classList.add('active');

            // Cargar historial al abrir esa pestaña
            if (target === 'historial') {
                renderHistorial();
            } else if (target === 'papelera') {
                renderPapelera();
            }
        });
    });

    // ============ TOAST NOTIFICATIONS ============

    const toastContainer = document.getElementById('toast-container');

    function showToast(message, type = 'success') {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '✅'}</span>
            <span class="toast-message">${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============ FORM VALIDATION HELPERS ============

    function showFieldError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const errorEl = document.getElementById(errorId);
        if (input) input.classList.add('input-error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldErrors(formEl) {
        formEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        formEl.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    }

    // ============ MODAL SYSTEM ============

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal-overlay').classList.remove('active');
        });
    });

    // Cancel buttons
    document.querySelectorAll('[data-action="cancel"]').forEach(btn => {
        btn.addEventListener('click', function () {
            this.closest('.modal-overlay').classList.remove('active');
        });
    });

    // ============ FICHAS TÉCNICAS CRUD ============

    const fichasTableBody = document.getElementById('fichas-table-body');
    const fichasEmptyState = document.getElementById('fichas-empty');
    const addFichaBtn = document.getElementById('add-ficha-btn');
    const fichaForm = document.getElementById('ficha-form');
    let editingFichaId = null;

    async function renderFichas() {
        try {
            const fichas = await apiFetch('/accounts/api/fichas/');

            if (fichas.length === 0) {
                if (fichasTableBody) fichasTableBody.parentElement.style.display = 'none';
                if (fichasEmptyState) fichasEmptyState.style.display = 'block';
                return;
            }

            if (fichasTableBody) fichasTableBody.parentElement.style.display = '';
            if (fichasEmptyState) fichasEmptyState.style.display = 'none';

            if (fichasTableBody) {
                fichasTableBody.innerHTML = fichas.map((ficha, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(ficha.nombre)}</strong></td>
                        <td><em>${escapeHtml(ficha.nombreCientifico || '—')}</em></td>
                        <td>${escapeHtml(truncate(ficha.descripcion, 60))}</td>
                        <td>${escapeHtml(truncate(ficha.usos, 40))}</td>
                        <td>${escapeHtml(ficha.luz || '—')}</td>
                        <td>${escapeHtml(ficha.riego || '—')}</td>
                        <td>${escapeHtml(ficha.temperaturaIdeal || '—')}</td>
                        <td>
                            <div class="actions">
                                <button class="action-btn edit" onclick="editFicha(${ficha.id})" title="Editar">
                                    ✏️
                                </button>
                                <button class="action-btn delete" onclick="deleteFicha(${ficha.id}, '${escapeHtml(ficha.nombre)}')" title="Eliminar">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            showToast('Error al cargar las fichas técnicas', 'error');
        }
    }

    if (addFichaBtn) {
        addFichaBtn.addEventListener('click', function () {
            editingFichaId = null;
            fichaForm.reset();
            clearFieldErrors(fichaForm);
            document.getElementById('ficha-modal-title').textContent = 'Nueva Ficha Técnica';
            openModal('ficha-modal');
        });
    }

    if (fichaForm) {
        fichaForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearFieldErrors(fichaForm);

            const nombre = document.getElementById('ficha-nombre').value.trim();
            const cientifico = document.getElementById('ficha-cientifico').value.trim();
            const descripcion = document.getElementById('ficha-descripcion').value.trim();
            const usos = document.getElementById('ficha-usos').value.trim();
            
            const luz = document.getElementById('ficha-luz').value.trim();
            const riegoVeces = document.getElementById('ficha-riego-veces').value;
            const riegoFrecuencia = document.getElementById('ficha-riego-frecuencia').value;
            const temperatura = document.getElementById('ficha-temperatura').value.trim();
            const precio = document.getElementById('ficha-precio').value.trim();

            let hasErrors = false;

            if (!nombre || !isNaN(nombre)) {
                showFieldError('ficha-nombre', 'ficha-nombre-error', 'Obligatorio y debe ser texto');
                hasErrors = true;
            }
            if (!cientifico || !isNaN(cientifico)) {
                showFieldError('ficha-cientifico', 'ficha-cientifico-error', 'Obligatorio y debe ser texto');
                hasErrors = true;
            }
            if (!descripcion || descripcion.length > 100) {
                showFieldError('ficha-descripcion', 'ficha-descripcion-error', 'Obligatorio (máx. 100 caracteres)');
                hasErrors = true;
            }
            if (!usos || usos.length > 100) {
                showFieldError('ficha-usos', 'ficha-usos-error', 'Obligatorio (máx. 100 caracteres)');
                hasErrors = true;
            }
            if (!luz) {
                showFieldError('ficha-luz', 'ficha-luz-error', 'Selecciona la luz');
                hasErrors = true;
            }
            if (!riegoVeces || !riegoFrecuencia) {
                showFieldError('ficha-riego-veces', 'ficha-riego-error', 'Riego incompleto');
                hasErrors = true;
            }
            if (!temperatura) {
                showFieldError('ficha-temperatura', 'ficha-temperatura-error', 'Selecciona temperatura');
                hasErrors = true;
            }
            if (!precio || isNaN(precio) || Number(precio) <= 0) {
                showFieldError('ficha-precio', 'ficha-precio-error', 'Precio inválido');
                hasErrors = true;
            }

            if (hasErrors) {
                showToast('Corrige los errores en rojo', 'warning');
                return;
            }

            const riego = `${riegoVeces} veces ${riegoFrecuencia}`;

            const data = {
                nombre,
                nombreCientifico: cientifico,
                descripcion,
                usos,
                luz,
                riego,
                temperaturaIdeal: temperatura,
                precio,
            };

            try {
                if (editingFichaId) {
                    await apiFetch(`/accounts/api/fichas/${editingFichaId}/`, 'PUT', data);
                    showToast('Ficha actualizada correctamente');
                } else {
                    await apiFetch('/accounts/api/fichas/', 'POST', data);
                    showToast('Ficha creada correctamente');
                }

                closeModal('ficha-modal');
                renderFichas();
            } catch (err) {
                showToast(err.message || 'Error al guardar la ficha', 'error');
            }
        });
    }

    // Global functions for inline event handlers
    window.editFicha = async function (id) {
        try {
            const ficha = await apiFetch(`/accounts/api/fichas/${id}/`);
            editingFichaId = id;
            clearFieldErrors(fichaForm);
            document.getElementById('ficha-nombre').value = ficha.nombre || '';
            document.getElementById('ficha-cientifico').value = ficha.nombreCientifico || '';
            document.getElementById('ficha-descripcion').value = ficha.descripcion || '';
            document.getElementById('ficha-usos').value = ficha.usos || '';
            document.getElementById('ficha-luz').value = ficha.luz || '';
            
            document.getElementById('ficha-riego-veces').value = '';
            document.getElementById('ficha-riego-frecuencia').value = '';
            if (ficha.riego && ficha.riego.includes(' veces ')) {
                const parts = ficha.riego.split(' veces ');
                if (parts.length === 2) {
                    document.getElementById('ficha-riego-veces').value = parts[0] || '';
                    document.getElementById('ficha-riego-frecuencia').value = parts[1] || '';
                }
            }
            
            document.getElementById('ficha-temperatura').value = ficha.temperaturaIdeal || '';
            document.getElementById('ficha-precio').value = ficha.precio || '';
            document.getElementById('ficha-modal-title').textContent = 'Editar Ficha Técnica';
            openModal('ficha-modal');
        } catch (err) {
            showToast('Error al cargar la ficha', 'error');
        }
    };

    window.deleteFicha = function (id, nombre) {
        document.getElementById('confirm-name').textContent = nombre;
        openModal('confirm-modal');

        const confirmBtn = document.getElementById('confirm-delete-btn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', async function () {
            try {
                await apiFetch(`/accounts/api/fichas/${id}/`, 'DELETE');
                closeModal('confirm-modal');
                renderFichas();
                showToast('Ficha eliminada correctamente');
            } catch (err) {
                closeModal('confirm-modal');
                showToast('Error al eliminar la ficha', 'error');
            }
        });
    };



    // ============ PAPELERA ============

    const papeleraTableBody = document.getElementById('papelera-table-body');
    const papeleraTable = document.getElementById('papelera-table');
    const papeleraEmpty = document.getElementById('papelera-empty');

    async function renderPapelera() {
        try {
            const eliminadas = await apiFetch('/accounts/api/fichas/eliminadas/');

            if (eliminadas.length === 0) {
                if (papeleraTable) papeleraTable.style.display = 'none';
                if (papeleraEmpty) papeleraEmpty.style.display = 'block';
                return;
            }

            if (papeleraTable) papeleraTable.style.display = '';
            if (papeleraEmpty) papeleraEmpty.style.display = 'none';

            if (papeleraTableBody) {
                papeleraTableBody.innerHTML = eliminadas.map((ficha, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(ficha.nombre)}</strong></td>
                        <td><em>${escapeHtml(ficha.nombreCientifico || '—')}</em></td>
                        <td class="fecha-cell">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;opacity:0.5">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Eliminado recientemente
                        </td>
                        <td>
                            <div class="actions">
                                <button class="action-btn edit" onclick="restoreFicha(${ficha.id})" title="Restaurar" style="width:auto; padding:0 8px;">
                                    Restaurar
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            showToast('Error al cargar la papelera', 'error');
        }
    }

    window.restoreFicha = async function (id) {
        try {
            await apiFetch(`/accounts/api/fichas/${id}/restaurar/`, 'POST');
            showToast('Ficha restaurada correctamente');
            renderPapelera();
            renderFichas();
        } catch (err) {
            showToast('Error al restaurar la ficha', 'error');
        }
    };


    // ============ HISTORIAL DE ACCIONES ============

    const historialTableBody = document.getElementById('historial-table-body');
    const historialTable = document.getElementById('historial-table');
    const historialEmpty = document.getElementById('historial-empty');
    const refreshHistorialBtn = document.getElementById('refresh-historial-btn');

    async function renderHistorial() {
        try {
            const registros = await apiFetch('/accounts/api/registros/');

            if (registros.length === 0) {
                if (historialTable) historialTable.style.display = 'none';
                if (historialEmpty) historialEmpty.style.display = 'block';
                return;
            }

            if (historialTable) historialTable.style.display = '';
            if (historialEmpty) historialEmpty.style.display = 'none';

            if (historialTableBody) {
                historialTableBody.innerHTML = registros.map((reg, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="fecha-cell">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px;opacity:0.5">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            ${escapeHtml(reg.fecha)}
                        </td>
                        <td>
                            <span class="user-badge">👤 ${escapeHtml(reg.usuario)}</span>
                        </td>
                        <td>
                            <span class="badge badge-${reg.accion}">${escapeHtml(reg.accionLabel)}</span>
                        </td>
                        <td>
                            <span class="tipo-badge">🌿 ${escapeHtml(reg.tipoLabel)}</span>
                        </td>
                        <td><strong>${escapeHtml(reg.nombreObjeto)}</strong></td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            showToast('Error al cargar el historial', 'error');
        }
    }

    if (refreshHistorialBtn) {
        refreshHistorialBtn.addEventListener('click', function () {
            this.classList.add('spinning');
            renderHistorial().finally(() => {
                setTimeout(() => this.classList.remove('spinning'), 500);
            });
        });
    }

    // ============ HELPERS ============

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // ============ INIT ============

    renderFichas();


});
