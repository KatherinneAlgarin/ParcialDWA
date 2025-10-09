let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
    gestionarHeader();
    cargarRecursos(); 

    const formBusqueda = document.getElementById('form-busqueda-recursos');
    formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault();
        cargarRecursos(document.getElementById('input-busqueda').value);
    });

    
    const inputBusqueda = document.getElementById('input-busqueda');
    inputBusqueda.addEventListener('keyup', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            cargarRecursos(inputBusqueda.value);
        }, 500); 
    });
});

/**
 * Carga los recursos desde el backend y los clasifica por categoría.
 * @param {string} [busqueda=''] - Término para filtrar por título.
 */
async function cargarRecursos(busqueda = '') {
    
    const contenedores = ['entrevistas-container', 'cv-container', 'habilidades-container'];
    contenedores.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `<div class="col-12 text-center p-5"><div class="spinner-border text-secondary"></div></div>`;
    });

    let url = 'http://localhost:3000/api/recursos';
    if (busqueda) {
        url += `?busqueda=${encodeURIComponent(busqueda)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudieron cargar los recursos.');

        const recursos = await response.json();
      
        const recursosAgrupados = {
            'Preparación para entrevistas': [],
            'CV y cartas de presentación': [],
            'Desarrollo de habilidades': [],
            'Otros': []
        };

        recursos.forEach(recurso => {
            if (recursosAgrupados.hasOwnProperty(recurso.tipoRecurso)) {
                recursosAgrupados[recurso.tipoRecurso].push(recurso);
            } else {
                recursosAgrupados['Otros'].push(recurso);
            }
        });

        renderizarCategoria('entrevistas-container', recursosAgrupados['Preparación para entrevistas']);
        renderizarCategoria('cv-container', recursosAgrupados['CV y cartas de presentación']);
        renderizarCategoria('habilidades-container', recursosAgrupados['Desarrollo de habilidades']);
        
    } catch (error) {
        console.error('Error al cargar recursos:', error);
        contenedores.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p class="text-danger">${error.message}</p>`;
        });
    }
}

/**
 * Renderiza las tarjetas de recursos en un contenedor específico.
 * @param {string} containerId - id del div contenedor.
 * @param {Array} recursos - El arreglo de recursos para esa categoría.
 */
function renderizarCategoria(containerId, recursos) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (recursos.length === 0) {
        container.innerHTML = '<p class="col-12 text-muted fst-italic">No hay recursos en esta categoría por el momento.</p>';
        return;
    }

    recursos.forEach(recurso => {
        const logoUrl = recurso.Empresa?.logo 
            ? `http://localhost:3000/uploads/fotoPerfil/${recurso.Empresa.logo}` 
            : './imagenes/logo_empresa_default.png';

        const cardHTML = `
            <div class="col-md-4">
                <a href="${recurso.link}" target="_blank" rel="noopener noreferrer" class="card h-100 shadow-sm text-decoration-none recurso-card">
                    <div class="card-img-top bg-dark text-white d-flex align-items-center justify-content-center" style="height: 150px;">
                        <i class="bi bi-link-45deg" style="font-size: 3rem;"></i>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title fw-bold">${recurso.titulo}</h5>
                        <p class="card-text small text-muted">${recurso.descripcion || ''}</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex align-items-center">
                        <img src="${logoUrl}" class="rounded-circle me-2" style="width: 24px; height: 24px; object-fit: contain;">
                        <small class="text-muted">Publicado por ${recurso.Empresa?.nombre || 'Anónimo'}</small>
                    </div>
                </a>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
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