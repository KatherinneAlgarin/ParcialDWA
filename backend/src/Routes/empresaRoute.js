// backend/src/Routes/empresaRoute.js
import { Router } from "express";
import * as empresaController from "../Controllers/empresaControllers.js";
import { 
    createEmpresaValidators, 
    updateEmpresaValidators, 
    idEmpresaValidator,
    runValidations 
} from "../Middleware/validator.js";
import { verificarToken, verificarRol } from "../Middleware/authMiddleware.js";
import uploadLogo from "../Config/multerProfile.js";

const router = Router();

router.get(
    '/usuario/mi-empresa',
    verificarToken,
    empresaController.getEmpresaDelUsuario
);

const empleadorMiddleware = [verificarToken, verificarRol('Empleador')];


router.post('/', 
    ...empleadorMiddleware,
    uploadLogo.single('logo'), 
    runValidations(createEmpresaValidators),
    empresaController.postCrearEmpresa
);


router.put( '/:id', 
    ...empleadorMiddleware,
    uploadLogo.single('logo'), 
    runValidations(updateEmpresaValidators),
    empresaController.putActualizarEmpresa
);


router.delete('/:id', 
    ...empleadorMiddleware,
    runValidations(idEmpresaValidator), 
    empresaController.deleteEmpresa
);

export default router;