/* ============================================
   INTIMAKUNA - Admin Panel Application
   Base de datos via Django API
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

            // Validación frontend
            if (!nombre) {
                showFieldError('ficha-nombre', 'ficha-nombre-error', 'El nombre es obligatorio');
                showToast('El nombre de la planta es obligatorio', 'error');
                return;
            }

            const data = {
                nombre,
                nombreCientifico: document.getElementById('ficha-cientifico').value.trim(),
                descripcion: document.getElementById('ficha-descripcion').value.trim(),
                usos: document.getElementById('ficha-usos').value.trim(),
                luz: document.getElementById('ficha-luz').value.trim(),
                riego: document.getElementById('ficha-riego').value.trim(),
                temperaturaIdeal: document.getElementById('ficha-temperatura').value.trim(),
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
            document.getElementById('ficha-riego').value = ficha.riego || '';
            document.getElementById('ficha-temperatura').value = ficha.temperaturaIdeal || '';
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

    // ============ CURSOS CRUD ============

    const cursosTableBody = document.getElementById('cursos-table-body');
    const cursosEmptyState = document.getElementById('cursos-empty');
    const addCursoBtn = document.getElementById('add-curso-btn');
    const cursoForm = document.getElementById('curso-form');
    let editingCursoId = null;

    async function renderCursos() {
        try {
            const cursos = await apiFetch('/accounts/api/cursos/');

            if (cursos.length === 0) {
                if (cursosTableBody) cursosTableBody.parentElement.style.display = 'none';
                if (cursosEmptyState) cursosEmptyState.style.display = 'block';
                return;
            }

            if (cursosTableBody) cursosTableBody.parentElement.style.display = '';
            if (cursosEmptyState) cursosEmptyState.style.display = 'none';

            if (cursosTableBody) {
                cursosTableBody.innerHTML = cursos.map((curso, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${escapeHtml(curso.nombre)}</strong></td>
                        <td>${escapeHtml(truncate(curso.descripcion, 60))}</td>
                        <td>${escapeHtml(curso.fecha || '—')}</td>
                        <td>${escapeHtml(curso.duracion || '—')}</td>
                        <td>
                            <div class="actions">
                                <button class="action-btn edit" onclick="editCurso(${curso.id})" title="Editar">
                                    ✏️
                                </button>
                                <button class="action-btn delete" onclick="deleteCurso(${curso.id}, '${escapeHtml(curso.nombre)}')" title="Eliminar">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            showToast('Error al cargar los cursos', 'error');
        }
    }

    if (addCursoBtn) {
        addCursoBtn.addEventListener('click', function () {
            editingCursoId = null;
            cursoForm.reset();
            clearFieldErrors(cursoForm);
            document.getElementById('curso-modal-title').textContent = 'Nuevo Curso';
            openModal('curso-modal');
        });
    }

    if (cursoForm) {
        cursoForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearFieldErrors(cursoForm);

            const nombre = document.getElementById('curso-nombre').value.trim();

            // Validación frontend
            if (!nombre) {
                showFieldError('curso-nombre', 'curso-nombre-error', 'El nombre es obligatorio');
                showToast('El nombre del curso es obligatorio', 'error');
                return;
            }

            const data = {
                nombre,
                descripcion: document.getElementById('curso-descripcion').value.trim(),
                fecha: document.getElementById('curso-fecha').value,
                duracion: document.getElementById('curso-duracion').value.trim(),
            };

            try {
                if (editingCursoId) {
                    await apiFetch(`/accounts/api/cursos/${editingCursoId}/`, 'PUT', data);
                    showToast('Curso actualizado correctamente');
                } else {
                    await apiFetch('/accounts/api/cursos/', 'POST', data);
                    showToast('Curso creado correctamente');
                }

                closeModal('curso-modal');
                renderCursos();
            } catch (err) {
                showToast(err.message || 'Error al guardar el curso', 'error');
            }
        });
    }

    window.editCurso = async function (id) {
        try {
            const curso = await apiFetch(`/accounts/api/cursos/${id}/`);
            editingCursoId = id;
            clearFieldErrors(cursoForm);
            document.getElementById('curso-nombre').value = curso.nombre || '';
            document.getElementById('curso-descripcion').value = curso.descripcion || '';
            document.getElementById('curso-fecha').value = curso.fecha || '';
            document.getElementById('curso-duracion').value = curso.duracion || '';
            document.getElementById('curso-modal-title').textContent = 'Editar Curso';
            openModal('curso-modal');
        } catch (err) {
            showToast('Error al cargar el curso', 'error');
        }
    };

    window.deleteCurso = function (id, nombre) {
        document.getElementById('confirm-name').textContent = nombre;
        openModal('confirm-modal');

        const confirmBtn = document.getElementById('confirm-delete-btn');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

        newBtn.addEventListener('click', async function () {
            try {
                await apiFetch(`/accounts/api/cursos/${id}/`, 'DELETE');
                closeModal('confirm-modal');
                renderCursos();
                showToast('Curso eliminado correctamente');
            } catch (err) {
                closeModal('confirm-modal');
                showToast('Error al eliminar el curso', 'error');
            }
        });
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
                            <span class="tipo-badge">${reg.tipoObjeto === 'ficha' ? '🌿' : '📚'} ${escapeHtml(reg.tipoLabel)}</span>
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
    renderCursos();

});
