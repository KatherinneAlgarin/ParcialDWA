import { Router } from 'express';
import * as aplicacionController from '../Controllers/aplicacionController.js';
import { verificarToken, verificarRol } from '../Middleware/authMiddleware.js';

const router = Router();
router.get(
    '/mis-aplicaciones', 
    verificarToken, 
    verificarRol('Candidato'), 
    aplicacionController.getMisAplicaciones
);

router.delete(
    '/:id', 
    verificarToken, 
    verificarRol('Candidato'), 
    aplicacionController.deleteAplicacion
);
router.put(
    '/:idaplicacion/estado', 
    verificarToken, 
    verificarRol('Empleador'), 
    aplicacionController.putActualizarEstado
);
router.get(
    '/empresa/todas', 
    verificarToken, 
    verificarRol('Empleador'), 
    aplicacionController.getTodasAplicacionesDeEmpresa
);

export default router;