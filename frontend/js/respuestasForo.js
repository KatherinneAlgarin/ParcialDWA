let idForoActual = null; 

document.addEventListener('DOMContentLoaded', () => {
    gestionarHeader();
    const params = new URLSearchParams(window.location.search);
    idForoActual = params.get('id');

    if (!idForoActual) {
        document.body.innerHTML = '<p class="text-center text-danger m-5">Error: No se especificó un tema del foro.</p>';
        return;
    }
    cargarTemaCompleto(idForoActual);
    configurarFormularioPrincipal(idForoActual);
    configurarEventListenersEstaticos(idForoActual);
});
async function cargarTemaCompleto(idforo) {
    const temaContainer = document.getElementById('tema-principal-container');
    const respuestasContainer = document.getElementById('respuestas-container');
    temaContainer.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;
    respuestasContainer.innerHTML = '';

    try {
        const response = await fetch(`http://localhost:3000/api/foros/${idforo}`);
        if (!response.ok) throw new Error('No se pudo cargar el tema del foro.');
        const tema = await response.json();

        renderizarTemaPrincipal(tema);
        renderizarRespuestas(tema.RespuestaForos || []);

    } catch (error) {
        console.error('Error:', error);
        temaContainer.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}



function renderizarTemaPrincipal(tema) {
    const container = document.getElementById('tema-principal-container');
    document.getElementById('titulo-pagina').textContent = tema.titulo;
    const fecha = new Date(tema.fecha_creacion).toLocaleDateString('es-ES', { dateStyle: 'long' });
    const fotoUrl = tema.Usuario?.foto_perfil ? `http://localhost:3000/uploads/fotoPerfil/${tema.Usuario.foto_perfil}` : './imagenes/imagen.png';

    container.innerHTML = `
        <div class="card shadow-sm mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <img src="${fotoUrl}" alt="Usuario" class="rounded-circle me-3" style="width: 50px; height: 50px;">
                    <div>
                        <h6 class="mb-0 fw-bold">${tema.Usuario?.nombre || 'Anónimo'}</h6>
                        <small class="text-muted">Publicado el ${fecha}</small>
                    </div>
                </div>
                <hr>
                <h4 class="fw-bold">${tema.titulo}</h4>
                <p class="mt-2" style="white-space: pre-wrap;">${tema.descripcion || ''}</p>
            </div>
        </div>`;
}


function renderizarRespuestas(respuestas) {
    const container = document.getElementById('respuestas-container');
    container.innerHTML = '';

    if (!respuestas || respuestas.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Aún no hay respuestas. ¡Sé el primero en comentar!</p>';
        return;
    }
    
    let respuestasHTML = '';
    respuestas.forEach(respuesta => {
        respuestasHTML += crearHtmlRespuesta(respuesta, 0);
    });

    container.innerHTML = respuestasHTML;
}

function crearHtmlRespuesta(respuesta, nivel) {
    const fecha = new Date(respuesta.fecha_respuesta).toLocaleString('es-ES', { hour12: true });
    const fotoUrl = respuesta.Usuario?.foto_perfil
        ? `http://localhost:3000/uploads/fotoPerfil/${respuesta.Usuario.foto_perfil}`
        : './imagenes/imagen.png';

    // ✅ Regla: cualquier nivel > 0 recibe UNA sangría fija (30px). El nivel 0 no tiene sangría.
    const paddingLeft = (nivel > 0) ? 30 : 0;
    const paddingInterno = 16 + paddingLeft; // espacio base + posible sangría

    // mención al usuario padre (si existe)
    let mencionHtml = '';
    if (respuesta.Padre && respuesta.Padre.Usuario) {
        mencionHtml = `<a href="#" class="fw-bold text-decoration-none me-1">@${respuesta.Padre.Usuario.nombre}</a>`;
    }

    // comenzar a construir HTML de la respuesta
    let html = `
        <div id="respuesta-${respuesta.idrespuesta}" class="mb-3 reply-item">
            <div class="card shadow-sm reply-card">
            <div class="card-body" style="padding-left: ${paddingInterno}px; position: relative;">
                <div class="d-flex">
                <img src="${fotoUrl}" class="rounded-circle me-3" style="width:45px;height:45px;" alt="Usuario">
                <div>
                    <h6 class="fw-bold mb-0">${respuesta.Usuario?.nombre || 'Anónimo'}
                    <small class="text-muted fw-normal">· ${fecha}</small>
                    </h6>
                    <div class="mb-2" style="white-space: pre-wrap;">
                    ${mencionHtml}${respuesta.contenido}
                </div>
                <div>
                    <button class="btn btn-sm btn-link text-decoration-none ps-0 btn-responder" data-parent-id="${respuesta.idrespuesta}">
                    Responder
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
    `;

    // Renderizar las hijas (si las hay)
    if (respuesta.Hijas && respuesta.Hijas.length > 0) {
        // NOTA: no aumentamos la sangría aquí; la sangría se controla por `nivel` arriba.
        html += `<div class="nested-replies-container mt-2">`;
        respuesta.Hijas.forEach(hija => {
            // importante: pasar nivel + 1 para que `nivel > 0` siga siendo true en hijas
            html += crearHtmlRespuesta(hija, nivel + 1);
        });
        html += `</div>`;
    }

    html += `</div>`; // cierre del wrapper de la respuesta
    return html;
}



function mostrarFormularioDeRespuesta(botonResponder) {
    const formExistente = document.querySelector('.form-respuesta-anidada');
    if (formExistente) {
        formExistente.remove();
    }

    const parentId = botonResponder.dataset.parentId;
    const tarjetaPadre = document.getElementById(`respuesta-${parentId}`).querySelector('.card-body');

    const formHTML = `
        <div class="form-respuesta-anidada mt-3">
            <textarea class="form-control form-control-sm" rows="2" placeholder="Escribe una respuesta..."></textarea>
            <div class="text-end mt-2">
                <button class="btn btn-sm btn-secondary btn-cancelar-anidado">Cancelar</button>
                <button class="btn btn-sm btn-primary btn-publicar-anidado" data-parent-id="${parentId}">Publicar</button>
            </div>
        </div>`;

    tarjetaPadre.insertAdjacentHTML('beforeend', formHTML);
    tarjetaPadre.querySelector('textarea').focus();
}

function configurarFormularioPrincipal(idforo) {
    const formContainer = document.getElementById('form-respuesta-principal-container');
    const form = document.getElementById('form-respuesta-principal');
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        formContainer.style.display = 'none';
        return;
    }

    formContainer.style.display = 'block';
    const fotoUsuario = document.getElementById('foto-usuario-respuesta');
    if (usuario.foto_perfil) {
        fotoUsuario.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
    }
}

async function enviarRespuesta(idforo, contenido, parent_id) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:3000/api/respuestas-foro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ idforo, contenido, parent_id })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Error desconocido al publicar.');
        }
        
        cargarTemaCompleto(idforo);

    } catch (error) {
        alert(`Error al publicar tu respuesta: ${error.message}`);
    }
}

function gestionarHeader() {
    const estadoSesion = document.getElementById('estado-sesion');
    if (!estadoSesion) return;

    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (token && usuario) {
        const fotoUrl = usuario.foto_perfil ? `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}` : './imagenes/imagen.png';
        estadoSesion.innerHTML = `
            <span class="me-3">Bienvenido, ${usuario.nombre}</span>
            <img src="${fotoUrl}" alt="Foto de perfil" class="rounded-circle" style="width: 40px; height: 40px;">
            <a href="#" id="logout-link" class="btn btn-link text-danger">Cerrar Sesión</a>
        `;
        let panelHref = '#';
        if (usuario.rol === 'Candidato') {
            panelHref = 'homeCandidato.html';
        } else if (usuario.rol === 'Empleador') {
            panelHref = 'empresa.html';
        }
        estadoSesion.innerHTML = `
            <a href="${panelHref}" class="fw-bold text-decoration-none me-3 text-dark">
                Bienvenido, ${usuario.nombre}
            </a>
            <img src="${fotoUrl}" alt="Foto de perfil" class="rounded-circle me-2" style="width: 40px; height: 40px;">
            <a href="#" id="logout-link" class="btn btn-link text-danger">Cerrar Sesión</a>
        `;
        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'signin.html';
        });
    } else {
        estadoSesion.innerHTML = `
            <a href="signin.html" class="btn btn-outline-primary me-2">Iniciar Sesión</a>
            <a href="crear-cuenta.html" class="btn btn-primary">Registrarse</a>
        `;
    }
}
function configurarEventListenersEstaticos(idforo) {
    const formPrincipal = document.getElementById('form-respuesta-principal');
    if (formPrincipal) {
        formPrincipal.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = document.getElementById('textarea-respuesta-principal');
            const contenido = textarea.value.trim();
            if (contenido) {
                enviarRespuesta(idforo, contenido, null);
                textarea.value = '';
            }
        });
    }
    const respuestasContainer = document.getElementById('respuestas-container');
    if (respuestasContainer) {
        respuestasContainer.addEventListener('click', (e) => {
            const target = e.target;

            if (target.classList.contains('btn-responder')) {
                mostrarFormularioDeRespuesta(target);
            }
            
            if (target.classList.contains('btn-publicar-anidado')) {
                const form = target.closest('.form-respuesta-anidada');
                const contenido = form.querySelector('textarea').value.trim();
                const parentId = target.dataset.parentId;
                if (contenido) {
                    enviarRespuesta(idforo, contenido, parentId);
                }
            }
            
            if (target.classList.contains('btn-cancelar-anidado')) {
                target.closest('.form-respuesta-anidada').remove();
            }
        });
    }
}
