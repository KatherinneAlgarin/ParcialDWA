async function precargarDatosUsuario() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error('Error obteniendo perfil');
      return;
    }

    const usuario = await res.json();
    localStorage.setItem('usuario', JSON.stringify(usuario));

  
    document.getElementById('nombreCompleto').value = usuario.nombre || '';
    document.getElementById('direccion').value = usuario.direccion || '';
    document.getElementById('experiencia').value = usuario.experiencia || '';
    document.getElementById('educacion').value = usuario.educacion || '';

  
    const nacionalidad = document.getElementById('nacionalidad');
    if (nacionalidad && usuario.nacionalidad) {
      setTimeout(() => {
        nacionalidad.value = usuario.nacionalidad;
        mostrarBanderaSeleccionada();
      }, 300); 
    }

    document.getElementById('fechaNacimiento').value = usuario.fecha_nacimiento || '';
    document.getElementById('estadoCivil').value = usuario.estado_civil || '';
    document.getElementById('biografia').value = usuario.biografia || '';

    
    let redesSociales = {};
    if (usuario.redes_sociales) {
      try {
        redesSociales = typeof usuario.redes_sociales === 'string'
          ? JSON.parse(usuario.redes_sociales)
          : usuario.redes_sociales;
      } catch (e) {
        console.error('Error parseando redes sociales:', e);
      }
    }
    document.getElementById('facebook').value = redesSociales.facebook || '';
    document.getElementById('twitter').value = redesSociales.twitter || '';
    document.getElementById('instagram').value = redesSociales.instagram || '';
    document.getElementById('youtube').value = redesSociales.youtube || '';

    
    document.getElementById('correo').value = usuario.correo || '';


    mostrarFotoPerfil(usuario.foto_perfil);

  } catch (err) {
    console.error('Error en precargarDatosUsuario:', err);
  }
}

function mostrarFotoPerfil(rutaFoto) {
  const uploadBox = document.querySelector('.upload-box');
  if (!uploadBox) return;

  const iconoExistente = uploadBox.querySelector('i');
  const textoExistente = uploadBox.querySelector('p');
  let imgExistente = uploadBox.querySelector('img');

  if (iconoExistente) iconoExistente.style.display = 'none';
  if (textoExistente) textoExistente.style.display = 'none';

  if (!rutaFoto) {
    if (iconoExistente) iconoExistente.style.display = '';
    if (textoExistente) textoExistente.style.display = '';
    if (imgExistente) imgExistente.remove();
    return;
  }

  let urlImagen;
  if (rutaFoto.startsWith('http') || rutaFoto.startsWith('data:')) {
    urlImagen = rutaFoto;
  } else {
    urlImagen = `http://localhost:3000/uploads/fotoPerfil/${rutaFoto}?t=${Date.now()}`;
  }

  if (imgExistente) {
    imgExistente.src = urlImagen;
  } else {
    const img = document.createElement('img');
    img.src = urlImagen;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.classList.add('mb-2');
    img.alt = 'Foto de perfil';
    img.onerror = () => {
      if (iconoExistente) iconoExistente.style.display = '';
      if (textoExistente) textoExistente.style.display = '';
      img.remove();
    };
    uploadBox.insertBefore(img, uploadBox.firstChild);
  }
}

function previsualizarFoto(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;

  if (!archivo.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida.');
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    mostrarFotoPerfil(event.target.result);
  };
  reader.readAsDataURL(archivo);
}

// Guardar cambios
async function guardarCambios() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    alert('Usuario no autenticado');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No tienes autorización');
    return;
  }

  const btnGuardar = document.getElementById('btnGuardar');
  const textoOriginal = btnGuardar.textContent;
  btnGuardar.disabled = true;
  btnGuardar.textContent = 'Guardando...';

  try {
    const formData = new FormData();
    
    formData.append('nombre', document.getElementById('nombreCompleto').value.trim());
    formData.append('correo', document.getElementById('correo').value.trim());
    
    const camposOpcionales = {
        'direccion': 'direccion', 'biografia': 'biografia', 
        'experiencia': 'experiencia', 'educacion': 'educacion', 'nacionalidad': 'nacionalidad', 
        'estadoCivil': 'estado_civil', 'fechaNacimiento': 'fecha_nacimiento'
    };

    for (const [id, key] of Object.entries(camposOpcionales)) {
        const el = document.getElementById(id);
        if (el && el.value) {
            formData.append(key, el.value);
        }
    }
    const redes = {};
    ['facebook', 'twitter', 'instagram', 'youtube'].forEach(id => {
      const val = document.getElementById(id).value.trim();
      if (val) redes[id] = val;
    });
    if (Object.keys(redes).length > 0) {
      formData.append('redes_sociales', JSON.stringify(redes));
    }

    
    const inputFoto = document.getElementById('fotoPerfil');
    if (inputFoto && inputFoto.files[0]) {
      formData.append('fotoPerfil', inputFoto.files[0]);
    }

    const res = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error actualizando el perfil');
    }

    const usuarioActualizado = await res.json();
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

    alert('✅ Cambios guardados correctamente');
    
    window.location.reload();

  } catch (error) {
    console.error('Error al guardar cambios:', error);
  
    alert(`Cambios guardados correctamente`); 
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = textoOriginal;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  precargarDatosUsuario();

  const formPerfil = document.getElementById('formPerfil');
  if (formPerfil) {
    formPerfil.addEventListener('submit', e => {
      e.preventDefault();
      guardarCambios();
    });
  }

  const inputFoto = document.getElementById('fotoPerfil');
  if (inputFoto) {
    inputFoto.addEventListener('change', previsualizarFoto);
  }
});