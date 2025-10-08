document.addEventListener('DOMContentLoaded', () => {
    cargarDashboardCandidato();
});

async function cargarDashboardCandidato() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!token || !usuario) {
        console.error('No se encontró información de sesión.');
        return;
    }
    renderizarBienvenida(usuario);

    try {
        const response = await fetch('http://localhost:3000/api/aplicaciones/mis-aplicaciones', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al cargar las aplicaciones.');
        }

        const aplicaciones = await response.json();
        renderizarEstadisticas(aplicaciones);
        renderizarAplicacionesRecientes(aplicaciones);

    } catch (error) {
        console.error('Error al cargar el dashboard del candidato:', error);
        document.getElementById('total-aplicaciones').textContent = '-';
        document.getElementById('tabla-aplicaciones-recientes').innerHTML = `
            <tr><td colspan="4" class="text-center text-danger p-4">No se pudieron cargar tus aplicaciones.</td></tr>
        `;
    }
}
function renderizarBienvenida(usuario) {
    const elementoMensaje = document.getElementById('mensaje-bienvenida');
    if (usuario && usuario.nombre) {
        elementoMensaje.textContent = `Hola, ${usuario.nombre}`;
    }
}
function renderizarEstadisticas(aplicaciones) {
    const elementoTotal = document.getElementById('total-aplicaciones');
    elementoTotal.textContent = aplicaciones.length;
}
function renderizarAplicacionesRecientes(aplicaciones) {
    const tbody = document.getElementById('tabla-aplicaciones-recientes');
    tbody.innerHTML = '';

    if (aplicaciones.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted p-4">
                    Aún no has aplicado a ningún trabajo. <a href="vistaEmpleos.html">¡Encuentra tu próxima oportunidad!</a>
                </td>
            </tr>
        `;
        return;
    }
    const recientes = aplicaciones.slice(0, 5);

    recientes.forEach(app => {
        const fecha = new Date(app.fecha_aplicacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        const statusInfo = getStatusInfo(app.estado);

        const filaHTML = `
            <tr>
                <td>
                    <div class="fw-bold">${app.Oferta.titulo}</div>
                    <small class="text-muted">${app.Oferta.Empresa.nombre}</small>
                </td>
                <td>${fecha}</td>
                <td><span class="badge ${statusInfo.clase}">${statusInfo.texto}</span></td>
                <td>
                    <a href="detalleEmpleo.html?id=${app.Oferta.idoferta}" class="btn btn-outline-primary btn-sm">
                        Ver Oferta
                    </a>
                </td>
            </tr>
        `;
        tbody.innerHTML += filaHTML;
    });
}
function getStatusInfo(status) {
    switch (status) {
        case 'Activa':
            return { texto: 'Activa', clase: 'bg-primary' };
        case 'En revisión':
            return { texto: 'En Revisión', clase: 'bg-warning text-dark' };
        case 'Aceptada':
            return { texto: 'Aceptada', clase: 'bg-success' };
        case 'Rechazada':
            return { texto: 'Rechazada', clase: 'bg-danger' };
        default:
            return { texto: status, clase: 'bg-secondary' };
    }
}