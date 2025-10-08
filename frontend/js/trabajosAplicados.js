document.addEventListener('DOMContentLoaded', () => {
    cargarAplicaciones();
});

async function cargarAplicaciones() {
    const container = document.getElementById('aplicaciones-container');
    const token = localStorage.getItem('token');
    container.innerHTML = `<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>`;

    try {
        const response = await fetch('http://localhost:3000/api/aplicaciones/mis-aplicaciones', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al cargar tus aplicaciones.');
        
        const aplicaciones = await response.json();
        container.innerHTML = ''; // Limpiar el spinner

        if (aplicaciones.length === 0) {
            container.innerHTML = `
                <div class="text-center p-5 border rounded mt-3">
                    <i class="bi bi-journal-x fs-1 text-muted"></i>
                    <h5 class="mt-3">Aún no has aplicado a ningún trabajo</h5>
                    <a href="vistaEmpleos.html" class="btn btn-primary mt-2">Buscar Empleos</a>
                </div>
            `;
            return;
        }

        aplicaciones.forEach(app => {
            const fecha = new Date(app.fecha_aplicacion).toLocaleDateString('es-ES');
            
            const statusInfo = getStatusInfo(app.estado);

            const appHTML = `
              <div class="job-row row align-items-center px-3 border-bottom py-2">
                  <div class="col-md-4">
                      <div class="job-title fw-semibold">${app.Oferta.titulo}</div>
                      <div class="company-name text-muted">${app.Oferta.Empresa.nombre}</div>
                  </div>
                  <div class="col-md-3 text-muted">${fecha}</div>
                  <div class="col-md-2 ${statusInfo.clase}">${statusInfo.texto}</div>
                  <div class="col-md-3 d-flex gap-2">
                      <a class="btn btn-outline-primary btn-sm" href="detalleEmpleo.html?id=${app.Oferta.idoferta}">
                          Ver Oferta
                      </a>
                      <button class="btn btn-outline-danger btn-sm btn-eliminar" data-idaplicacion="${app.idaplicacion}">
                          <i class="bi bi-trash"></i>
                      </button>
                  </div>
              </div>
          `;
            container.innerHTML += appHTML;
        });

        // Añadir listeners a los botones de eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.idaplicacion;
                eliminarAplicacion(id);
            });
        });

    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
    }
}

async function eliminarAplicacion(idaplicacion) {
    if (!confirm('¿Estás seguro de que quieres retirar tu aplicación?')) return;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`http://localhost:3000/api/aplicaciones/${idaplicacion}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message);
        }
        
        alert('Has retirado tu aplicación correctamente.');
        cargarAplicaciones(); // Recargar la lista

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

function getStatusInfo(status) {
    switch (status) {
        case 'Activa':
            return { texto: 'Activa', clase: 'status-active' };
        case 'En revisión':
            return { texto: 'En revisión', clase: 'status-pending' };
        case 'Aceptada':
            return { texto: 'Aceptada', clase: 'status-active' };
        case 'Rechazada':
            return { texto: 'Rechazada', clase: 'status-rejected' };
        default:
            return { texto: status, clase: '' };
    }
}