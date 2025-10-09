let todosLosRecursos = []; // Guardaremos los recursos aquí para poder filtrarlos
let recursoAEliminarId = null;
let modalEliminar = null;

document.addEventListener('DOMContentLoaded', () => {
    protegerPagina('Empleador');
    
    modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));
    
    cargarRecursos();

    document.getElementById('btn-confirmar-eliminar').addEventListener('click', () => {
        if (recursoAEliminarId) {
            eliminarRecurso(recursoAEliminarId);
        }
    });
});

async function cargarRecursos() {
    const container = document.getElementById('lista-recursos-container');
    const token = localStorage.getItem('token');
    if (!token) return;

    container.innerHTML = `<div class="col-12 text-center p-5"><div class="spinner-border text-primary"></div></div>`;

    try {
        // Necesitamos un nuevo endpoint para traer solo los recursos de MI empresa
        const response = await fetch('http://localhost:3000/api/recursos/mis-recursos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar tus recursos.');
        
        todosLosRecursos = await response.json();
        
        renderizarRecursos(todosLosRecursos);
        renderizarEstadisticas(todosLosRecursos);

    } catch (error) {
        container.innerHTML = `<p class="text-danger text-center col-12">${error.message}</p>`;
    }
}

function renderizarRecursos(recursos) {
    const container = document.getElementById('lista-recursos-container');
    container.innerHTML = '';

    if (recursos.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center p-5 border rounded bg-light">
                <i class="bi bi-folder-x fs-1 text-muted"></i>
                <h5 class="mt-3">No has publicado ningún recurso</h5>
                <p class="text-muted">Comparte artículos o guías para ayudar a la comunidad.</p>
                <a href="agregarRecurso.html" class="btn btn-primary mt-2">Agregar un Recurso</a>
            </div>`;
        return;
    }

    recursos.forEach(recurso => {
        
        const previewHTML = `
            <div class="card-img-top bg-dark text-white d-flex align-items-center justify-content-center" style="height: 180px;">
                <div class="text-center p-3">
                    <i class="bi bi-link-45deg" style="font-size: 3rem;"></i>
                    <p class="mb-0 mt-2 small text-truncate">${recurso.link}</p>
                </div>
            </div>`;

        const cardHTML = `
            <div class="col-md-4">
                <div class="card recurso-card h-100 shadow-sm">
                    ${previewHTML}
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-primary badge-tipo align-self-start mb-2">${recurso.tipoRecurso || 'General'}</span>
                        <h5 class="card-title">${recurso.titulo}</h5>
                        <p class="card-text text-muted small flex-grow-1">${recurso.descripcion || 'Sin descripción.'}</p>
                        <div class="d-flex justify-content-end align-items-center mt-3">
                            <button class="btn btn-sm btn-outline-danger" onclick="abrirModalConfirmacion(${recurso.idrecurso})">
                                <i class="bi bi-trash me-1"></i>Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        container.innerHTML += cardHTML;
    });
}

function renderizarEstadisticas(recursos) {
    const container = document.getElementById('estadisticas-container');
    const total = recursos.length;
    
    const conteoPorTipo = recursos.reduce((acc, recurso) => {
        const tipo = recurso.tipoRecurso || 'otros';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
    }, {});

    container.innerHTML = `
        <div class="col-md-3">
            <div class="card text-center"><div class="card-body">
                <h3 class="text-primary mb-0">${total}</h3>
                <small class="text-muted">Total Recursos</small>
            </div></div>
        </div>
        <div class="col-md-3">
            <div class="card text-center"><div class="card-body">
                <h3 class="text-success mb-0">${conteoPorTipo['CV y cartas de presentación'] || 0}</h3>
                <small class="text-muted">Guías de CV</small>
            </div></div>
        </div>
        <div class="col-md-3">
            <div class="card text-center"><div class="card-body">
                <h3 class="text-info mb-0">${conteoPorTipo['Preparación para entrevistas'] || 0}</h3>
                <small class="text-muted">Entrevistas</small>
            </div></div>
        </div>
        <div class="col-md-3">
            <div class="card text-center"><div class="card-body">
                <h3 class="text-warning mb-0">${conteoPorTipo['Desarrollo de habilidades'] || 0}</h3>
                <small class="text-muted">Habilidades</small>
            </div></div>
        </div>
    `;
}

function abrirModalConfirmacion(id) {
    recursoAEliminarId = id;
    modalEliminar.show();
}

async function eliminarRecurso(id) {
    const token = localStorage.getItem('token');
    const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
    btnConfirmar.disabled = true;

    try {
        const response = await fetch(`http://localhost:3000/api/recursos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message);
        }
        alert('Recurso eliminado exitosamente');
        modalEliminar.hide();
        cargarRecursos(); // Recargar la lista
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        btnConfirmar.disabled = false;
        recursoAEliminarId = null;
    }
}