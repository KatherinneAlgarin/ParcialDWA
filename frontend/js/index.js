document.addEventListener('DOMContentLoaded', () => {
    // 1. Gestionar el estado de inicio de sesión en el header
    gestionarHeader();

    // 2. Añadir funcionalidad a la barra de búsqueda principal
    const btnBusqueda = document.getElementById('btn-busqueda-principal');
    const inputBusqueda = document.getElementById('busqueda-principal');

    btnBusqueda.addEventListener('click', realizarBusqueda);
    inputBusqueda.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            realizarBusqueda();
        }
    });
});

/**
 * Verifica si el usuario ha iniciado sesión y actualiza el header.
 */
function gestionarHeader() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const authInvitado = document.getElementById('auth-invitado');
    const authUsuario = document.getElementById('auth-usuario');

    if (token && usuario) {
        // --- Usuario Logueado ---
        authInvitado.style.display = 'none'; // Ocultar botones de Iniciar Sesión/Registro
        authUsuario.style.display = 'flex';   // Mostrar contenedor del usuario

        // Actualizar el nombre
        const nombreUsuarioEl = document.getElementById('nombre-usuario');
        nombreUsuarioEl.textContent = `Bienvenido, ${usuario.nombre}`;

        // Actualizar el enlace al panel correcto según el rol
        const panelLink = document.getElementById('panel-link');
        if (usuario.rol === 'Candidato') {
            panelLink.href = 'homeCandidato.html';
        } else if (usuario.rol === 'Empleador') {
            panelLink.href = 'empresa.html';
        }

        // Actualizar foto de perfil (opcional)
        const fotoPerfilEl = document.getElementById('foto-perfil-usuario');
        if (usuario.foto_perfil) {
            fotoPerfilEl.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
        }

    } else {
        // --- Usuario No Logueado ---
        authInvitado.style.display = 'flex';   // Mostrar botones
        authUsuario.style.display = 'none';    // Ocultar contenedor
    }
}

/**
 * Redirige a la página de búsqueda de empleos con el término de búsqueda.
 */
function realizarBusqueda() {
    const terminoBusqueda = document.getElementById('busqueda-principal').value.trim();
    if (terminoBusqueda) {
        // Redirigimos a la página de búsqueda, pasando el término como parámetro en la URL
        window.location.href = `vistaEmpleos.html?titulo=${encodeURIComponent(terminoBusqueda)}`;
    } else {
        // Si no hay nada escrito, simplemente vamos a la página de búsqueda
        window.location.href = 'vistaEmpleos.html';
    }
}