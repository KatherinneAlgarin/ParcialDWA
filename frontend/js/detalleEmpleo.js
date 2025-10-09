document.addEventListener('DOMContentLoaded', () => {
  gestionarEstadoLogin();
  cargarDetalleOferta();
});

/**
 * Verifica si el usuario ha iniciado sesión y actualiza el header.
 */
function gestionarEstadoLogin() {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const authInvitado = document.getElementById('auth-invitado');
  const authUsuario = document.getElementById('auth-usuario');

  if (token && usuario) {
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

async function cargarDetalleOferta() {
  const contenedor = document.getElementById('detalle-oferta-contenedor');
  const params = new URLSearchParams(window.location.search);
  const idOferta = params.get('id');

  if (!idOferta) {
    contenedor.innerHTML = '<p class="text-danger text-center">Error: No se especificó una oferta de trabajo.</p>';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/ofertas/${idOferta}`);
    if (!response.ok) {
      throw new Error('La oferta de trabajo no fue encontrada.');
    }
    const oferta = await response.json();

  
    renderizarOferta(oferta);
    configurarEventosAplicacion(oferta);

  } catch (error) {
    console.error('Error al cargar el detalle:', error);
    contenedor.innerHTML = `<p class="text-danger text-center">${error.message}</p>`;
  }
}

function renderizarOferta(oferta) {
  const contenedor = document.getElementById('detalle-oferta-contenedor');
  const empresa = oferta.Empresa;

  const logoUrl = empresa?.logo 
    ? `http://localhost:3000/uploads/fotoPerfil/${empresa.logo}` 
    : './imagenes/logo_empresa_default.png';
  
  const salario = (oferta.salario_minimo && oferta.salario_maximo)
    ? `$${oferta.salario_minimo} - $${oferta.salario_maximo} / ${oferta.tipo_salario}`
    : `A convenir`;

  const redesSocialesHTML = (() => {
    if (!empresa?.redesSociales) return '';
    try {
        const redes = JSON.parse(empresa.redesSociales);
        let html = '';
        if (redes.facebook) html += `<a href="${redes.facebook}" target="_blank" class="text-dark"><i class="bi bi-facebook fs-5"></i></a>`;
        if (redes.twitter) html += `<a href="${redes.twitter}" target="_blank" class="text-dark"><i class="bi bi-twitter fs-5"></i></a>`;
        
        return html;
    } catch { return ''; }
  })();
  
  const detalleHTML = `
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card p-4 shadow-sm mb-4">
          <div class="d-flex align-items-center mb-3">
            <img src="${logoUrl}" class="rounded-circle me-3" width="60" height="60" style="object-fit: contain;">
            <div>
              <h4 class="fw-bold">${oferta.titulo}</h4>
              <p class="mb-1 text-muted">${empresa?.nombre || 'Empresa'}</p>
            </div>
            <div class="ms-auto">
              <button id="btn-abrir-modal" class="btn btn-primary">Aplicar</button>
            </div>
          </div>
          <h6 class="fw-bold mt-3">Descripción del trabajo</h6>
          <p class="text-muted" style="white-space: pre-wrap;">${oferta.descripcion}</p>
          ${oferta.responsabilidades ? `<h6 class="fw-bold mt-4">Responsabilidades</h6><div class="text-muted" style="white-space: pre-wrap;">${oferta.responsabilidades}</div>` : ''}
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card p-3 shadow-sm mb-4">
          <h6 class="fw-bold">Resumen del trabajo</h6>
          <ul class="list-unstyled small mt-3">
            <li class="mb-2"><i class="bi bi-mortarboard-fill me-2 text-primary"></i><b>Educación:</b> ${oferta.educacion || 'No especificada'}</li>
            <li class="mb-2"><i class="bi bi-briefcase-fill me-2 text-primary"></i><b>Experiencia:</b> ${oferta.experiencia || 'No especificada'}</li>
            <li class="mb-2"><i class="bi bi-cash-stack me-2 text-primary"></i><b>Salario:</b> ${salario}</li>
            <li class="mb-2"><i class="bi bi-file-earmark-text-fill me-2 text-primary"></i><b>Contrato:</b> ${oferta.tipo_contrato}</li>
          </ul>
        </div>
        <div class="card p-3 shadow-sm">
          <h6 class="fw-bold">${empresa?.nombre || 'Sobre la empresa'}</h6>
          <p class="small text-muted mb-1">${empresa?.descripcion || ''}</p>
          ${empresa?.direccion ? `<p class="small mb-2"><i class="bi bi-geo-alt-fill me-2"></i>${empresa.direccion}</p>` : ''}
          <div class="d-flex gap-2">${redesSocialesHTML}</div>
        </div>
      </div>
    </div>`;

  contenedor.innerHTML = detalleHTML;
}

function configurarEventosAplicacion(oferta) {
  const btnAbrirModal = document.getElementById('btn-abrir-modal');
  const modalElement = document.getElementById('modalAplicar');
  const modalAplicar = new bootstrap.Modal(modalElement);
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  btnAbrirModal.addEventListener('click', () => {
    if (usuario && usuario.rol === 'Candidato') {
      document.getElementById('modalAplicarLabel').textContent = `Aplicar a: ${oferta.titulo}`;
      
      const inputCV = document.getElementById('documento');
      inputCV.value = ''; 
      modalAplicar.show();
    } else if (usuario && usuario.rol === 'Empleador') {
      alert('Los empleadores no pueden aplicar a ofertas de trabajo.');
    } else {
      if (confirm('Debes iniciar sesión como Candidato para poder aplicar. ¿Deseas ir a la página de inicio de sesión?')) {
        window.location.href = 'signin.html';
      }
    }
  });
  const formAplicacion = document.getElementById('form-aplicacion');
  formAplicacion.addEventListener('submit', (e) => {
    e.preventDefault();
    enviarAplicacion(oferta.idoferta);
  });
}


async function enviarAplicacion(idOferta) {
  const btnEnviar = document.getElementById('btn-enviar-aplicacion');
  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando...';
  
  const token = localStorage.getItem('token');

  try {
    const cvFile = document.getElementById('documento').files[0];
    const cartaPresentacion = document.getElementById('informacionAdicional').value;

    if (!cvFile) {
      throw new Error('Por favor, selecciona un archivo PDF para tu CV.');
    }

    const formData = new FormData();
    formData.append('cv', cvFile); 
    formData.append('carta_presentacion', cartaPresentacion);

    const response = await fetch(`http://localhost:3000/api/ofertas/${idOferta}/aplicar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al enviar la aplicación.');
    }

    const resultado = await response.json();
    console.log(resultado);

    alert('✅ ¡Has aplicado exitosamente a esta oferta!');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAplicar'));
    modal.hide();
    
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    btnAbrirModal.disabled = true;
    btnAbrirModal.textContent = 'Aplicación Enviada';

  } catch (error) {
    console.error('Error al aplicar:', error);
   
  } finally {
    btnEnviar.disabled = false;
    btnEnviar.textContent = 'Enviar Aplicación';
  }
}