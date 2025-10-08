let calificacionSeleccionada = 0;
let modoEdicion = { activado: false, idresena: null };
let modalConfigurado = false; // ✅ Bandera para configurar modal una sola vez

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    gestionarHeader();
    cargarPaginaCompleta();
});

// --- LÓGICA PRINCIPAL DE CARGA DE DATOS ---
async function cargarPaginaCompleta() {
    const container = document.getElementById('detalle-empresa-container');
    const params = new URLSearchParams(window.location.search);
    const idEmpresa = params.get('id');

    if (!idEmpresa) {
        container.innerHTML = '<p class="text-danger text-center">ID de empresa no proporcionado.</p>';
        return;
    }

    try {
        const [empresaRes, resenasRes] = await Promise.all([
            fetch(`http://localhost:3000/api/empresas/${idEmpresa}`),
            fetch(`http://localhost:3000/api/resenas/empresa/${idEmpresa}`) 
        ]);

        if (!empresaRes.ok) throw new Error('La empresa no fue encontrada.');
        
        const empresa = await empresaRes.json();
        renderizarEmpresa(empresa);
        configurarModalValoracion(empresa);

        if (resenasRes.ok) {
            const resenas = await resenasRes.json();
            renderizarResenas(resenas);
        } else {
            console.warn('No se pudieron cargar las valoraciones.');
            renderizarResenas([]);
        }

    } catch (error) {
        console.error('Error al cargar la página:', error);
        container.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}

// --- FUNCIONES DE RENDERIZADO ---
function renderizarEmpresa(empresa) {
    const container = document.getElementById('detalle-empresa-container');

    const logoUrl = empresa.logo 
        ? `http://localhost:3000/uploads/fotoPerfil/${empresa.logo}?t=${Date.now()}`
        : './imagenes/logo_empresa_default.png';

    const redesSocialesHTML = (() => {
        if (!empresa.redesSociales) return '';
        try {
            const redes = JSON.parse(empresa.redesSociales);
            let html = '';
            if (redes.facebook) html += `<a href="${redes.facebook}" target="_blank" rel="noopener noreferrer" class="text-dark me-2"><i class="bi bi-facebook fs-4"></i></a>`;
            if (redes.twitter) html += `<a href="${redes.twitter}" target="_blank" rel="noopener noreferrer" class="text-dark me-2"><i class="bi bi-twitter-x fs-4"></i></a>`;
            if (redes.instagram) html += `<a href="${redes.instagram}" target="_blank" rel="noopener noreferrer" class="text-dark me-2"><i class="bi bi-instagram fs-4"></i></a>`;
            if (redes.youtube) html += `<a href="${redes.youtube}" target="_blank" rel="noopener noreferrer" class="text-dark me-2"><i class="bi bi-youtube fs-4"></i></a>`;
            return html;
        } catch {
            return '';
        }
    })();
    
    const detalleHTML = `
        <div class="row g-4">
            <div class="col-12">
                <div class="card p-4 shadow-sm">
                    <div class="d-flex flex-column flex-md-row align-items-center mb-4">
                        <img src="${logoUrl}" class="rounded-circle me-md-4 mb-3 mb-md-0" width="100" height="100" style="object-fit: contain; border: 1px solid #eee;" alt="Logo de ${empresa.nombre}">
                        <div>
                            <h2 class="fw-bold">${empresa.nombre}</h2>
                            ${empresa.direccion ? `<p class="mb-1 text-muted"><i class="bi bi-geo-alt-fill me-1"></i>${empresa.direccion}</p>` : ''}
                        </div>
                        <div class="ms-md-auto mt-3 mt-md-0">
                            <button class="btn btn-primary" id="btn-abrir-modal-valorar"><i class="bi bi-star-fill me-2"></i>Valorar Empresa</button>
                        </div>
                    </div>
                    ${empresa.descripcion ? `<h5 class="fw-bold mt-3">Sobre la Empresa</h5><p class="text-muted" style="white-space: pre-wrap;">${empresa.descripcion}</p>` : ''}
                    ${redesSocialesHTML ? `<h5 class="fw-bold mt-4">Síguenos</h5><div class="d-flex gap-2">${redesSocialesHTML}</div>` : ''}
                </div>
            </div>
        </div>`;

    container.innerHTML = detalleHTML;
}

function renderizarResenas(resenas) {
    const container = document.getElementById('lista-resenas-container');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    container.innerHTML = '';

    if (resenas.length === 0) {
        container.innerHTML = '<div class="text-center p-4 border rounded text-muted">Aún no hay valoraciones para esta empresa. ¡Sé el primero en dejar una!</div>';
        return;
    }

    resenas.forEach(resena => {
        const fotoUrl = resena.Usuario?.foto_perfil 
            ? `http://localhost:3000/uploads/fotoPerfil/${resena.Usuario.foto_perfil}` 
            : './imagenes/imagen.png';
        const fecha = new Date(resena.fecha).toLocaleDateString('es-ES');
        
        let menuAcciones = '';
        if (usuario && resena.Usuario && usuario.id === resena.Usuario.id) {
            menuAcciones = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><button class="dropdown-item btn-editar-resena" data-idresena="${resena.idcalificacion}" data-calificacion="${resena.calificacion}" data-comentario="${resena.comentario}">Editar</button></li>
                        <li><button class="dropdown-item text-danger btn-eliminar-resena" data-idresena="${resena.idcalificacion}">Eliminar</button></li>
                    </ul>
                </div>`;
        }

        const resenaHTML = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <div class="d-flex align-items-center flex-grow-1">
                            <img src="${fotoUrl}" class="rounded-circle me-3" width="40" height="40" alt="Foto de ${resena.Usuario?.nombre}">
                            <div>
                                <h6 class="mb-0 fw-bold">${resena.Usuario?.nombre || 'Anónimo'}</h6>
                                <small class="text-muted">${fecha}</small>
                            </div>
                        </div>
                        <div class="text-warning me-2">${renderizarEstrellas(resena.calificacion)}</div>
                        ${menuAcciones}
                    </div>
                    <p class="card-text mt-2 fst-italic">"${resena.comentario}"</p>
                </div>
            </div>`;
        container.innerHTML += resenaHTML;
    });

    configurarBotonesDeAccion();
}

// --- LÓGICA DE VALORACIÓN (MODAL Y ACCIONES) ---
function configurarModalValoracion(empresa) {
    // ✅ Si ya está configurado, solo actualizamos el botón
    if (modalConfigurado) {
        const btnAbrirModal = document.getElementById('btn-abrir-modal-valorar');
        if (btnAbrirModal) {
            btnAbrirModal.onclick = () => abrirModalValorar(empresa);
        }
        return;
    }

    const btnAbrirModal = document.getElementById('btn-abrir-modal-valorar');
    if (!btnAbrirModal) return;

    const modalEl = document.getElementById('modal-valorar');
    const modalValorar = new bootstrap.Modal(modalEl);

    // ✅ Configurar botón de abrir modal
    btnAbrirModal.addEventListener('click', () => abrirModalValorar(empresa));

    // ✅ Configurar el formulario
    document.getElementById('form-valoracion').addEventListener('submit', (e) => {
        e.preventDefault();
        enviarValoracion(empresa.idempresa);
    });

    // ✅ Configurar las estrellas
    document.querySelectorAll('#rating-input i').forEach(estrella => {
        estrella.addEventListener('mouseover', () => pintarEstrellas(estrella.dataset.value));
        estrella.addEventListener('mouseout', () => pintarEstrellas(calificacionSeleccionada));
        estrella.addEventListener('click', () => {
            calificacionSeleccionada = estrella.dataset.value;
        });
    });

    modalConfigurado = true; // ✅ Marcar como configurado
}

// ✅ Nueva función para abrir el modal
function abrirModalValorar(empresa) {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    if (!token || !usuario) {
        alert('Debes iniciar sesión para valorar una empresa.');
        window.location.href = 'login.html';
        return;
    }
    if (usuario.rol === 'Empleador' && usuario.idempresa === empresa.idempresa) {
        alert('No puedes valorar tu propia empresa.');
        return;
    }
    
    modoEdicion = { activado: false, idresena: null };
    document.getElementById('modalValorarLabel').textContent = `Valorar a ${empresa.nombre}`;
    document.getElementById('btn-publicar-valoracion').textContent = 'Publicar Valoración';
    document.getElementById('form-valoracion').reset();
    calificacionSeleccionada = 0;
    pintarEstrellas(0);
 
    const modalValorar = new bootstrap.Modal(document.getElementById('modal-valorar'));
    modalValorar.show();
}

function configurarBotonesDeAccion() {
    document.querySelectorAll('.btn-eliminar-resena').forEach(btn => {
        btn.addEventListener('click', (e) => {
            eliminarResena(e.currentTarget.dataset.idresena);
        });
    });

    document.querySelectorAll('.btn-editar-resena').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { idresena, calificacion, comentario } = e.currentTarget.dataset;
            
            modoEdicion = { activado: true, idresena };

            document.getElementById('modalValorarLabel').textContent = 'Editar tu valoración';
            document.getElementById('btn-publicar-valoracion').textContent = 'Guardar Cambios';
            document.getElementById('comentario-valoracion').value = comentario;
            calificacionSeleccionada = calificacion;
            pintarEstrellas(calificacion);

            new bootstrap.Modal(document.getElementById('modal-valorar')).show();
        });
    });
}

async function enviarValoracion(idEmpresa) {
    const token = localStorage.getItem('token');
    const comentario = document.getElementById('comentario-valoracion').value.trim();
    
    if (calificacionSeleccionada < 1) {
        alert('Por favor selecciona una calificación.');
        return;
    }
    if (!comentario) {
        alert('Por favor escribe un comentario.');
        return;
    }

    const btnPublicar = document.getElementById('btn-publicar-valoracion');
    btnPublicar.disabled = true;

    let url, method;
    if (modoEdicion.activado) {
        method = 'PUT';
        url = `http://localhost:3000/api/resenas/${modoEdicion.idresena}`;
    } else {
        method = 'POST';
        url = `http://localhost:3000/api/resenas/empresa/${idEmpresa}`;
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ calificacion: calificacionSeleccionada, comentario })
        });
        
        const resData = await response.json();
        if (!response.ok) {
            throw new Error(resData.message || 'Error al procesar la reseña');
        }

        alert(`¡Valoración ${modoEdicion.activado ? 'actualizada' : 'publicada'} correctamente!`);
        bootstrap.Modal.getInstance(document.getElementById('modal-valorar')).hide();
        
        cargarPaginaCompleta();

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btnPublicar.disabled = false;
        modoEdicion = { activado: false, idresena: null };
    }
}

async function eliminarResena(idresena) {
    if (!confirm('¿Estás seguro de que quieres eliminar tu reseña?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/resenas/${idresena}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Error al eliminar la reseña');
        }
        alert('Reseña eliminada correctamente.');
        cargarPaginaCompleta();

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// --- FUNCIONES AUXILIARES ---
function pintarEstrellas(valor) {
    document.querySelectorAll('#rating-input i').forEach(estrella => {
        estrella.classList.toggle('bi-star-fill', estrella.dataset.value <= valor);
        estrella.classList.toggle('bi-star', estrella.dataset.value > valor);
    });
}

function renderizarEstrellas(valoracion) {
    let estrellasHTML = '';
    const rating = parseFloat(valoracion) || 0;
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) estrellasHTML += '<i class="bi bi-star-fill"></i>';
        else estrellasHTML += '<i class="bi bi-star"></i>';
    }
    return estrellasHTML;
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