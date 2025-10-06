document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = form.email.value.trim();
    const password = form.password.value.trim();
    if (!correo || !password) {
      alert("Correo y contraseña son obligatorios");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          const mensajes = data.errors.map(err => err.msg).join("\n");
          throw new Error(mensajes);
        } else {
          throw new Error(data.message || "Error al iniciar sesión");
        }
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (data.usuario.rol === "Empleador") {
        window.location.href = "empresa.html";
      } else {
        window.location.href = "homeCandidato.html";
      }

    } catch (err) {
      alert("Error:\n" + err.message);
    }
  });
});
