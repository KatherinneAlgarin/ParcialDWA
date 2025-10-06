// js/nueva-contrasena.js

// Configuración de la API
const API_URL = 'http://localhost:3000/api/auth';

// Verificar que venimos de la página de recuperación
const correoRecuperacion = sessionStorage.getItem('recovery_email');
const otpRecuperacion = sessionStorage.getItem('recovery_otp');

if (!correoRecuperacion || !otpRecuperacion) {
  // Si no hay datos, redirigir a recuperar contraseña
  alert('Sesión inválida. Por favor, solicita un nuevo código.');
  window.location.href = 'recuperar-contrasena.html';
}

// Elementos del DOM
const formNuevaContrasena = document.getElementById('formNuevaContrasena');
const nuevaPasswordInput = document.getElementById('nuevaPassword');
const confirmarPasswordInput = document.getElementById('confirmarPassword');
const btnRestablecerPassword = document.getElementById('btnRestablecerPassword');
const alertaContainer = document.getElementById('alertaContainer');

// Función para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'danger') {
  alertaContainer.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  setTimeout(() => {
    alertaContainer.innerHTML = '';
  }, 5000);
}

// Toggle para mostrar/ocultar contraseñas
document.querySelectorAll('.password-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('bi-eye');
      icon.classList.add('bi-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('bi-eye-slash');
      icon.classList.add('bi-eye');
    }
  });
});
confirmarPasswordInput.addEventListener('input', () => {
  if (confirmarPasswordInput.value !== nuevaPasswordInput.value) {
    confirmarPasswordInput.setCustomValidity('Las contraseñas no coinciden');
  } else {
    confirmarPasswordInput.setCustomValidity('');
  }
});
formNuevaContrasena.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevaPassword = nuevaPasswordInput.value.trim();
  const confirmarPassword = confirmarPasswordInput.value.trim();

  if (nuevaPassword.length < 6) {
    mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'warning');
    return;
  }

  if (nuevaPassword !== confirmarPassword) {
    mostrarAlerta('Las contraseñas no coinciden', 'warning');
    return;
  }

  btnRestablecerPassword.disabled = true;
  btnRestablecerPassword.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Restableciendo...';

  try {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        correo: correoRecuperacion,
        otp: otpRecuperacion,
        nuevaPassword: nuevaPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.removeItem('recovery_email');
      sessionStorage.removeItem('recovery_otp');
      
      mostrarAlerta('¡Contraseña restablecida correctamente! Redirigiendo al login...', 'success');
      
      setTimeout(() => {
        window.location.href = 'signin.html';
      }, 2000);

    } else {
      mostrarAlerta(data.error || 'Error al restablecer la contraseña', 'danger');
      btnRestablecerPassword.disabled = false;
      btnRestablecerPassword.textContent = 'Restablecer Contraseña';
    }

  } catch (error) {
    console.error('Error:', error);
    mostrarAlerta('Error de conexión con el servidor', 'danger');
    btnRestablecerPassword.disabled = false;
    btnRestablecerPassword.textContent = 'Restablecer Contraseña';
  }
});