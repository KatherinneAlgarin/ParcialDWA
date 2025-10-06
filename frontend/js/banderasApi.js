// /js/banderasApi.js

  async function cargarPaises() {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags,translations');
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error al obtener países: ${res.status} ${res.statusText} - ${text}`);
    }
    const paises = await res.json();
    paises.sort((a, b) => {
      const nameA = a.translations?.spa?.common || a.name.common;
      const nameB = b.translations?.spa?.common || b.name.common;
      return nameA.localeCompare(nameB);
    });

    const select = document.getElementById('nacionalidad');
    select.length = 1; 

    paises.forEach(pais => {
      const option = document.createElement('option');
      option.value = pais.cca2;
      option.textContent = pais.translations?.spa?.common || pais.name.common;
      option.dataset.flag = pais.flags.svg || pais.flags.png || '';
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando países:', error);
  }
}

function filtrarPaises() {
  const filtro = this.value.toLowerCase();
  const select = document.getElementById('nacionalidad');
  const opciones = select.options;
  for (let i = 1; i < opciones.length; i++) { 
    const texto = opciones[i].text.toLowerCase();
    opciones[i].style.display = texto.includes(filtro) ? '' : 'none';
  }

  for (let i = 1; i < opciones.length; i++) {
    if (opciones[i].style.display !== 'none') {
      select.selectedIndex = i;
      mostrarBanderaSeleccionada();
      return;
    }
  }
  select.selectedIndex = 0;
  mostrarBanderaSeleccionada();
}
 function mostrarBanderaSeleccionada() {
  const select = document.getElementById('nacionalidad');
  const opcionSeleccionada = select.options[select.selectedIndex];
  const urlBandera = opcionSeleccionada?.dataset.flag || '';

  const contenedorBandera = document.getElementById('contenedorBandera');
  if (urlBandera) {
    contenedorBandera.innerHTML = `<img src="${urlBandera}" alt="Bandera de ${opcionSeleccionada.textContent}" style="width:30px; height:20px; object-fit:cover; border:1px solid #ccc;" />`;
  } else {
    contenedorBandera.innerHTML = '';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  cargarPaises();
  document.getElementById('buscarNacionalidad').addEventListener('input', filtrarPaises);
  document.getElementById('nacionalidad').addEventListener('change', mostrarBanderaSeleccionada);
});