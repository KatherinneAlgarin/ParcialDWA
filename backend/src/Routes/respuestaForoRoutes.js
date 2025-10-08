import { Router } from 'express';
import * as respuestaController from '../Controllers/respuestaForoController.js';
import { verificarToken } from '../Middleware/authMiddleware.js';
import { runValidations, createRespuestaForoValidators } from '../Middleware/validator.js';

const router = Router();
router.use(verificarToken); 

router.post('/', runValidations(createRespuestaForoValidators), respuestaController.postCrearRespuesta);
router.put('/:id', respuestaController.putActualizarRespuesta);
router.delete('/:id', respuestaController.deleteRespuesta);

export default router;