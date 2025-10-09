document.addEventListener('DOMContentLoaded', () => {
    
    gestionarHeader();

    
    const btnBusqueda = document.getElementById('btn-busqueda-principal');
    const inputBusqueda = document.getElementById('busqueda-principal');

    btnBusqueda.addEventListener('click', realizarBusqueda);
    inputBusqueda.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            realizarBusqueda();
        }
    });
});


function gestionarHeader() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    const authInvitado = document.getElementById('auth-invitado');
    const authUsuario = document.getElementById('auth-usuario');

    if (token && usuario) {
        
        authInvitado.style.display = 'none'; 
        authUsuario.style.display = 'flex';   

    
        const nombreUsuarioEl = document.getElementById('nombre-usuario');
        nombreUsuarioEl.textContent = `Bienvenido, ${usuario.nombre}`;

        
        const panelLink = document.getElementById('panel-link');
        if (usuario.rol === 'Candidato') {
            panelLink.href = 'homeCandidato.html';
        } else if (usuario.rol === 'Empleador') {
            panelLink.href = 'empresa.html';
        }
        const fotoPerfilEl = document.getElementById('foto-perfil-usuario');
        if (usuario.foto_perfil) {
            fotoPerfilEl.src = `http://localhost:3000/uploads/fotoPerfil/${usuario.foto_perfil}`;
        }

    } else {
        
        authInvitado.style.display = 'flex';   
        authUsuario.style.display = 'none';    
    }
}

function realizarBusqueda() {
    const terminoBusqueda = document.getElementById('busqueda-principal').value.trim();
    if (terminoBusqueda) {
        
        window.location.href = `vistaEmpleos.html?titulo=${encodeURIComponent(terminoBusqueda)}`;
    } else {
        
        window.location.href = 'vistaEmpleos.html';
    }
}