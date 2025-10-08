import { Router } from 'express';
import * as foroController from '../Controllers/foroController.js';
import { verificarToken, verificarRol } from '../Middleware/authMiddleware.js';
import { runValidations, createForoValidators, updateForoValidators } from '../Middleware/validator.js';

const router = Router();


router.get('/', foroController.getTodosLosTemas);
router.get('/:id', foroController.getTemaPorId);

router.post('/', 
    verificarToken,
    verificarRol('Candidato', 'Empleador'),
    runValidations(createForoValidators),
    foroController.postCrearTema
);

router.put('/:id', 
    verificarToken,
    runValidations(updateForoValidators),
    foroController.putActualizarTema
);

router.delete('/:id', 
    verificarToken,
    foroController.deleteTema
);

export default router;