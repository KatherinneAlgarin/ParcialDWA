const API_URL = 'http://localhost:3000/api/auth'; 
const alertContainer = document.getElementById('alertContainer');
const emailInput = document.getElementById('email');
const btnEnviarCodigo = document.getElementById('btnEnviarCodigo');
const otpSection = document.getElementById('otpSection');
const otpInput = document.getElementById('otp');
const btnValidarOtp = document.getElementById('btnValidarOtp');

let correoGuardado = '';


function mostrarAlerta(mensaje, tipo = 'danger', icono = '') {
  
  alertContainer.innerHTML = '';
  
  
  const iconos = {
    success: '<i class="bi bi-check-circle-fill me-2"></i>',
    danger: '<i class="bi bi-exclamation-triangle-fill me-2"></i>',
    warning: '<i class="bi bi-exclamation-circle-fill me-2"></i>',
    info: '<i class="bi bi-info-circle-fill me-2"></i>'
  };
  
  const iconoHTML = icono || iconos[tipo] || '';
  
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${iconoHTML}${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  alertContainer.appendChild(alertDiv);
  
  
  if (tipo === 'success' || tipo === 'info') {
    setTimeout(() => {
      alertDiv.remove();
    }, 8000);
  }
}


function limpiarAlertas() {
  alertContainer.innerHTML = '';
}


emailInput.addEventListener('input', () => {
  const esValido = emailInput.checkValidity();
  btnEnviarCodigo.disabled = !esValido;
  

  emailInput.classList.remove('is-invalid', 'is-valid');
  
  if (emailInput.value.length > 0) {
    if (esValido) {
      emailInput.classList.add('is-valid');
    } else {
      emailInput.classList.add('is-invalid');
    }
  }
});


btnEnviarCodigo.addEventListener('click', async () => {
  if (!emailInput.checkValidity()) {
    emailInput.classList.add('is-invalid');
    emailInput.reportValidity();
    return;
  }

  const correo = emailInput.value.trim();
  correoGuardado = correo;

 
  limpiarAlertas();

  
  btnEnviarCodigo.disabled = true;
  btnEnviarCodigo.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando código...';

  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo })
    });

    const data = await response.json();

    if (response.ok) {
      
      mostrarAlerta(
        `Código enviado exitosamente a <strong>${correo}</strong>. Revisa tu bandeja de entrada y spam.`, 
        'success'
      );
      
      
      otpSection.classList.remove('d-none');
      
    
      emailInput.disabled = true;
      btnEnviarCodigo.textContent = 'Código enviado';
      btnEnviarCodigo.classList.remove('btn-primary');
      btnEnviarCodigo.classList.add('btn-secondary');
      
     
      otpInput.focus();

    } else {
      // Error del servidor
      const mensajeError = data.error || data.message || 'Error al enviar el código';
      mostrarAlerta(mensajeError, 'danger');
      
      
      btnEnviarCodigo.disabled = false;
      btnEnviarCodigo.innerHTML = 'Enviar código';
    }

  } catch (error) {
    console.error('Error de conexión:', error);
    mostrarAlerta(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.', 
      'danger'
    );
    
    // Restaurar botón
    btnEnviarCodigo.disabled = false;
    btnEnviarCodigo.innerHTML = 'Enviar código';
  }
});


otpInput.addEventListener('input', () => {
  
  otpInput.value = otpInput.value.replace(/[^0-9]/g, '');
  
  
  btnValidarOtp.disabled = otpInput.value.length !== 6;
  
  
  otpInput.classList.remove('is-invalid', 'is-valid');
  if (otpInput.value.length === 6) {
    otpInput.classList.add('is-valid');
  } else if (otpInput.value.length > 0) {
    otpInput.classList.add('is-invalid');
  }
});


btnValidarOtp.addEventListener('click', async () => {
  const otp = otpInput.value.trim();

  if (otp.length !== 6) {
    mostrarAlerta('El código OTP debe tener 6 dígitos', 'warning');
    otpInput.focus();
    return;
  }


  limpiarAlertas();

 
  btnValidarOtp.disabled = true;
  btnValidarOtp.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando código...';

  try {
    const response = await fetch(`${API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        correo: correoGuardado, 
        otp 
      })
    });

    const data = await response.json();

    if (response.ok && data.verified) {
      mostrarAlerta('✓ Código verificado correctamente. Redirigiendo...', 'success');

      sessionStorage.setItem('recovery_email', correoGuardado);
      sessionStorage.setItem('recovery_otp', otp);
      
      setTimeout(() => {
        window.location.href = 'nueva-contrasena.html';
      }, 1500);

    } else {
      const mensajeError = data.error || data.message || 'Código OTP incorrecto o expirado';
      mostrarAlerta(mensajeError, 'danger');
      
      btnValidarOtp.disabled = false;
      btnValidarOtp.innerHTML = 'Validar OTP';
      otpInput.value = '';
      otpInput.classList.remove('is-valid', 'is-invalid');
      otpInput.focus();
    }

  } catch (error) {
    console.error('Error de conexión:', error);
    mostrarAlerta(
      'No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.', 
      'danger'
    );
    
    btnValidarOtp.disabled = false;
    btnValidarOtp.innerHTML = 'Validar OTP';
  }
});

emailInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !btnEnviarCodigo.disabled) {
    btnEnviarCodigo.click();
  }
});

otpInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !btnValidarOtp.disabled) {
    btnValidarOtp.click();
  }
});