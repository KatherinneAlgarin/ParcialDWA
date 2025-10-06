document.addEventListener('DOMContentLoaded', () => {
  // Cuando la página cargue, pedimos las ofertas al backend
  cargarOfertas();
});
async function cargarOfertas() {
  const contenedor = document.getElementById('lista-ofertas-contenedor');
  const token = localStorage.getItem('token');

  if (!token) {
    contenedor.innerHTML = '<p class="text-danger text-center">Error de autenticación. Por favor, inicie sesión.</p>';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/ofertas/mi-empresa/ofertas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('No se pudieron cargar las ofertas de trabajo.');
    }

    const ofertas = await response.json();
    contenedor.innerHTML = '';

    if (ofertas.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center p-5 border rounded mt-3">
          <i class="bi bi-journal-x fs-1 text-muted"></i>
          <h5 class="mt-3">Aún no has publicado ningún trabajo</h5>
          <p class="text-muted">¡Publica tu primera oferta para empezar a recibir candidatos!</p>
          <a href="publicarTrabajo.html" class="btn btn-primary mt-2">Publicar un Trabajo</a>
        </div>
      `;
    } else {
      ofertas.forEach(oferta => {
        const ofertaHTML = `
          <div class="job-row row align-items-center border-bottom py-3">
            <div class="col-md-5">
              <div class="job-title fw-bold">${oferta.titulo}</div>
              <small class="text-muted">${oferta.tipo_contrato} • ${oferta.rubro}</small>
            </div>
            <div class="col-md-2">
              <span class="fw-bold">${oferta.cantidad_aplicantes}</span> Aplicantes
            </div>
            <div class="col-md-2">
              <span class="fw-bold">${oferta.cantidad_plazas}</span> Plazas
            </div>
            <div class="col-md-3">
              <a class="btn btn-primary btn-sm" href="verCandidatos.html?id=${oferta.idoferta}">
                <i class="bi bi-people-fill me-1"></i> Ver Candidatos
              </a>
              <div class="btn-group d-inline-block ms-1">
                <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#">Editar</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger btn-eliminar" data-idoferta="${oferta.idoferta}">Eliminar</button></li>
                </ul>
              </div>
            </div>
          </div>
        `;
        contenedor.innerHTML += ofertaHTML;
      });
    }
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
      boton.addEventListener('click', () => {
        const idoferta = boton.dataset.idoferta;
        eliminarOferta(idoferta);
      });
    });

  } catch (error) {
    console.error('Error:', error);
    contenedor.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
  }
}

/**
 * Elimina una oferta de trabajo específica.
 * @param {number} idoferta El ID de la oferta a eliminar.
 */
async function eliminarOferta(idoferta) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta oferta de trabajo? Esta acción no se puede deshacer.')) {
    return;
  }

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`http://localhost:3000/api/ofertas/${idoferta}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'No se pudo eliminar la oferta.');
    }

    alert('✅ Oferta eliminada correctamente.');
    
    // Volvemos a cargar la lista de ofertas para que se refleje el cambio
    cargarOfertas();

  } catch (error) {
    console.error('Error al eliminar:', error);
    alert(`Error: ${error.message}`);
  }
}