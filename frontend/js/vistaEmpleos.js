document.addEventListener('DOMContentLoaded', () => {
  gestionarEstadoLogin();
  const params = new URLSearchParams(window.location.search);
    const tituloBusqueda = params.get('titulo');
    if (tituloBusqueda) {
        document.getElementById('filtro-titulo').value = tituloBusqueda;
    }  

    buscarOfertas();
  const formBusqueda = document.getElementById('form-busqueda');
  formBusqueda.addEventListener('submit', buscarOfertas);
  buscarOfertas(); 
});
function gestionarEstadoLogin() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const authInvitado = document.getElementById('auth-invitado');
  const authUsuario = document.getElementById('auth-usuario');

  if (token && usuario) {
    // Usuario logueado
    authInvitado.style.display = 'none';
    authUsuario.style.display = 'flex';
    document.getElementById('nombre-usuario').textContent = `Hola, ${usuario.nombre}`;
    
    const fotoPerfil = document.getElementById('foto-perfil-usuario');
    
    if (usuario.foto_perfil) {
        fotoPerfil.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
    }
  } else {
    authInvitado.style.display = 'flex';
    authUsuario.style.display = 'none';
  }
}
async function buscarOfertas(event) {
  if (event) {
    event.preventDefault();
  }

  const contenedor = document.getElementById('ofertas-container');
  const btnBuscar = document.getElementById('btn-buscar');

  btnBuscar.disabled = true;
  contenedor.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>`;
  
  const titulo = document.getElementById('filtro-titulo').value;
  // ... (recolectar otros filtros) ...
  
  const params = new URLSearchParams();
  if (titulo) params.append('titulo', titulo);
  // ... (append otros filtros) ...
  
  const queryString = params.toString();
  const url = `http://localhost:3000/api/ofertas${queryString ? `/buscar?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url);

    // --- MANEJO DE ERRORES MEJORADO ---
    if (!response.ok) {
      // Intentamos leer el JSON del error que envía el backend
      const errorData = await response.json().catch(() => ({}));
      // Creamos un mensaje de error detallado si hay errores de validación
      const mensajeError = errorData.errors 
        ? errorData.errors.map(err => err.msg).join('\n') 
        : errorData.message;
      throw new Error(mensajeError || 'No se pudieron cargar las ofertas.');
    }
    
    const ofertas = await response.json();
    renderizarOfertas(ofertas);

  } catch (error) {
    console.error('Error al buscar ofertas:', error);
    // ¡CORRECCIÓN! Mostramos el error en un alert
    alert(`Error: ${error.message}`);
    contenedor.innerHTML = `<p class="text-center text-danger">Ocurrió un error al realizar la búsqueda.</p>`;
  } finally {
    btnBuscar.disabled = false;
  }
}

/**
 * Renderiza las tarjetas de oferta en el contenedor.
 * @param {Array} ofertas - El arreglo de ofertas a mostrar.
 */
function renderizarOfertas(ofertas) {
  const contenedor = document.getElementById('ofertas-container');
  contenedor.innerHTML = ''; // Limpiar el contenedor

  if (ofertas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-12 text-center p-5 border rounded mt-3">
        <i class="bi bi-search fs-1 text-muted"></i>
        <h5 class="mt-3">No se encontraron ofertas</h5>
        <p class="text-muted">Intenta ajustar tus filtros de búsqueda o revisa más tarde.</p>
      </div>
    `;
    return;
  }

  ofertas.forEach(oferta => {
    // ---- LÓGICA MEJORADA Y MÁS SEGURA ----
    
    // 1. Obtenemos los datos de la empresa de forma segura
    const nombreEmpresa = oferta.Empresa?.nombre || 'Empresa no disponible';
    const logoUrl = oferta.Empresa?.logo 
      ? `http://localhost:3000/uploads/fotoPerfil/${oferta.Empresa.logo}?t=${Date.now()}` // Agregamos cache-buster
      : './imagenes/logo_empresa_default.png';

    // 2. Formateamos el salario para mostrarlo de forma amigable
    const salario = (oferta.salario_minimo && oferta.salario_maximo)
      ? `$${oferta.salario_minimo} - $${oferta.salario_maximo} / ${oferta.tipo_salario}`
      : `Salario a convenir`;

    // 3. Creamos la tarjeta HTML con los datos seguros
    const ofertaCardHTML = `
      <div class="col-lg-4 col-md-6 mb-4">
        <a href="detalleEmpleo.html?id=${oferta.idoferta}" class="text-decoration-none">
          <div class="job-card shadow-sm p-3 h-100">
            <div class="d-flex align-items-center mb-2">
              <img src="${logoUrl}" 
                  class="me-3 border rounded" 
                  style="width: 40px; height: 40px; object-fit: contain;"
                  alt="Logo de ${nombreEmpresa}">
              <div>
                <h6 class="mb-0 text-muted">${nombreEmpresa}</h6>
              </div>
            </div>
            <h5 class="fw-bold">${oferta.titulo}</h5>
            <p class="text-muted small mb-2">${oferta.rubro}</p>
            <p class="text-primary fw-semibold small">${oferta.tipo_contrato} • ${salario}</p>
          </div>
        </a>
      </div>
    `;
    contenedor.innerHTML += ofertaCardHTML;
  });
}