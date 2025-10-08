import { Router } from 'express';
import * as ofertaController from '../Controllers/ofertaController.js';
import { verificarToken, verificarRol } from '../Middleware/authMiddleware.js';
import { 
  runValidations,
  createOfertaValidators,
  updateOfertaValidators,
  idOfertaValidator
} from '../Middleware/validator.js';
import * as aplicacionController from '../Controllers/aplicacionController.js';
import uploadCV from '../Config/multerCurriculums.js';
import * as applicationController from '../Controllers/aplicacionController.js';
const router = Router();

router.get('/', ofertaController.getTodasLasOfertas);
router.get('/buscar', ofertaController.getBuscarOfertas);
router.get('/:id', 
  runValidations(idOfertaValidator), 
  ofertaController.getOfertaPorId
);
router.post(
  '/:idoferta/aplicar',
  verificarToken,
  verificarRol('Candidato'),
  uploadCV.single('cv'),
  aplicacionController.postCrearAplicacion
);
router.use(verificarToken, verificarRol('Empleador'));

router.post('/', 
  runValidations(createOfertaValidators), 
  ofertaController.crearNuevaOferta
);

router.get('/mi-empresa/ofertas', 
  ofertaController.getOfertasDeMiEmpresa
);

router.put('/:id', 
  runValidations(updateOfertaValidators), 
  ofertaController.actualizarOfertaExistente
);

router.delete('/:id', 
  runValidations(idOfertaValidator), 
  ofertaController.eliminarOfertaExistente
);
router.get(
    '/:idoferta/aplicaciones',
    verificarToken,
    verificarRol('Empleador'),
    applicationController.getAplicacionesPorOferta 
);

export default router;