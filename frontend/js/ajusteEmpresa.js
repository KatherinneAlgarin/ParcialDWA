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
        const res = await fetch('http://localhost:3000/api/empresa/usuario/mi-empresa', {
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

        // Si la respuesta no es OK (ej. 401, 403, 500), lanzamos un error.
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Error desconocido obteniendo la empresa' }));
            throw new Error(errorData.message);
        }

        const empresa = await res.json();
        localStorage.setItem('empresa', JSON.stringify(empresa));
        llenarFormulario(empresa);
        return empresa;
    } catch (err) {
        console.error('Error crítico en precargarDatosEmpresa:', err);

        // Si el error parece ser de autenticación, cerramos sesión por seguridad.
        // Intentamos detectarlo revisando propiedades comunes.
        const status = err.statusCode || err.status || (err.response && err.response.status);

        if (status === 401 || status === 403) {
            alert('Tu sesión no es válida. Se cerrará la sesión por seguridad.');
            cerrarSesion();
        } else {
            // Para otros errores no forzamos logout: mostramos aviso y permitimos reintentos.
            console.warn('No se pudo cargar la empresa. Intenta de nuevo o revisa el servidor.');
            alert('Hubo un problema al cargar los datos de tu empresa. Intenta recargar la página o contacta al administrador.');
            // Opcional: limpiarFormulario(); // si quieres dejar el formulario vacío
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
        alert('Sesión no válida. Por favor, inicia sesión de nuevo.');
        window.location.href = 'signin.html';
        return;
    }

    const btnGuardar = document.querySelector('button[type="submit"]');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        // --- ¡LA CORRECCIÓN ESTÁ AQUÍ! ---
        // 1. Creamos un FormData vacío.
        const formData = new FormData();

        // 2. Añadimos los campos de texto simples manualmente.
        const nombreInput = document.querySelector('input[name="nombre"]');
        if (!nombreInput.disabled) { // Solo añadimos/validamos el nombre si está habilitado (modo creación)
            const nombre = nombreInput.value.trim();
            if (!nombre) throw new Error('El nombre de la empresa es obligatorio.');
            formData.append('nombre', nombre);
        }
        
        formData.append('descripcion', document.querySelector('textarea[name="descripcion"]').value.trim());
        formData.append('direccion', document.querySelector('input[name="direccion"]').value.trim());

        // 3. Creamos el objeto para las redes sociales y lo añadimos como JSON.
        const redes = {
            facebook: document.querySelector('input[name="facebook"]').value.trim(),
            twitter: document.querySelector('input[name="twitter"]').value.trim(),
            instagram: document.querySelector('input[name="instagram"]').value.trim(),
            youtube: document.querySelector('input[name="youtube"]').value.trim()
        };
        if (Object.values(redes).some(url => url)) {
            formData.append('redesSociales', JSON.stringify(redes));
        }

        // 4. Añadimos el archivo del logo si el usuario seleccionó uno nuevo.
        const inputLogo = document.getElementById('logoInput');
        if (inputLogo && inputLogo.files[0]) {
            formData.append('logo', inputLogo.files[0]);
        }
        
        // --- El resto de tu lógica de envío y manejo de respuesta ya es correcta ---
        const empresaExistente = JSON.parse(localStorage.getItem('empresa'));
        const metodo = (empresaExistente && empresaExistente.idempresa) ? 'PUT' : 'POST';
        const url = (metodo === 'PUT')
            ? `http://localhost:3000/api/empresa/${empresaExistente.idempresa}`
            : 'http://localhost:3000/api/empresa';

        const res = await fetch(url, {
            method: metodo,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Ocurrió un error en la operación.');

        if (metodo === 'POST' && resData.token) {
            localStorage.setItem('token', resData.token);
            localStorage.setItem('empresa', JSON.stringify(resData.empresa));
        } else { // Método PUT
            localStorage.setItem('empresa', JSON.stringify(resData));
        }
        
        alert(`✅ Empresa ${metodo === 'POST' ? 'creada' : 'actualizada'} correctamente.`);
        window.location.reload();

    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
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

    if (!confirm('⚠️ ¿Estás seguro de eliminar la empresa? Esta acción es irreversible.')) return;
    
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3000/api/empresa/${empresa.idempresa}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const resData = await res.json();
        if (!res.ok) {
            throw new Error(resData.message || 'Error eliminando la empresa.');
        }
        if (resData.token) {
            console.log('✅ Token nuevo recibido al ELIMINAR. Guardando...');
            localStorage.setItem('token', resData.token);
            localStorage.removeItem('empresa'); 
        }

        alert('✅ Empresa eliminada correctamente.');
        window.location.reload();

    } catch (error) {
        console.error('❌ Error eliminando empresa:', error);
        alert(`Error: ${error.message}`);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    protegerPagina('Empleador');
    precargarDatosEmpresa();

    document.querySelector('form').addEventListener('submit', guardarCambios);
    document.getElementById('logoInput').addEventListener('change', previsualizarLogo);
    document.getElementById('logoPreview').addEventListener('click', () => document.getElementById('logoInput').click());
});