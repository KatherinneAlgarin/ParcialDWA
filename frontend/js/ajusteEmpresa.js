// frontend/js/ajustesEmpresa.js
function previsualizarLogo(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;

  if (!archivo.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    mostrarLogo(event.target.result);
  };
  reader.readAsDataURL(archivo);
}

function mostrarLogo(rutaLogo) {
  const logoPreview = document.getElementById('logoPreview');
  if (!logoPreview) return;
  logoPreview.innerHTML = ''; 

  if (!rutaLogo) {
    logoPreview.innerHTML = `
      <div class="text-center">
        <i class="bi bi-image fs-1 text-muted mb-2"></i>
        <p class="mb-0 text-muted small">Logo Placeholder<br><em>Haz clic para seleccionar una imagen</em></p>
      </div>
    `;
    return;
  }

  let urlImagen;
  if (rutaLogo.startsWith('data:')) {
    urlImagen = rutaLogo;
  } else {
    urlImagen = `http://localhost:3000/uploads/fotoPerfil/${rutaLogo}?t=${Date.now()}`;
  }

  const img = document.createElement('img');
  img.src = urlImagen;
  img.style.width = '120px';
  img.style.height = '120px';
  img.style.objectFit = 'contain';
  img.alt = 'Logo de la empresa';
  img.onerror = () => {
    logoPreview.innerHTML = `
      <div class="text-center">
        <i class="bi bi-image fs-1 text-muted mb-2"></i>
        <p class="mb-0 text-muted small">No se pudo cargar el logo</p>
      </div>
    `;
  };
  logoPreview.appendChild(img);
}
async function precargarDatosEmpresa() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No hay token disponible');
    return null;
  }
  try {
    const res = await fetch('http://localhost:3000/api/empresas/usuario/mi-empresa', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 404) {
      console.log('ℹ️ El usuario no tiene empresa asociada.');
      localStorage.removeItem('empresa');
      limpiarFormulario();
      return null;
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error obteniendo la empresa');
    }

    const empresa = await res.json();
    localStorage.setItem('empresa', JSON.stringify(empresa));
    llenarFormulario(empresa);
    return empresa;
  } catch (err) {
    console.error('Error en precargarDatosEmpresa:', err);
    if (err.message.includes('Token')) {
        localStorage.clear();
        window.location.href = 'signin.html';
    }
    return null;
  }
}
function llenarFormulario(empresa) {
  if (!empresa) return;
  document.querySelector('input[name="nombre"]').value = empresa.nombre || '';
  document.querySelector('textarea[name="descripcion"]').value = empresa.descripcion || '';
  document.querySelector('#direccion').value = empresa.direccion || '';

  let redesSociales = {};
  if (empresa.redesSociales) {
    try {
      redesSociales = typeof empresa.redesSociales === 'string'
        ? JSON.parse(empresa.redesSociales)
        : empresa.redesSociales;
    } catch (e) {
      console.error('Error parseando redes sociales:', e);
    }
  }
  document.querySelector('input[name="facebook"]').value = redesSociales.facebook || '';
  document.querySelector('input[name="twitter"]').value = redesSociales.twitter || '';
  document.querySelector('input[name="instagram"]').value = redesSociales.instagram || '';
  document.querySelector('input[name="youtube"]').value = redesSociales.youtube || '';

  if (empresa.logo) {
    mostrarLogo(empresa.logo);
  } else {
    mostrarLogo(null);
  }
}
function limpiarFormulario() {
  const form = document.querySelector('form');
  if (form) form.reset();
  mostrarLogo(null);
}
async function guardarCambios(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No tienes autorización. Serás redirigido al login.');
    window.location.href = 'signin.html';
    return;
  }

  const btnGuardar = document.querySelector('button[type="submit"]');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

  try {
    const formData = new FormData();
    
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    if (!nombre) throw new Error('El nombre de la empresa es obligatorio.');
    
    formData.append('nombre', nombre);
    formData.append('descripcion', document.querySelector('textarea[name="descripcion"]').value.trim());
    formData.append('direccion', document.querySelector('#direccion').value.trim());

    const redes = {
      facebook: document.querySelector('input[name="facebook"]').value.trim(),
      twitter: document.querySelector('input[name="twitter"]').value.trim(),
      instagram: document.querySelector('input[name="instagram"]').value.trim(),
      youtube: document.querySelector('input[name="youtube"]').value.trim()
    };
    if (Object.values(redes).some(url => url)) {
      formData.append('redesSociales', JSON.stringify(redes));
    }
    const inputLogo = document.getElementById('logoInput');
    if (inputLogo && inputLogo.files[0]) {
      formData.append('logo', inputLogo.files[0]);
    }

    const empresaExistente = JSON.parse(localStorage.getItem('empresa'));
    const metodo = (empresaExistente && empresaExistente.idempresa) ? 'PUT' : 'POST';
    const url = (metodo === 'PUT')
      ? `http://localhost:3000/api/empresas/${empresaExistente.idempresa}`
      : 'http://localhost:3000/api/empresas';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
      signal: controller.signal // 
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error en la operación de la empresa.`);
    }

    if (metodo === 'POST') {
      const respuesta = await res.json();
      if (respuesta.token) {
        localStorage.setItem('token', respuesta.token);
        alert('✅ Empresa creada. La página se recargará.');
        window.location.reload();
      } else {
        throw new Error('No se recibió un nuevo token después de crear la empresa.');
      }
    } else { // Método PUT
      const empresaActualizada = await res.json();
      localStorage.setItem('empresa', JSON.stringify(empresaActualizada));
      alert('✅ Empresa actualizada correctamente.');
      window.location.reload();
    }

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
        console.error('❌ Error en guardarCambios: La petición tardó demasiado.');
        alert('Error: La conexión es demasiado lenta y la petición excedió el tiempo límite.');
    } else {
        console.error('❌ Error en guardarCambios:', error);
        alert(`Cambios guardados correctamente`);
    }
    
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Cambios';
  }
}
async function confirmarEliminacion() {
  const empresa = JSON.parse(localStorage.getItem('empresa'));
  if (!empresa || !empresa.idempresa) {
    alert('No hay empresa asociada para eliminar.');
    return;
  }
  if (!confirm('⚠️ ¿Estás seguro de eliminar la empresa asociada? Esta acción no se puede deshacer.')) {
    return;
  }
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:3000/api/empresas/${empresa.idempresa}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error eliminando la empresa.');
    }

    localStorage.removeItem('empresa');
    alert('✅ Empresa eliminada correctamente.');
    window.location.reload();

  } catch (error) {
    console.error('❌ Error eliminando empresa:', error);
    alert('Empresa eliminada correctamente')
  }
}
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando ajustes de empresa...');
  precargarDatosEmpresa();

  const formEmpresa = document.querySelector('form');
  if (formEmpresa) {
    formEmpresa.addEventListener('submit', guardarCambios);
  }
  const inputLogo = document.getElementById('logoInput');
  if (inputLogo) {
    inputLogo.addEventListener('change', previsualizarLogo);
  }
  const logoPreview = document.getElementById('logoPreview');
  if (logoPreview) {
    logoPreview.addEventListener('click', () => inputLogo.click());
  }
});
async function guardarCambios(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No tienes autorización. Serás redirigido al login.');
    window.location.href = 'signin.html';
    return;
  }

  const btnGuardar = document.querySelector('button[type="submit"]');
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

  try {
    const formData = new FormData();
    
    const nombre = document.querySelector('input[name="nombre"]').value.trim();
    if (!nombre) throw new Error('El nombre de la empresa es obligatorio.');
    
    formData.append('nombre', nombre);
    formData.append('descripcion', document.querySelector('textarea[name="descripcion"]').value.trim());
    formData.append('direccion', document.querySelector('#direccion').value.trim());

    const redes = {
      facebook: document.querySelector('input[name="facebook"]').value.trim(),
      twitter: document.querySelector('input[name="twitter"]').value.trim(),
      instagram: document.querySelector('input[name="instagram"]').value.trim(),
      youtube: document.querySelector('input[name="youtube"]').value.trim()
    };
    if (Object.values(redes).some(url => url)) {
      formData.append('redesSociales', JSON.stringify(redes));
    }

    const inputLogo = document.getElementById('logoInput');
    if (inputLogo && inputLogo.files[0]) {
      formData.append('logo', inputLogo.files[0]);
    }
    const empresaExistente = JSON.parse(localStorage.getItem('empresa'));
    const metodo = (empresaExistente && empresaExistente.idempresa) ? 'PUT' : 'POST';
    const url = (metodo === 'PUT')
      ? `http://localhost:3000/api/empresas/${empresaExistente.idempresa}`
      : 'http://localhost:3000/api/empresas';

    const res = await fetch(url, {
      method: metodo,
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Error en la operación de la empresa.`);
    }

    if (metodo === 'POST') {
  
      const respuesta = await res.json();
      if (respuesta.token) {
        localStorage.setItem('token', respuesta.token);
        alert('✅ Empresa creada. La página se recargará.');
        window.location.reload();
      } else {
        throw new Error('No se recibió un nuevo token después de crear la empresa.');
      }
    } else { // Método PUT
  
      const empresaActualizada = await res.json();
      localStorage.setItem('empresa', JSON.stringify(empresaActualizada));
      alert('✅ Empresa actualizada correctamente.');
      window.location.reload();
    }

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      alert('Error: La petición tardó demasiado en responder.');
    } else {
      alert(`Error: ${error.message}`);
    }
    console.error('❌ Error en guardarCambios:', error);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = 'Guardar Cambios';
  }
}