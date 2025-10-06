// Crear archivo: backend/convertLogoBase64.js
// Ejecutar: node convertLogoBase64.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, 'src', 'uploads', 'logo', 'logo.png');

try {
  // Leer el archivo
  const logoBuffer = fs.readFileSync(logoPath);
  
  // Convertir a Base64
  const logoBase64 = logoBuffer.toString('base64');
  
  // Determinar el tipo MIME (puedes cambiarlo según tu logo)
  const extension = path.extname(logoPath).toLowerCase();
  let mimeType = 'image/png';
  
  if (extension === '.jpg' || extension === '.jpeg') {
    mimeType = 'image/jpeg';
  } else if (extension === '.gif') {
    mimeType = 'image/gif';
  } else if (extension === '.svg') {
    mimeType = 'image/svg+xml';
  }
  
  // Crear el data URL completo
  const dataURL = `data:${mimeType};base64,${logoBase64}`;
  
  console.log('\n✅ Logo convertido exitosamente!\n');
  console.log('📋 Copia esta línea y pégala en tu archivo .env:\n');
  console.log(`COMPANY_LOGO=${dataURL}\n`);
  
  // Opcional: guardar en un archivo
  fs.writeFileSync('logo-base64.txt', dataURL);
  console.log('💾 También se guardó en el archivo: logo-base64.txt\n');
  
} catch (error) {
  console.error('❌ Error al convertir el logo:', error.message);
  console.log('\n📝 Verifica que la ruta del logo sea correcta:');
  console.log(logoPath);
}