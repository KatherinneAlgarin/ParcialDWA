
const Storage = {
  jobs: 'demo_jobs_v1',
  guides: 'demo_guides_v1',
  posts: 'demo_posts_v1',
  company: 'demo_company_v1',
  user: 'demo_user_v1'
};

const Demo = {
  // Jobs
  loadJobs(){ return JSON.parse(localStorage.getItem(Storage.jobs) || '[]'); },
  saveJobs(jobs){ localStorage.setItem(Storage.jobs, JSON.stringify(jobs)); },
  addJob(job){ job.id = Date.now().toString(); const jobs = this.loadJobs(); jobs.unshift(job); this.saveJobs(jobs); return job; },
  updateJob(id, updates){ const jobs=this.loadJobs(); const i=jobs.findIndex(j=>j.id===id); if(i>-1){ jobs[i]= {...jobs[i], ...updates }; this.saveJobs(jobs); return jobs[i]; } return null; },
  deleteJob(id){ let jobs=this.loadJobs(); jobs=jobs.filter(j=>j.id!==id); this.saveJobs(jobs); },
  // Guides
  loadGuides(){ return JSON.parse(localStorage.getItem(Storage.guides) || '[]'); },
  saveGuides(g){ localStorage.setItem(Storage.guides, JSON.stringify(g)); },
  addGuide(g){ g.id=Date.now().toString(); const arr=this.loadGuides(); arr.unshift(g); this.saveGuides(arr); return g; },
  updateGuide(id, upd){ const arr=this.loadGuides(); const i=arr.findIndex(x=>x.id===id); if(i>-1){ arr[i]= {...arr[i], ...upd}; this.saveGuides(arr); return arr[i]; } return null; },
  deleteGuide(id){ let arr=this.loadGuides(); arr=arr.filter(x=>x.id!==id); this.saveGuides(arr); },
  // Blog posts
  loadPosts(){ return JSON.parse(localStorage.getItem(Storage.posts) || '[]'); },
  savePosts(p){ localStorage.setItem(Storage.posts, JSON.stringify(p)); },
  addPost(p){ p.id=Date.now().toString(); const arr=this.loadPosts(); arr.unshift(p); this.savePosts(arr); return p; },
  updatePost(id, upd){ const arr=this.loadPosts(); const i=arr.findIndex(x=>x.id===id); if(i>-1){ arr[i]={...arr[i],...upd}; this.savePosts(arr); return arr[i]; } return null; },
  deletePost(id){ let arr=this.loadPosts(); arr=arr.filter(x=>x.id!==id); this.savePosts(arr); },
  // Company profile
  getCompany(){ return JSON.parse(localStorage.getItem(Storage.company) || '{}'); },
  saveCompany(c){ localStorage.setItem(Storage.company, JSON.stringify(c)); },
  // Auth
  signIn(user){ localStorage.setItem(Storage.user, JSON.stringify(user)); },
  signOut(){ localStorage.removeItem(Storage.user); },
  getUser(){ return JSON.parse(localStorage.getItem(Storage.user) || 'null'); }
};

// UI Helpers
function showMessage(msg, time=2000){ const t=document.getElementById('toast'); if(!t) return; t.textContent=msg; t.style.display='block'; setTimeout(()=>t.style.display='none', time); }

// Jobs UI
function renderJobs(containerId='jobs-list'){
  const container=document.getElementById(containerId); if(!container) return;
  const jobs=Demo.loadJobs();
  if(jobs.length===0){ container.innerHTML='<div class="empty">No hay ofertas. Publica la primera.</div>'; return; }
  container.innerHTML = jobs.map(j=>`
    <div class="card" style="margin-bottom:.6rem;display:flex;gap:1rem;align-items:flex-start">
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${escapeHtml(j.title)}</strong><div class="small">${escapeHtml(j.company)} · ${escapeHtml(j.location)} · ${escapeHtml(j.type)}</div></div>
          <div class="actions">
            <button class="btn btn-outline" onclick="editJob('${j.id}')">Editar</button>
            <button class="btn" onclick="confirmDeleteJob('${j.id}')">Eliminar</button>
          </div>
        </div>
        <div class="small" style="margin-top:.5rem">${escapeHtml(j.description)}</div>
      </div>
    </div>
  `).join('');
}

function confirmDeleteJob(id){ if(confirm('¿Eliminar empleo?')){ Demo.deleteJob(id); renderJobs('jobs-list'); showMessage('Empleo eliminado'); } }

function editJob(id){
  const jobs=Demo.loadJobs(); const job=jobs.find(x=>x.id===id); if(!job) return showMessage('Empleo no encontrado');
  const form=document.getElementById('job-form'); if(!form) return;
  form.elements['id'].value = job.id;
  form.elements['title'].value = job.title;
  form.elements['company'].value = job.company;
  form.elements['location'].value = job.location;
  form.elements['type'].value = job.type;
  form.elements['description'].value = job.description;
  window.scrollTo({top:0, behavior:'smooth'});
  showMessage('Editando empleo');
}

function bindJobForm(){
  const form=document.getElementById('job-form'); if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const id=form.elements['id'].value;
    const data={ title: form.elements['title'].value.trim(), company: form.elements['company'].value.trim(), location: form.elements['location'].value.trim(), type: form.elements['type'].value, description: form.elements['description'].value.trim() };
    if(id){ Demo.updateJob(id, data); showMessage('Empleo actualizado'); }
    else{ Demo.addJob(data); showMessage('Empleo creado'); form.reset(); }
    renderJobs('jobs-list');
  });
}

// Guides UI
function renderGuides(){
  const container=document.getElementById('guides-list'); if(!container) return;
  const arr=Demo.loadGuides();
  if(arr.length===0){ container.innerHTML='<div class="empty">No hay guías publicadas.</div>'; return; }
  container.innerHTML = arr.map(g=>`
    <div class="card">
      <h4>${escapeHtml(g.title)}</h4>
      <div class="small">${escapeHtml(g.summary)}</div>
      <div style="margin-top:.5rem">
        <button class="btn btn-outline" onclick="openGuide('${g.id}')">Ver</button>
        <button class="btn" onclick="deleteGuideConfirm('${g.id}')">Eliminar</button>
      </div>
    </div>
  `).join('');
}
function bindGuideForm(){
  const f=document.getElementById('guide-form'); if(!f) return;
  f.addEventListener('submit',(e)=>{ e.preventDefault(); const data={title:f.elements['title'].value.trim(), summary:f.elements['summary'].value.trim(), content:f.elements['content'].value.trim()}; Demo.addGuide(data); f.reset(); renderGuides(); showMessage('Guía creada'); });
}
function openGuide(id){
  const arr=Demo.loadGuides(); const g=arr.find(x=>x.id===id); if(!g) return showMessage('Guía no encontrada'); const modal=document.getElementById('modal-guide'); modal.querySelector('.modal-card .modal-body').innerHTML = `<h3>${escapeHtml(g.title)}</h3><p class="small">${escapeHtml(g.summary)}</p><div style="margin-top:.6rem">${nl2br(escapeHtml(g.content))}</div>`; modal.classList.add('open'); }
function deleteGuideConfirm(id){ if(confirm('Eliminar guía?')){ Demo.deleteGuide(id); renderGuides(); showMessage('Guía eliminada'); } }

// Posts (blog)
function renderPosts(){
  const c=document.getElementById('posts-list'); if(!c) return;
  const arr=Demo.loadPosts();
  if(arr.length===0){ c.innerHTML='<div class="empty">No hay entradas de blog.</div>'; return; }
  c.innerHTML = arr.map(p=>`
    <div class="card">
      <h4>${escapeHtml(p.title)}</h4>
      <div class="small">Por ${escapeHtml(p.author)} · ${new Date(Number(p.id)).toLocaleDateString()}</div>
      <div style="margin-top:.5rem">${escapeHtml(p.excerpt)}</div>
      <div style="margin-top:.6rem">
        <button class="btn btn-outline" onclick="openPost('${p.id}')">Leer</button>
        <button class="btn" onclick="deletePostConfirm('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join('');
}
function bindPostForm(){ const f=document.getElementById('post-form'); if(!f) return; f.addEventListener('submit', (e)=>{ e.preventDefault(); const data={ title:f.elements['title'].value.trim(), author:f.elements['author'].value.trim(), excerpt:f.elements['excerpt'].value.trim(), content:f.elements['content'].value.trim() }; Demo.addPost(data); f.reset(); renderPosts(); showMessage('Entrada creada'); }); }
function openPost(id){ const arr=Demo.loadPosts(); const p=arr.find(x=>x.id===id); if(!p) return showMessage('Post no encontrado'); const modal=document.getElementById('modal-post'); modal.querySelector('.modal-card .modal-body').innerHTML = `<h3>${escapeHtml(p.title)}</h3><div class="small">Por ${escapeHtml(p.author)}</div><div style="margin-top:.6rem">${nl2br(escapeHtml(p.content))}</div>`; modal.classList.add('open'); }
function deletePostConfirm(id){ if(confirm('Eliminar entrada?')){ Demo.deletePost(id); renderPosts(); showMessage('Entrada eliminada'); } }

// Company profile
function bindCompanyForm(){ const f=document.getElementById('company-form'); if(!f) return; f.addEventListener('submit',(e)=>{ e.preventDefault(); const data={ name:f.elements['name'].value.trim(), description:f.elements['description'].value.trim(), website:f.elements['website'].value.trim(), contact:f.elements['contact'].value.trim() }; Demo.saveCompany(data); showCompany(); showMessage('Perfil guardado'); }); }
function showCompany(){ const c=Demo.getCompany(); const el=document.getElementById('company-view'); if(!el) return; if(!c || Object.keys(c).length===0) el.innerHTML='<div class="empty">Perfil vacío. Completa el formulario.</div>'; else el.innerHTML = `<div><div><strong>${escapeHtml(c.name)}</strong></div><div class="small">${escapeHtml(c.description)}</div><div style="margin-top:.6rem"><div class="kv">Web:</div> <a href="${escapeHtml(c.website)}">${escapeHtml(c.website)}</a></div><div style="margin-top:.3rem"><div class="kv">Contacto:</div> ${escapeHtml(c.contact)}</div></div>`; }

// Auth
function bindAuth(){
  const f=document.getElementById('auth-form'); if(!f) return; f.addEventListener('submit',(e)=>{ e.preventDefault(); const user={name:f.elements['name'].value.trim(), email:f.elements['email'].value.trim()}; Demo.signIn(user); updateUserUI(); f.reset(); showMessage('Sesión iniciada'); }); }
function updateUserUI(){ const u=Demo.getUser(); const el=document.getElementById('user-area'); if(!el) return; if(u){ el.innerHTML = `<span class="small">Hola, <strong>${escapeHtml(u.name)}</strong></span> <button class="btn btn-outline" onclick="logout()">Cerrar</button>`; } else { el.innerHTML = `<a class="btn" href="signin.html">Iniciar sesión</a>`; } }
function logout(){ Demo.signOut(); updateUserUI(); showMessage('Sesión cerrada'); }

// Utilities
function escapeHtml(str){ if(!str) return ''; return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
function nl2br(s){ return s.replace(/\n/g,'<br/>'); }

// Modal close handlers
document.addEventListener('click', (e)=>{
  if(e.target.matches('.modal')) e.target.classList.remove('open');
  if(e.target.matches('.modal .close')) e.target.closest('.modal').classList.remove('open');
});

// On DOM ready bind forms and render lists
document.addEventListener('DOMContentLoaded', ()=>{
  bindJobForm(); renderJobs('jobs-list');
  bindGuideForm(); renderGuides();
  bindPostForm(); renderPosts();
  bindCompanyForm(); showCompany();
  bindAuth(); updateUserUI();
});



// --- Candidates (applications) ---
const StorageExt = { applications: 'demo_applications_v1' };

function loadApplications(){ return JSON.parse(localStorage.getItem(StorageExt.applications) || '[]'); }
function saveApplications(arr){ localStorage.setItem(StorageExt.applications, JSON.stringify(arr)); }

function applyToJob(jobId, applicant){
  const arr = loadApplications();
  applicant.id = Date.now().toString();
  applicant.jobId = jobId;
  arr.unshift(applicant);
  saveApplications(arr);
  showMessage('Postulación enviada');
}

function getApplicationsForJob(jobId){
  return loadApplications().filter(a=>a.jobId===jobId);
}

function renderApplications(jobId, containerId){
  const container = document.getElementById(containerId); if(!container) return;
  const apps = getApplicationsForJob(jobId);
  if(apps.length===0){ container.innerHTML = '<div class="empty">No hay candidatos aún.</div>'; return; }
  container.innerHTML = apps.map(a=>`
    <div class="card" style="margin-bottom:.5rem">
      <div><strong>${escapeHtml(a.name)}</strong> <span class="small">${escapeHtml(a.email)}</span></div>
      <div class="small" style="margin-top:.4rem">${escapeHtml(a.message||'')}</div>
      <div style="margin-top:.5rem"><a class="btn btn-outline" href="mailto:${escapeHtml(a.email)}">Contactar</a></div>
    </div>
  `).join('');
}

function bindApplyForm(){
  const f = document.getElementById('apply-form'); if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const jobId = f.elements['jobId'].value;
    const applicant = { name: f.elements['name'].value.trim(), email: f.elements['email'].value.trim(), message: f.elements['message'].value.trim() };
    applyToJob(jobId, applicant);
    f.reset();
  });
}

// Settings (personal/profile)
function bindSettingsForm(){
  const f = document.getElementById('settings-form'); if(!f) return;
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = { personalName: f.elements['personalName'].value.trim(), personalEmail: f.elements['personalEmail'].value.trim(), profileBio: f.elements['profileBio'].value.trim() };
    localStorage.setItem('demo_settings_v1', JSON.stringify(data));
    showMessage('Ajustes guardados');
  });
}

function loadSettings(){
  const raw = localStorage.getItem('demo_settings_v1');
  return raw?JSON.parse(raw):null;
}

function showSettings(){
  const s = loadSettings();
  if(!s) return;
  const f = document.getElementById('settings-form'); if(!f) return;
  f.elements['personalName'].value = s.personalName || '';
  f.elements['personalEmail'].value = s.personalEmail || '';
  f.elements['profileBio'].value = s.profileBio || '';
}

// Bind extra on DOMContentLoaded
document.addEventListener('DOMContentLoaded', ()=>{
  // existing bindings already present earlier; add new ones
  bindApplyForm();
  bindSettingsForm();
  showSettings();
});



// --- Users (accounts with roles) ---
const UsersStorageKey = 'demo_users_v3';
function loadUsers(){ return JSON.parse(localStorage.getItem(UsersStorageKey) || '[]'); }
function saveUsers(arr){ localStorage.setItem(UsersStorageKey, JSON.stringify(arr)); }
function findUserByEmail(email){ return loadUsers().find(u=>u.email===email); }
function registerUser(user){ 
  const users = loadUsers();
  if(users.find(u=>u.email===user.email)) return { ok:false, error:'email_exists' };
  user.id = Date.now().toString();
  users.push(user);
  saveUsers(users);
  return { ok:true, user };
}
function authenticate(email, password){
  const u = findUserByEmail(email);
  if(!u) return { ok:false, error:'not_found' };
  if(u.password !== password) return { ok:false, error:'invalid_password' };
  // store current user minimal public info
  const publicUser = { id: u.id, name: u.name, email: u.email, role: u.role };
  localStorage.setItem('demo_user_v1', JSON.stringify(publicUser));
  return { ok:true, user: publicUser };
}
function getCurrentUser(){ const raw = localStorage.getItem('demo_user_v1'); return raw?JSON.parse(raw):null; }
function signOutUser(){ localStorage.removeItem('demo_user_v1'); }

// Enhance renderJobs to include "Ver detalle" button linking to detalle-trabajo.html?id=...
function renderJobs(containerId='jobs-list'){
  const container = document.getElementById(containerId); if(!container) return;
  const jobs = Demo.loadJobs();
  if(jobs.length===0){ container.innerHTML='<div class="empty">No hay ofertas. Publica la primera.</div>'; return; }
  container.innerHTML = jobs.map(j=>`
    <div class="card" style="margin-bottom:.6rem;display:flex;gap:1rem;align-items:flex-start">
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>${escapeHtml(j.title)}</strong><div class="small">${escapeHtml(j.company)} · ${escapeHtml(j.location)} · ${escapeHtml(j.type)}</div></div>
          <div class="actions">
            <a class="btn btn-outline" href="detalle-trabajo.html?id=${encodeURIComponent(j.id)}">Ver detalle</a>
            <button class="btn btn-outline" onclick="editJob('${j.id}')">Editar</button>
            <button class="btn" onclick="confirmDeleteJob('${j.id}')">Eliminar</button>
          </div>
        </div>
        <div class="small" style="margin-top:.5rem">${escapeHtml(j.description)}</div>
      </div>
    </div>
  `).join('');
}

// Protect route helper: requiredRole can be 'empresa' or 'usuario' or null for any authenticated
function requireRole(requiredRole){
  const user = getCurrentUser();
  if(!user){
    // redirect to signin with returnTo
    const returnTo = encodeURIComponent(location.pathname + location.search);
    location.href = 'signin.html?returnTo=' + returnTo;
    return false;
  }
  if(requiredRole && user.role !== requiredRole){
    alert('Acceso denegado: necesitas una cuenta ' + requiredRole);
    location.href = 'signin.html';
    return false;
  }
  return true;
}

// Update bindAuth and bind registration hooks to use new functions (we will attach in DOMContentLoaded below if present)
function bindAuthFormUpdated(){
  const form = document.getElementById('auth-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = form['email'].value.trim();
    const password = form['password'] ? form['password'].value : '';
    const name = form['name'] ? form['name'].value : '';
    const role = form['role'] ? form['role'].value : null;
    // If there's a password field, this is probably registration or signin depending on presence of role field
    if(role){
      // registration flow
      const res = registerUser({ name, email, password, role });
      if(!res.ok){ alert('El email ya está registrado'); return; }
      // auto-login
      const auth = authenticate(email, password);
      if(auth.ok){ showMessage('Cuenta creada e iniciada'); updateUserUI(); const returnTo = new URLSearchParams(location.search).get('returnTo'); if(returnTo) location.href = returnTo; }
    } else {
      // login flow - check credentials
      const auth = authenticate(email, password);
      if(!auth.ok){ if(auth.error==='not_found') alert('Email no encontrado'); else alert('Contraseña inválida'); return; }
      updateUserUI();
      showMessage('Sesión iniciada');
      const returnTo = new URLSearchParams(location.search).get('returnTo');
      if(returnTo) location.href = returnTo;
    }
  });
}

// Update updateUserUI to use getCurrentUser()
function updateUserUI(){
  const user = getCurrentUser();
  const el = document.getElementById('user-area');
  if(el){
    if(user) el.innerHTML = `<span class="small">Hola, <strong>${escapeHtml(user.name)}</strong></span> <button class="btn btn-outline" onclick="logout()">Cerrar</button>`;
    else el.innerHTML = `<a class="btn" href="signin.html">Iniciar sesión</a>`;
  }
}
function logout(){ signOutUser(); updateUserUI(); showMessage('Sesión cerrada'); }

// run enhanced bindings if present
document.addEventListener('DOMContentLoaded', ()=>{
  try{ bindAuthFormUpdated(); }catch(e){}
  try{ updateUserUI(); }catch(e){}
});

// v4 seeds and showAlert
function showAlert(message, kind='info', timeout=3000){ const id='alert-container'; let c=document.getElementById(id); if(!c){ c=document.createElement('div'); c.id=id; c.style.position='fixed'; c.style.top='1rem'; c.style.right='1rem'; c.style.zIndex=9999; document.body.appendChild(c); } const el=document.createElement('div'); el.className='card'; el.style.padding='.6rem 1rem'; el.style.marginBottom='.5rem'; el.style.minWidth='220px'; if(kind==='success') el.style.borderLeft='4px solid #16a34a'; if(kind==='danger') el.style.borderLeft='4px solid #dc2626'; el.innerText=message; c.appendChild(el); setTimeout(()=>el.remove(), timeout); }
function seedDefaultsV4(){ if(!localStorage.getItem('demo_guides_v1')){ const guides=[ {id:'g1',title:'Cómo preparar un CV ganador',summary:'Consejos prácticos para destacar tu CV.',content:'1) Resalta logros cuantificables.\n2) Manténlo claro y conciso.\n3) Adapta el CV a cada oferta.'}, {id:'g2',title:'Preparación para entrevistas',summary:'Guía rápida para afrontar entrevistas.',content:'Practica respuestas, investiga la empresa y llega con preguntas.'}, {id:'g3',title:'Trabajar remoto: buenas prácticas',summary:'Consejos para ser productivo trabajando desde casa.',content:'Establece rutinas, espacio de trabajo y comunicación clara.'} ]; localStorage.setItem('demo_guides_v1', JSON.stringify(guides)); } if(!localStorage.getItem('demo_posts_v1')){ const posts=[ {id:Date.now().toString()+'_p1',title:'Tendencias laborales 2025',author:'Equipo RRHH',excerpt:'Un resumen de lo que está en auge en el mercado laboral.',content:'El mercado cambia rápido. Las habilidades digitales, la adaptabilidad y la comunicación remota son clave.\n\nAdemás, se observa un aumento en roles híbridos y especializados.'}, {id:Date.now().toString()+'_p2',title:'Cómo negociar tu sueldo',author:'Consultor Salarial',excerpt:'Estrategias para pedir el salario que mereces.',content:'Investiga, demuestra impacto y pide con datos. Practica tu pitch y ofrece alternativas (bonos, beneficios).'}, {id:Date.now().toString()+'_p3',title:'Productividad para profesionales',author:'Coach',excerpt:'Métodos para mejorar tu foco y entrega.',content:'Define prioridades, usa bloques de tiempo y cuida tus descansos para mantener productividad.'} ]; localStorage.setItem('demo_posts_v1', JSON.stringify(posts)); } if(!localStorage.getItem('demo_jobs_v1')){ const jobs=[ {id:'e1',title:'Desarrollador Frontend',company:'TechCorp',location:'San Salvador',type:'Tiempo completo',description:'Buscamos desarrollador con experiencia en JavaScript y React.'}, {id:'e2',title:'Diseñador UI/UX',company:'Creativa',location:'Remoto',type:'Medio tiempo',description:'Diseñador con portafolio fuerte en apps móviles.'}, {id:'e3',title:'Analista de Datos',company:'DataLab',location:'San Miguel',type:'Remoto',description:'Experto en SQL y herramientas BI.'} ]; localStorage.setItem('demo_jobs_v1', JSON.stringify(jobs)); } }
document.addEventListener('DOMContentLoaded', ()=>{ try{ seedDefaultsV4(); }catch(e){} });
