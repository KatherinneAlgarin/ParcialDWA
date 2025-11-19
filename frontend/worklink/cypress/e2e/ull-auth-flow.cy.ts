// File: frontend/worklink/cypress/e2e/full-auth-flow.cy.ts

describe('Flujo de Autenticación Completo (E2E)', () => {

  it('debería registrar un nuevo usuario, iniciar sesión y ser redirigido al dashboard', () => {
    
    // --- 0. PREPARACIÓN ---
    // Creamos credenciales únicas para cada ejecución de la prueba
    // para evitar fallos por "email duplicado" en el backend.
    const timestamp = Date.now();
    const userName = `UsuarioE2E_${timestamp}`;
    const userEmail = `e2e_${timestamp}@worklink.com`;
    const userPassword = 'password123';
    
    // Escuchamos el 'alert' que programamos en el componente
    // de registro y lo validamos, sin bloquear la prueba.
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Cuenta creada con éxito.');
    });

    // --- 1. REGISTRO ---
    cy.visit('/register');

    // Llenamos el formulario de registro
    cy.get('input[name="nombre"]').type(userName);
    cy.get('input[name="correo"]').type(userEmail);
    cy.get('input[name="password"]').type(userPassword);
    cy.get('input[name="confirmPassword"]').type(userPassword);
    
    // Seleccionamos "Candidato" en el <select>
    cy.get('select[name="rol"]').select('Candidato');

    // Enviamos el formulario
    cy.get('button[type="submit"]').click();

    // --- 2. LOGIN ---
    // Verificamos que fuimos redirigidos a /login
    cy.url().should('include', '/login');

    // Llenamos el formulario de login (con los datos recién creados)
    // Usamos {timeout: 6000} para dar tiempo a que la página cargue
    cy.get('input[name="email"]', { timeout: 6000 }).type(userEmail);
    cy.get('input[name="password"]').type(userPassword);

    // Enviamos el formulario de login
    cy.get('button[type="submit"]').click();

    // --- 3. VERIFICACIÓN FINAL ---
    // Verificamos que fuimos redirigidos al dashboard del candidato
    // (Según la lógica de tu login)
    cy.url().should('include', '/home-candidato');

    // ¡Aquí está la parte que pediste!
    // Cuando construyamos el dashboard, tendrá un
    // elemento (ej. <app-home-candidato>) que contendrá el DOM.
    //
    // Cuando ese componente exista, esta prueba funcionará:
    
    /*
    // TODO: Descomentar cuando 'HomeCandidatoComponent' exista
    
    // Buscamos un <h1> dentro del componente principal que 
    // contenga el mensaje de bienvenida.
    cy.get('app-home-candidato', { timeout: 10000 })
      .should('contain.text', `Bienvenido ${userName}`);
      
    // O si prefieres ser más específico:
    // cy.get('h1.welcome-message').should('contain', `Bienvenido ${userName}`);
    */
  });
});