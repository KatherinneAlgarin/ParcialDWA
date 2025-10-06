document.addEventListener('DOMContentLoaded', () => {
  cargarDashboard();
});

/**
 * Carga los datos de la empresa y sus ofertas para mostrar en el panel.
 */
async function cargarDashboard() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!token || !usuario) {
    console.error('No se encontró información de sesión.');
    return;
  }

  try {
    // Hacemos las dos peticiones al mismo tiempo para más eficiencia
    const [empresaRes, ofertasRes] = await Promise.all([
      fetch('http://localhost:3000/api/empresas/usuario/mi-empresa', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/ofertas/mi-empresa/ofertas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    // Procesamos la respuesta de las ofertas
    if (!ofertasRes.ok) throw new Error('Error al cargar las ofertas.');
    const ofertas = await ofertasRes.json();

    // Procesamos la respuesta de la empresa
    let empresa = null;
    if (empresaRes.status === 404) {
      console.log('Usuario sin empresa registrada.');
    } else if (empresaRes.ok) {
      empresa = await empresaRes.json();
    } else {
      throw new Error('Error al cargar la información de la empresa.');
    }

    // Actualizamos la interfaz con los datos obtenidos
    renderizarBienvenida(usuario, empresa);
    renderizarEstadisticas(ofertas);
    renderizarOfertasRecientes(ofertas);

  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    document.getElementById('mensaje-bienvenida').textContent = 'Error al cargar los datos.';
  }
}

function renderizarBienvenida(usuario, empresa) {
  const elementoMensaje = document.getElementById('mensaje-bienvenida');
  if (empresa && empresa.nombre) {
    elementoMensaje.textContent = `Bienvenido, ${empresa.nombre}`;
  } else {
    elementoMensaje.textContent = `Hola, ${usuario.nombre}`;
  }
}


function renderizarEstadisticas(ofertas) {
  const elementoTotal = document.getElementById('total-trabajos');
  elementoTotal.textContent = ofertas.length;
}

function renderizarOfertasRecientes(ofertas) {
  const tbody = document.getElementById('tabla-ofertas-recientes');
  tbody.innerHTML = ''; 

  if (ofertas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted p-4">
          No has publicado ningún trabajo recientemente.
        </td>
      </tr>
    `;
    return;
  }
  const ofertasRecientes = ofertas.slice(0, 5);

  ofertasRecientes.forEach(oferta => {
    const filaHTML = `
      <tr>
        <td>
          <div class="fw-bold">${oferta.titulo}</div>
          <small class="text-muted">${oferta.tipo_contrato}</small>
        </td>
        <td>${oferta.cantidad_aplicantes}</td>
        <td>
          <a href="verCandidatos.html?id=${oferta.idoferta}" class="btn btn-primary btn-sm">
            Ver Candidatos
          </a>
        </td>
      </tr>
    `;
    tbody.innerHTML += filaHTML;
  });
}