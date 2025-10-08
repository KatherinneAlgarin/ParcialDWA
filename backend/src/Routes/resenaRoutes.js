import { Router } from 'express';
import * as resenaController from '../Controllers/resenaControllers.js';
import { verificarToken } from '../Middleware/authMiddleware.js';
import { runValidations, createResenaValidators, updateResenaValidators } from '../Middleware/validator.js';

const router = Router();
router.get('/empresa/:idempresa', resenaController.getResenasPorEmpresa);
router.post('/empresa/:idempresa',
    verificarToken,
    runValidations(createResenaValidators),
    resenaController.postCrearResena
);
router.put('/:id', 
    verificarToken,
    runValidations(updateResenaValidators), 
    resenaController.putActualizarResena
);
router.delete('/:id', 
    verificarToken,
    resenaController.deleteResena
);

export default router;