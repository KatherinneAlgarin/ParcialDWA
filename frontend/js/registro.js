
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = form.nombre.value.trim();
    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    const rolIndex = form.rol.value;


    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    let rol = "";
    if (rolIndex === "1") rol = "Empleador";
    else if (rolIndex === "2") rol = "Candidato";

    try {
      const res = await fetch("http://localhost:3000/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const mensajes = data.errors.map(err => err.msg).join("\n");
          throw new Error(mensajes);
        } else {
          throw new Error(data.message || "Error al crear usuario");
        }
      }

      alert("Cuenta creada con éxito");
      window.location.href = "signin.html"; 
    } catch (err) {
      alert("Error:\n" + err.message);
    }
  });
});

function togglePasswordVisibility(button) {
  const inputId = button.getAttribute('data-target');
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      button.querySelector('i').classList.remove('bi-eye');
      button.querySelector('i').classList.add('bi-eye-slash');
    } else {
      input.type = 'password';
      button.querySelector('i').classList.remove('bi-eye-slash');
      button.querySelector('i').classList.add('bi-eye');
    }
  }
}