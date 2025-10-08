let todasLasAplicaciones = []; // Guardaremos todas las aplicaciones aquí
let ofertasDelEmpleador = [];   // Guardaremos las ofertas para el filtro

document.addEventListener('DOMContentLoaded', () => {
    protegerPagina('Empleador');
    gestionarHeader(); // Reutilizamos la función de auth.js
    
    inicializarPagina();

    document.getElementById('form-busqueda-candidatos').addEventListener('submit', (e) => {
        e.preventDefault();
        filtrarCandidatos();
    });
});

async function inicializarPagina() {
    const token = localStorage.getItem('token');
    try {
        // Obtenemos las ofertas y las aplicaciones al mismo tiempo
        const [ofertasRes, aplicacionesRes] = await Promise.all([
            fetch('http://localhost:3000/api/ofertas/mi-empresa/ofertas', { headers: { 'Authorization': `Bearer ${token}` } }),
            // Necesitamos un nuevo endpoint para traer TODAS las aplicaciones de una empresa
            fetch('http://localhost:3000/api/aplicaciones/empresa/todas', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!ofertasRes.ok || !aplicacionesRes.ok) throw new Error('No se pudieron cargar los datos.');

        ofertasDelEmpleador = await ofertasRes.json();
        todasLasAplicaciones = await aplicacionesRes.json();

        poblarFiltroOfertas();
        renderizarCandidatos(todasLasAplicaciones);

    } catch (error) {
        document.getElementById('candidatos-container').innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}

function poblarFiltroOfertas() {
    const select = document.getElementById('filtro-oferta');
    ofertasDelEmpleador.forEach(oferta => {
        const option = document.createElement('option');
        option.value = oferta.idoferta;
        option.textContent = oferta.titulo;
        select.appendChild(option);
    });
}

function filtrarCandidatos() {
    const idOfertaSeleccionada = document.getElementById('filtro-oferta').value;
    const nombreCandidato = document.getElementById('filtro-nombre-candidato').value.toLowerCase();

    let aplicacionesFiltradas = todasLasAplicaciones;

    // Filtrar por oferta
    if (idOfertaSeleccionada) {
        aplicacionesFiltradas = aplicacionesFiltradas.filter(app => app.idoferta == idOfertaSeleccionada);
    }

    // Filtrar por nombre de candidato
    if (nombreCandidato) {
        aplicacionesFiltradas = aplicacionesFiltradas.filter(app => app.Usuario.nombre.toLowerCase().includes(nombreCandidato));
    }

    renderizarCandidatos(aplicacionesFiltradas);
}

function renderizarCandidatos(aplicaciones) {
    const container = document.getElementById('candidatos-container');
    container.innerHTML = '';

    if (aplicaciones.length === 0) {
        container.innerHTML = `<div class="list-group-item text-center text-muted p-4">No se encontraron candidatos que coincidan con la búsqueda.</div>`;
        return;
    }

    aplicaciones.forEach(app => {
        // Reutilizamos la misma lógica de renderizado y acciones de verCandidatos.js
        const candidato = app.Usuario;
        const fotoUrl = candidato.foto_perfil ? `http://localhost:3000/uploads/fotoPerfil/${candidato.foto_perfil}` : './imagenes/imagen.png';

        const candidatoHTML = `
            <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="d-flex align-items-center">
                    <img src="${fotoUrl}" class="rounded-circle me-3" style="width:50px; height:50px; object-fit:cover;">
                    <div>
                        <div class="fw-bold">${candidato.nombre}</div>
                        <small class="text-muted">Aplicó para: ${app.Oferta.titulo}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="verPerfil(${app.idaplicacion})">
                        <i class="bi bi-person-fill"></i> Ver Perfil
                    </button>
                    <a href="http://localhost:3000/uploads/curriculums/${app.cv_path}" target="_blank" class="btn btn-outline-success btn-sm ${!app.cv_path ? 'disabled' : ''}" download>
                        <i class="bi bi-download"></i> CV
                    </a>
                    <select class="form-select form-select-sm" style="width: auto;" onchange="actualizarEstado(${app.idaplicacion}, this.value)">
                        <option value="Activa" ${app.estado === 'Activa' ? 'selected' : ''}>Activa</option>
                        <option value="En revisión" ${app.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="Aceptada" ${app.estado === 'Aceptada' ? 'selected' : ''}>Aceptada</option>
                        <option value="Rechazada" ${app.estado === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
                    </select>
                </div>
            </div>`;
        container.innerHTML += candidatoHTML;
    });
}
function verPerfil(idaplicacion) {
    const aplicacion = todasLasAplicaciones.find(app => app.idaplicacion === idaplicacion);
    if (!aplicacion || !aplicacion.Usuario) {
        alert('No se pudo encontrar la información del candidato.');
        return;
    }
    
    const candidato = aplicacion.Usuario;
    const modalBody = document.getElementById('modal-body-content');
    document.getElementById('perfilModalLabel').textContent = `Perfil de ${candidato.nombre}`;

    const fotoUrl = candidato.foto_perfil 
        ? `http://localhost:3000/uploads/fotoPerfil/${candidato.foto_perfil}` 
        : './imagenes/imagen.png';

    // Procesar redes sociales de forma segura
    const redesSocialesHTML = (() => {
        if (!candidato.redes_sociales) return '';
        try {
            const redes = JSON.parse(candidato.redes_sociales);
            let html = '';
            if (redes.facebook) html += `<a href="${redes.facebook}" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-facebook"></i></a>`;
            if (redes.twitter) html += `<a href="${redes.twitter}" target="_blank" class="btn btn-outline-info btn-sm"><i class="bi bi-twitter-x"></i></a>`;
            if (redes.instagram) html += `<a href="${redes.instagram}" target="_blank" class="btn btn-outline-danger btn-sm"><i class="bi bi-instagram"></i></a>`;
            // Añade más redes si las tienes
            return html ? `<h6 class="fw-bold mt-4 mb-2">Redes Sociales</h6><div class="d-flex gap-2">${html}</div>` : '';
        } catch { return ''; }
    })();

    // Construimos el HTML del modal dinámicamente
    modalBody.innerHTML = `
        <div class="card border-0 p-3">
            <div class="d-flex align-items-center mb-4">
                <img src="${fotoUrl}" class="rounded-circle me-3" style="width:80px; height:80px; object-fit:cover;">
                <div>
                    <h5 class="fw-bold mb-0">${candidato.nombre}</h5>
                    <p class="text-muted mb-0">${candidato.correo}</p>
                </div>
            </div>

            <div class="row">
                <div class="col-md-7">
                    ${candidato.biografia ? `
                        <h6 class="fw-bold mb-2">BIOGRAFÍA</h6>
                        <p class="text-muted small" style="white-space: pre-wrap;">${candidato.biografia}</p>
                    ` : ''}
                    
                    ${redesSocialesHTML}

                    ${aplicacion.carta_presentacion ? `
                        <h6 class="fw-bold mt-4 mb-2">CARTA DE PRESENTACIÓN</h6>
                        <p class="small fst-italic" style="white-space: pre-wrap;">"${aplicacion.carta_presentacion}"</p>
                    ` : ''}
                </div>

                <div class="col-md-5">
                    <div class="card bg-light border-0 p-3">
                        <h6 class="fw-bold border-bottom pb-2 mb-3">Información del Candidato</h6>
                        <ul class="list-unstyled small">
                            ${candidato.fecha_nacimiento ? `<li class="mb-2"><i class="bi bi-calendar-event me-2"></i><b>Nacimiento:</b> ${new Date(candidato.fecha_nacimiento).toLocaleDateString('es-ES')}</li>` : ''}
                            ${candidato.nacionalidad ? `<li class="mb-2"><i class="bi bi-flag me-2"></i><b>Nacionalidad:</b> ${candidato.nacionalidad}</li>` : ''}
                            ${candidato.direccion ? `<li class="mb-2"><i class="bi bi-geo-alt me-2"></i><b>Ubicación:</b> ${candidato.direccion}</li>` : ''}
                            ${candidato.telefono ? `<li class="mb-2"><i class="bi bi-telephone me-2"></i><b>Teléfono:</b> ${candidato.telefono}</li>` : ''}
                            ${candidato.experiencia ? `<li class="mb-2"><i class="bi bi-briefcase me-2"></i><b>Experiencia:</b> ${candidato.experiencia}</li>` : ''}
                            ${candidato.educacion ? `<li class="mb-2"><i class="bi bi-mortarboard me-2"></i><b>Educación:</b> ${candidato.educacion}</li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        </div>`;

    const modal = new bootstrap.Modal(document.getElementById('perfilModal'));
    modal.show();
}


async function actualizarEstado(idaplicacion, nuevoEstado) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/aplicaciones/${idaplicacion}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'No se pudo actualizar el estado.');
        }

        // Para no recargar toda la página, actualizamos el dato en nuestro arreglo local
        const aplicacionIndex = todasLasAplicaciones.findIndex(app => app.idaplicacion === idaplicacion);
        if (aplicacionIndex > -1) {
            todasLasAplicaciones[aplicacionIndex].estado = nuevoEstado;
        }
        
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert(`Error: ${error.message}`);
        // Si falla, recargamos la lista para revertir el cambio visual en el select
        renderizarListaCandidatos(todasLasAplicaciones);
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
function renderizarListaCandidatos(aplicaciones) {
    const container = document.getElementById('lista-candidatos-container');
    container.innerHTML = '';

    if (aplicaciones.length === 0) {
        container.innerHTML = `<div class="list-group-item text-center text-muted p-4">No hay candidatos para esta oferta todavía.</div>`;
        return;
    }

    aplicaciones.forEach(app => {
        const candidato = app.Usuario;
        const fotoUrl = candidato.foto_perfil ? `http://localhost:3000/uploads/fotoPerfil/${candidato.foto_perfil}` : './imagenes/imagen.png';

        const candidatoHTML = `
            <div class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="d-flex align-items-center">
                    <img src="${fotoUrl}" class="rounded-circle me-3" style="width:50px; height:50px; object-fit:cover;">
                    <div>
                        <div class="fw-bold">${candidato.nombre}</div>
                        <small class="text-muted">${candidato.correo}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="verPerfil(${app.idaplicacion})">
                        <i class="bi bi-person-fill"></i> Ver Perfil
                    </button>
                    <a href="http://localhost:3000/uploads/curriculums/${app.cv_path}" target="_blank" class="btn btn-outline-success btn-sm ${!app.cv_path ? 'disabled' : ''}" download>
                        <i class="bi bi-download"></i> Descargar CV
                    </a>
                    <select class="form-select form-select-sm" style="width: auto;" onchange="actualizarEstado(${app.idaplicacion}, this.value)">
                        <option value="Activa" ${app.estado === 'Activa' ? 'selected' : ''}>Activa</option>
                        <option value="En revisión" ${app.estado === 'En revisión' ? 'selected' : ''}>En revisión</option>
                        <option value="Aceptada" ${app.estado === 'Aceptada' ? 'selected' : ''}>Aceptada</option>
                        <option value="Rechazada" ${app.estado === 'Rechazada' ? 'selected' : ''}>Rechazada</option>
                    </select>
                </div>
            </div>`;
        container.innerHTML += candidatoHTML;
    });
}