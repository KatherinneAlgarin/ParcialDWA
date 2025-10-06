import { Router } from 'express';
import * as ofertaController from '../Controllers/ofertaController.js';
import { verificarToken, verificarRol } from '../Middleware/authMiddleware.js';
import { runValidations, createOfertaValidators, updateOfertaValidators, idOfertaValidator } from '../Middleware/validator.js';

const router = Router();
router.get('/', ofertaController.getTodasLasOfertas);

router.get('/:id', runValidations(idOfertaValidator), ofertaController.getOfertaPorId);

router.use(verificarToken, verificarRol('Empleador'));

router.post('/', runValidations(createOfertaValidators), ofertaController.crearNuevaOferta);

router.get('/mi-empresa/ofertas', ofertaController.getOfertasDeMiEmpresa);

router.put('/:id', runValidations(updateOfertaValidators), ofertaController.actualizarOfertaExistente);

router.delete('/:id', runValidations(idOfertaValidator), ofertaController.eliminarOfertaExistente);

export default router;