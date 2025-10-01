import express from "express";
import dotenv from "dotenv";
import sequelize from "./db.js";
import usuariosRouter from "../Routes/usuarioRoutes.js";
import { errorHandler } from "../Middleware/errorHandler.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads")); // servir fotos y CVs

// Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ El servidor está funcionando correctamente.");
});

// Rutas
app.use("/usuarios", usuariosRouter);


app.use(errorHandler);


sequelize.sync()
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(process.env.PORT, ()  => {
      console.log('🚀 Servidor corriendo en http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });