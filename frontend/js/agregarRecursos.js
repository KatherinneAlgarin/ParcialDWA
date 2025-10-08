document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-recurso');
    if (form) {
        form.addEventListener('submit', agregarRecurso);
    }
});

/**
 * Recolecta los datos del formulario y los envía al backend para crear un nuevo recurso.
 */
async function agregarRecurso(e) {
    e.preventDefault();

    const btnPublicar = document.getElementById('btn-publicar');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Error de autenticación. Por favor, inicia sesión.');
        return;
    }

    // Deshabilitar el botón para evitar envíos duplicados
    btnPublicar.disabled = true;
    btnPublicar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publicando...';

    // Recolectar datos como un objeto JSON
    const recursoData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        tipoRecurso: document.getElementById('tipoRecurso').value,
        link: document.getElementById('link').value,
    };

    try {
        const response = await fetch('http://localhost:3000/api/recursos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ahora usamos JSON, no FormData
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(recursoData)
        });

        const resData = await response.json();
        if (!response.ok) {
            // Si hay errores de validación, los unimos en un solo mensaje
            const mensajeError = resData.errors ? resData.errors.map(err => err.msg).join(', ') : resData.message;
            throw new Error(mensajeError || 'Ocurrió un error al publicar el recurso.');
        }

        alert('✅ ¡Recurso publicado exitosamente!');
        
        // Redirigir a la página principal de recursos después de un segundo
        setTimeout(() => {
            window.location.href = 'recursos.html';
        }, 1000);

    } catch (error) {
        console.error('Error al publicar recurso:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Volver a habilitar el botón
        btnPublicar.disabled = false;
        btnPublicar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Publicar Recurso';
    }
}