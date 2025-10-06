// /backend/src/Routes/empresaRoutes.js
import { Router } from "express";
import * as empresaController from "../Controllers/empresaController.js";
import { 
    createEmpresaValidators, 
    updateEmpresaValidators, 
    idEmpresaValidator, 
    buscarEmpresaValidators,
    runValidations 
} from "../Middleware/validator.js";
import { verificarToken } from "../Middleware/authMiddleware.js";
import uploadLogo from "../Config/multerProfile.js";

const router = Router();

router.get(
    '/',
    empresaController.getTodasLasEmpresas
);
router.get(
    '/buscar',
    runValidations(buscarEmpresaValidators),
    empresaController.getBuscarEmpresas
);
router.get(
    '/:id',
    runValidations(idEmpresaValidator),
    empresaController.getEmpresaPorId
);
router.get(
    '/usuario/mi-empresa',
    verificarToken,
    empresaController.getEmpresaDelUsuario
);
router.post('/', verificarToken, (req, res, next) => { uploadLogo.single('logo')(req, res, (err) => {
        if (err) {
            console.error('❌ Error de Multer:', err);
        return next(err);
    }
    next();
});
    },
    runValidations(createEmpresaValidators),
    empresaController.postCrearEmpresa
);

router.put( '/:id', verificarToken, (req, res, next) => {
        uploadLogo.single('logo')(req, res, (err) => {
            if (err) {
                console.error('❌ Error de Multer:', err);
                return next(err);
            }
            next();
        });
    },
    runValidations(updateEmpresaValidators),
    empresaController.putActualizarEmpresa
);
router.delete('/:id', verificarToken, runValidations(idEmpresaValidator), empresaController.deleteEmpresa);

export default router;