import { Router } from "express";
import * as userController from "../Controllers/usuarioController.js";
import { createUserValidators, runValidations } from "../Middleware/validator.js";
import uploadProfile from "../Config/multerProfile.js";
import uploadCV from "../Config/multerCurriculums.js";

const router = Router();



router.post('/', runValidations(createUserValidators), userController.postCrearUsuario);

router.post('/login', userController.loginUsuario);

router.put('/:id', userController.putActualizarUsuario);

router.put('/:id/fotoPerfil', uploadProfile.single('fotoPerfil'), userController.putActualizarFotoPerfil);

router.put('/:id/curriculum', uploadCV.single('curriculum'), userController.putActualizarCurriculum);

router.delete('/:id', userController.deleteUsuario);

export default router;