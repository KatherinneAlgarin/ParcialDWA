// frontend/js/auth.js
let autenticando = false; 

async function verificarAutenticacion(rolRequerido = null) {
  if (autenticando) return false; 
  autenticando = true;

  const token = localStorage.getItem('token');
  if (!token) {
    redirigirLogin();
    return false;
  }

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      redirigirLogin();
      return false;
    }

    const usuario = await res.json();
    if (rolRequerido && usuario.rol !== rolRequerido) {
      alert(`Acceso denegado: No tienes permisos para esta página.`);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      redirigirLogin();
      return false;
    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
    console.log('Usuario autenticado:', usuario);
    return true;

  } catch (error) {
    console.error('Error verificando autenticación:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    redirigirLogin();
    return false;
  } finally {
    autenticando = false; 
  }
}
function redirigirLogin() {
  if (!window._redirigiendoLogin) {
    window._redirigiendoLogin = true;
    console.log('Redirigiendo a login... por helper');
    window.location.href = 'signin.html';
  }
}

function cerrarSesion() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('empresa');
    window.location.href = 'signin.html';
  }
}

 async function protegerPagina(rol = null) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'signin.html';
    return false;
  }

  try {
    const res = await fetch('http://localhost:3000/api/usuarios/perfil', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();
    const usuario = await res.json();
    if (rol && usuario.rol !== rol) {
      alert('Acceso denegado');
      window.location.href = 'signin.html';
      return false;
    }
    localStorage.setItem('usuario', JSON.stringify(usuario));
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'signin.html';
    return false;
  }
}
