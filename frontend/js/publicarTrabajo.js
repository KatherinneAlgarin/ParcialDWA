document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-publicar-trabajo');
  if (form) {
    form.addEventListener('submit', publicarOferta);
  }
});

async function publicarOferta(e) {
  e.preventDefault(); 

  const btnPublicar = document.getElementById('btn-publicar');
  const textoOriginal = btnPublicar.textContent;
  btnPublicar.disabled = true;
  btnPublicar.textContent = 'Publicando...';
  const ofertaData = {
    titulo: document.getElementById('titulo').value,
    descripcion: document.getElementById('descripcion').value,
    rubro: document.getElementById('rubro').value,
    tipo_salario: document.getElementById('tipo-salario').value,
    tipo_contrato: document.getElementById('tipo-contrato').value,
    salario_minimo: parseFloat(document.getElementById('salario-minimo').value) || null,
    salario_maximo: parseFloat(document.getElementById('salario-maximo').value) || null,
    educacion: document.getElementById('educacion').value || null,
    experiencia: document.getElementById('experiencia').value || null,
    responsabilidades: document.getElementById('responsabilidades').value || null,
    cantidad_plazas: parseInt(document.getElementById('cantidad-plazas').value) || 1,
  };
  Object.keys(ofertaData).forEach(key => {
      if (ofertaData[key] === null || ofertaData[key] === '') {
          delete ofertaData[key];
      }
  });
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Error: No estás autenticado. Por favor, inicia sesión de nuevo.');
    btnPublicar.disabled = false;
    btnPublicar.textContent = textoOriginal;
    window.location.href = 'signin.html';
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/api/ofertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ofertaData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      const mensajeError = errorData.errors ? errorData.errors.map(err => err.msg).join(', ') : errorData.message;
      throw new Error(mensajeError || 'Ocurrió un error al publicar la oferta.');
    }

    const nuevaOferta = await response.json();
    console.log('Oferta creada:', nuevaOferta);
    
    alert(' ¡Oferta de trabajo publicada exitosamente!');
    setTimeout(() => {
      window.location.href = 'trabajosPVistaEmpresas.html';
    }, 1000);

  } catch (error) {
    console.error('Error al publicar la oferta:', error);
    alert(`Error: ${error.message}`);
    btnPublicar.disabled = false;
    btnPublicar.textContent = textoOriginal;
  }
}