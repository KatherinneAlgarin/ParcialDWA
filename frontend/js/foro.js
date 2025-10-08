let debounceTimer;
let modoEdicionForo = { activado: false, idforo: null };

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    gestionarHeader();
    cargarTemas();

    // --- CORRECCIÓN 1: Creamos la instancia del modal UNA SOLA VEZ ---
    const postModalEl = document.getElementById('postModal');
    const postModal = new bootstrap.Modal(postModalEl);

    // --- CONFIGURACIÓN DE EVENT LISTENERS ---
    const inputBusqueda = document.getElementById('input-busqueda-foro');
    inputBusqueda.addEventListener('keyup', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => cargarTemas(inputBusqueda.value), 300);
    });

    const btnAbrirModal = document.getElementById('btn-abrir-modal-foro');
    btnAbrirModal.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) {
            if (confirm('Debes iniciar sesión para crear un tema. ¿Deseas ir al login?')) {
                window.location.href = 'signin.html';
            }
        } else {
            modoEdicionForo = { activado: false, idforo: null };
            document.getElementById('postModalLabel').textContent = 'Crear un nuevo tema de discusión';
            document.getElementById('btn-publicar-tema').textContent = 'Publicar';
            document.getElementById('form-nuevo-tema').reset();
            postModal.show(); // Reutilizamos la instancia del modal
        }
    });

    const formNuevoTema = document.getElementById('form-nuevo-tema');
    formNuevoTema.addEventListener('submit', (e) => {
        e.preventDefault();
        enviarFormularioForo(postModal); // Pasamos la instancia del modal
    });
});


// --- LÓGICA PRINCIPAL ---

async function cargarTemas(busqueda = '') {
    const container = document.getElementById('temas-container');
    container.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;

    let url = 'http://localhost:3000/api/foros';
    if (busqueda) url += `?busqueda=${encodeURIComponent(busqueda)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudieron cargar los temas.');
        const temas = await response.json();
        renderizarTemas(temas);
    } catch (error) {
        console.error('Error al cargar temas:', error);
        container.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}

function renderizarTemas(temas) {
    const container = document.getElementById('temas-container');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    container.innerHTML = '';

    if (temas.length === 0) { /* ... tu mensaje de "Rompe el Hielo" ... */ return; }

    temas.forEach(tema => {
        const fecha = new Date(tema.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const totalRespuestas = tema.dataValues?.totalRespuestas || 0;
        
        let menuAcciones = '';
        // Si el usuario logueado es el autor del tema, muestra el menú de acciones
        if (usuario && tema.Usuario && usuario.id === tema.Usuario.id) {
            menuAcciones = `
                <div class="dropdown position-absolute top-0 end-0 mt-2 me-2">
                    <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><button class="dropdown-item btn-editar-tema" 
                            data-idforo="${tema.idforo}" 
                            data-titulo="${tema.titulo}" 
                            data-descripcion="${tema.descripcion || ''}">Editar</button></li>
                        <li><button class="dropdown-item text-danger btn-eliminar-tema" data-idforo="${tema.idforo}">Eliminar</button></li>
                    </ul>
                </div>`;
        }

        const temaHTML = `
            <div class="card shadow-sm mb-4 position-relative">
                <div class="card-body">
                    ${menuAcciones}
                    <h5 class="card-title fw-bold">${tema.titulo}</h5>
                    <p class="card-text text-muted">${tema.descripcion || ''}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <small class="text-muted">Por: <strong>${tema.Usuario?.nombre || 'Anónimo'}</strong> el ${fecha}</small>
                        </div>
                        <a href="respuestasForo.html?id=${tema.idforo}" class="btn btn-outline-primary">
                            Ver Respuestas <i class="bi bi-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>`;
        container.innerHTML += temaHTML;
    });

    configurarBotonesDeAccion();
}


// --- ACCIONES ---

function configurarBotonesDeAccion() {
    document.querySelectorAll('.btn-editar-tema').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { idforo, titulo, descripcion } = e.currentTarget.dataset;
            modoEdicionForo = { activado: true, idforo };
            
            document.getElementById('postModalLabel').textContent = 'Editar Tema';
            document.getElementById('nuevo-tema-titulo').value = titulo;
            document.getElementById('nuevo-tema-descripcion').value = descripcion;
            document.getElementById('btn-publicar-tema').textContent = 'Guardar Cambios';

            // Reutilizamos la instancia del modal
            const postModal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            postModal.show();
        });
    });

    document.querySelectorAll('.btn-eliminar-tema').forEach(btn => {
        btn.addEventListener('click', (e) => {
            eliminarTema(e.currentTarget.dataset.idforo);
        });
    });
}

async function enviarFormularioForo(modalInstance) {
    const titulo = document.getElementById('nuevo-tema-titulo').value.trim();
    if (!titulo) { alert('El título es obligatorio.'); return; }
    
    const descripcion = document.getElementById('nuevo-tema-descripcion').value.trim();
    const token = localStorage.getItem('token');
    const btnPublicar = document.getElementById('btn-publicar-tema');
    btnPublicar.disabled = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 

    let url, method;
    if (modoEdicionForo.activado) {
        method = 'PUT';
        url = `http://localhost:3000/api/foros/${modoEdicionForo.idforo}`;
    } else {
        method = 'POST';
        url = 'http://localhost:3000/api/foros';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ titulo, descripcion }),
            signal: controller.signal 
        });
        
        clearTimeout(timeoutId); 
        
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);
        
        alert(`¡Tema ${modoEdicionForo.activado ? 'actualizado' : 'publicado'} correctamente!`);
        modalInstance.hide();
        cargarTemas();

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            alert('Error: La petición tardó demasiado en responder.');
        } else {
            alert(`Error: ${error.message}`);
        }
    } finally {
        btnPublicar.disabled = false;
    }
}


async function eliminarTema(idforo) {
    if (!confirm('¿Estás seguro de eliminar este tema? Todas sus respuestas también se borrarán.')) return;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:3000/api/foros/${idforo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message);

        alert('Tema eliminado correctamente.');
        cargarTemas();
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
function gestionarHeader() {
    const authInvitado = document.getElementById('auth-invitado');
    const authUsuario = document.getElementById('auth-usuario');
    if (!authInvitado || !authUsuario) return;

    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (token && usuario) {
        authInvitado.style.display = 'none';
        authUsuario.style.display = 'flex';

        const nombreUsuarioEl = document.getElementById('nombre-usuario');
        if (nombreUsuarioEl) nombreUsuarioEl.textContent = `Bienvenido, ${usuario.nombre}`;

        const panelLink = document.getElementById('panel-link');
        if (usuario.rol === 'Candidato') panelLink.href = 'homeCandidato.html';
        else if (usuario.rol === 'Empleador') panelLink.href = 'empresa.html';

        const fotoPerfilEl = document.getElementById('foto-perfil-usuario');
        if (fotoPerfilEl && usuario.foto_perfil) {
            fotoPerfilEl.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
        }
    } else {
        authInvitado.style.display = 'flex';
        authUsuario.style.display = 'none';
    }
}