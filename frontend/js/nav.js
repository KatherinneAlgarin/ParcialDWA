// nav.js - dynamic navbar rendering
function renderNavbar(){
  const container = document.getElementById('navbar');
  if(!container) return;
  const userRaw = localStorage.getItem('demo_user_v1');
  const user = userRaw ? JSON.parse(userRaw) : null;
  let links = [
      {href:'index.html', label:'Inicio'},
      {href:'buscar.html', label:'Buscar empleos'},
      {href:'recursos.html', label:'Recursos'},
      {href:'blog.html', label:'Blog'},
      {href:'ejemplos.html', label:'Ejemplos'},
      {href:'empresa.html', label:'Empresa'},
      {href:'ajustes.html', label:'Ajustes'}
    ];
  if(user && user.role === 'empresa'){
    links = [
      {href:'index.html', label:'Inicio'},
      {href:'buscar.html', label:'Buscar empleos'},
      {href:'recursos.html', label:'Recursos'},
      {href:'blog.html', label:'Blog'},
      {href:'ejemplos.html', label:'Ejemplos'},
      {href:'empresa.html', label:'Empresa'},
      {href:'ajustes.html', label:'Ajustes'}
    ];
  } else {
    links = [
      {href:'index.html', label:'Inicio'},
      {href:'buscar.html', label:'Buscar empleos'},
      {href:'recursos.html', label:'Recursos'},
      {href:'blog.html', label:'Blog'},
      {href:'ejemplos.html', label:'Ejemplos'},
      {href:'empresa.html', label:'Empresa'},
      {href:'ajustes.html', label:'Ajustes'}
    ];
  }
  const linksHtml = links.map(l=>`<a href="${l.href}">${l.label}</a>`).join(' ');
  const userHtml = user ? `<span class="small">Hola, <strong>${escapeHtml(user.name)}</strong></span> <button class="btn btn-outline" onclick="logout()">Cerrar</button>` : `<a class="btn" href="signin.html">Iniciar sesión</a>`;
  container.innerHTML = `<nav class="navbar"><div><a class="navbar-brand" href="index.html">Portal Demo</a></div><div class="nav-links">${linksHtml}</div><div id="user-area">${userHtml}</div></nav>`;
}
// initial render
document.addEventListener('DOMContentLoaded', ()=>{ renderNavbar(); });
// re-render on storage events (login/logout in another tab)
window.addEventListener('storage', (e)=>{ if(e.key === 'demo_user_v1') renderNavbar(); });
