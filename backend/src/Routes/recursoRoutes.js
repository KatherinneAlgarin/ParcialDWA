import { Router } from 'express';
import * as recursoController from '../Controllers/recursoController.js';
import { verificarToken, verificarRol } from '../Middleware/authMiddleware.js';
import { runValidations, createRecursoValidators, updateRecursoValidators } from '../Middleware/validator.js';

const router = Router();
router.get('/', recursoController.getTodosLosRecursos);

const empleadorMiddleware = [verificarToken, verificarRol('Empleador')];

router.post('/', 
    ...empleadorMiddleware, 
    runValidations(createRecursoValidators), 
    recursoController.postCrearRecurso
);

router.put('/:id', 
    ...empleadorMiddleware, 
    runValidations(updateRecursoValidators), 
    recursoController.putActualizarRecurso
);
router.delete('/:id', 
    ...empleadorMiddleware, 
    recursoController.deleteRecurso
);
router.get('/mis-recursos', ...empleadorMiddleware, recursoController.getMisRecursos);

export default router;