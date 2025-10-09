let idOfertaActual = null;
let aplicacionesActuales = [];

document.addEventListener('DOMContentLoaded', () => {
    protegerPagina('Empleador');
    
    const params = new URLSearchParams(window.location.search);
    idOfertaActual = params.get('id');

    if (!idOfertaActual) {
        document.body.innerHTML = '<p class="text-danger text-center m-5">Error: No se especificó una oferta.</p>';
        return;
    }
    
    cargarCandidatos(idOfertaActual);
});

async function cargarCandidatos(idoferta) {
    const container = document.getElementById('lista-candidatos-container');
    const token = localStorage.getItem('token');
    container.innerHTML = `<div class="list-group-item text-center p-5"><div class="spinner-border text-primary"></div></div>`;

    try {
        const response = await fetch(`http://localhost:3000/api/ofertas/${idoferta}/aplicaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'No se pudieron cargar los candidatos.');
        }
        
        aplicacionesActuales = await response.json();
        
        const tituloOferta = aplicacionesActuales[0]?.Oferta?.titulo || 'Candidatos';
        document.getElementById('titulo-oferta').textContent = `Candidatos para: ${tituloOferta}`;

        renderizarListaCandidatos(aplicacionesActuales);

    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<div class="list-group-item text-center text-danger p-4">${error.message}</div>`;
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

function verPerfil(idaplicacion) {
    const aplicacion = aplicacionesActuales.find(app => app.idaplicacion === idaplicacion);
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

    
    const redesSocialesHTML = (() => {
        if (!candidato.redes_sociales) return '';
        try {
            const redes = JSON.parse(candidato.redes_sociales);
            let html = '';
            if (redes.facebook) html += `<a href="${redes.facebook}" target="_blank" class="btn btn-outline-primary btn-sm"><i class="bi bi-facebook"></i></a>`;
            if (redes.twitter) html += `<a href="${redes.twitter}" target="_blank" class="btn btn-outline-info btn-sm"><i class="bi bi-twitter-x"></i></a>`;
            if (redes.instagram) html += `<a href="${redes.instagram}" target="_blank" class="btn btn-outline-danger btn-sm"><i class="bi bi-instagram"></i></a>`;
        
            return html ? `<h6 class="fw-bold mt-4 mb-2">Redes Sociales</h6><div class="d-flex gap-2">${html}</div>` : '';
        } catch { return ''; }
    })();


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

        
        const aplicacionIndex = aplicacionesActuales.findIndex(app => app.idaplicacion === idaplicacion);
        if (aplicacionIndex > -1) {
            aplicacionesActuales[aplicacionIndex].estado = nuevoEstado;
        }
        
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert(`Error: ${error.message}`);
        renderizarListaCandidatos(aplicacionesActuales);
    }
}