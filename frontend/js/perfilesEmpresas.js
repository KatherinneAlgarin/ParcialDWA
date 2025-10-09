document.addEventListener('DOMContentLoaded', () => {
    gestionarHeader();
    cargarEmpresas(); // Carga inicial de todas las empresas

    const formBusqueda = document.getElementById('form-busqueda-empresas');
    formBusqueda.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('filtro-nombre-empresa').value;
        cargarEmpresas(nombre);
    });
});

async function cargarEmpresas(nombre = '') {
    const container = document.getElementById('empresas-container');
    container.innerHTML = `<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>`;

    let url = 'http://localhost:3000/api/empresas';
    if (nombre) {
        url += `?nombre=${encodeURIComponent(nombre)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudieron cargar las empresas.');

        const empresas = await response.json();
        renderizarEmpresas(empresas);
    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}

function renderizarEmpresas(empresas) {
    const container = document.getElementById('empresas-container');
    container.innerHTML = '';

    if (empresas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center p-5 border rounded">
                <h5>No se encontraron empresas</h5>
                <p class="text-muted">Intenta con otro término de búsqueda o revisa más tarde.</p>
            </div>
        `;
        return;
    }

    empresas.forEach(empresa => {
        const logoUrl = empresa.logo 
            ? `http://localhost:3000/uploads/fotoPerfil/${empresa.logo}` 
            : './imagenes/logo_empresa_default.png';
        
        
        const valoracion = empresa.valoracionPromedio;
        const totalResenas = empresa.totalResenas || 0;

        const cardHTML = `
          <div class="col-md-4">
            <div class="card h-100 shadow-sm">
              <div class="card-body text-center">
                <img src="${logoUrl}" class="rounded-circle mb-3" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #eee;">
                <h5 class="card-title fw-bold">${empresa.nombre}</h5>
                <p class="card-text text-muted small">${empresa.direccion || 'Ubicación no disponible'}</p>

                <div class="text-warning mb-2" title="Valoración promedio: ${parseFloat(valoracion).toFixed(1)} de 5">
                  ${renderizarEstrellas(valoracion)}
                </div>
                <small class="text-muted">(${totalResenas} valoraciones)</small>
              </div>
              <div class="card-footer bg-white border-0 text-center">
                <a href="detalleEmpresa.html?id=${empresa.idempresa}" class="btn btn-outline-success btn-sm">
                  <i class="bi bi-star-fill me-1"></i> Valorar
                </a>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function renderizarEstrellas(valoracion) {
    let estrellasHTML = '';
    const rating = parseFloat(valoracion) || 0;
    const estrellasLlenas = Math.floor(rating);
    const tieneMediaEstrella = (rating - estrellasLlenas) >= 0.5;

    for (let i = 1; i <= 5; i++) {
        if (i <= estrellasLlenas) {
            estrellasHTML += '<i class="bi bi-star-fill"></i>'; // Estrella llena
        } else if (i === estrellasLlenas + 1 && tieneMediaEstrella) {
            estrellasHTML += '<i class="bi bi-star-half"></i>'; // Media estrella
        } else {
            estrellasHTML += '<i class="bi bi-star"></i>'; // Estrella vacía
        }
    }
    return estrellasHTML;
}
function gestionarHeader() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const authInvitado = document.getElementById('auth-invitado');
    const authUsuario = document.getElementById('auth-usuario');

    if (token && usuario) {
        
        authInvitado.style.display = 'none'; 
        authUsuario.style.display = 'flex';   

        const nombreUsuarioEl = document.getElementById('nombre-usuario');
        nombreUsuarioEl.textContent = `Bienvenido, ${usuario.nombre}`;

        const panelLink = document.getElementById('panel-link');
        if (usuario.rol === 'Candidato') {
            panelLink.href = 'homeCandidato.html';
        } else if (usuario.rol === 'Empleador') {
            panelLink.href = 'empresa.html';
        }

        const fotoPerfilEl = document.getElementById('foto-perfil-usuario');
        if (usuario.foto_perfil) {
            fotoPerfilEl.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
        }

    } else {
        authInvitado.style.display = 'flex';   
        authUsuario.style.display = 'none';    
    }
}