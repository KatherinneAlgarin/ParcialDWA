import { Router } from "express";
import * as userController from "../Controllers/usuarioController.js";
import { createUserValidators, runValidations } from "../Middleware/validator.js";
import { verificarToken, verificarRol } from "../Middleware/authMiddleware.js";
import uploadProfile from "../Config/multerProfile.js";
import uploadCV from "../Config/multerCurriculums.js";

const router = Router();
router.post('/', runValidations(createUserValidators), userController.postCrearUsuario);
router.post('/login', userController.loginUsuario);
router.get('/perfil', verificarToken, userController.obtenerPerfil);
router.put(
  '/:id', 
  verificarToken,
  (req, res, next) => {
    uploadProfile.single('fotoPerfil')(req, res, (err) => {
      if (err) {
        console.error('❌ Error de Multer:', err);
        return next(err);
      }
      next();
    });
  },
  userController.putActualizarUsuario
);

router.put(
  '/:id/curriculum', 
  verificarToken, 
  verificarRol('Candidato'), 
  uploadCV.single('curriculum'), 
  userController.putActualizarCurriculum
);
router.delete('/:id', verificarToken, userController.deleteUsuario);
export default router;