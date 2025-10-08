import express from "express";
import dotenv from "dotenv";
import sequelize from "./db.js";
import cors from 'cors';
import usuariosRouter from "../Routes/usuarioRoutes.js";
import passwordRecoveryRouter from "../Routes/passwordRecoveryRoute.js"; // ✅ NUEVO
import { errorHandler } from "../Middleware/errorHandler.js";
import initModels from "../Models/initModels.js";
import empresaRoutes from '../Routes/empresaRoutes.js';
import ofertasRouter from "../Routes/ofertaRoutes.js";
import '../Models/associations.js'
import resenaRouter from "../Routes/resenaRoutes.js";
import aplicacionRoutes from "../Routes/aplicacionRoutes.js";
import foroRoutes from "../Routes/foroRoutes.js";
import company from "../Routes/empresaRoute.js";
import recursoRoutes from "../Routes/recursoRoutes.js";
import respuestaForoRoutes from "../Routes/respuestaForoRoutes.js";
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('src/uploads')); 
app.get('/', (req, res) => {
  res.send('✅ El servidor está funcionando correctamente.');
});
app.use('/api/usuarios', usuariosRouter);
app.use('/api/auth', passwordRecoveryRouter); 
app.use('/api/empresas', empresaRoutes);
app.use('/api/ofertas', ofertasRouter);
app.use('/api/aplicaciones', aplicacionRoutes);
app.use('/api/resenas', resenaRouter);
app.use('/api/foros', foroRoutes);
app.use('/api/empresa', company);
app.use('/api/recursos', recursoRoutes);
app.use('/api/respuestas-foro', respuestaForoRoutes);
app.use(errorHandler);

const PORT = process.env.PORT;
const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida');
      const models = initModels();
      
      await sequelize.sync(); 
      console.log('✅ Base de datos sincronizada');
      
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📧 Email configurado: ${process.env.EMAIL_USER ? '✅' : '❌'}`);
        console.log(`🏢 Empresa: ${process.env.COMPANY_NAME || 'No configurada'}`);
      });
      
      return; 
    } catch (err) {
      console.error(`❌ Intento ${i + 1}/${retries} falló:`, err.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Reintentando en ${delay/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ No se pudo conectar a la base de datos después de varios intentos');
        process.exit(1);
      }
    }
  }
};
connectWithRetry();
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});