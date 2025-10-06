// backend/src/Middleware/validator.js
import { body, validationResult, param, query } from "express-validator";

export const runValidations = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const error = new Error("Errores de validación");
    error.statusCode = 400;
    error.errors = errors.array();

    return next(error);
  };
};

export const createUserValidators = [
  body("nombre").trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio"),
  
  body("correo")
    .trim()
    .isEmail()
    .withMessage("El correo no es válido"),
  
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  
  body("rol")
    .trim()
    .notEmpty()
    .withMessage("El rol es obligatorio"),
];

export const loginValidators = [
  body("correo")
    .trim()
    .isEmail()
    .withMessage("El correo no es válido"),
  
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

export const createEmpresaValidators = [
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la empresa es obligatorio')
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  
  body('direccion')
    .optional()
    .trim(),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('redesSociales')
    .optional()
    .trim(),
];

export const updateEmpresaValidators = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID inválido'),
  
  body('nombre')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre no puede estar vacío')
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre debe tener entre 3 y 150 caracteres'),
  
  body('direccion')
    .optional()
    .trim(),
  
  body('descripcion')
    .optional()
    .trim(),
  
  body('redesSociales')
    .optional()
    .trim(),
];

export const idEmpresaValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de empresa inválido'),
];

export const buscarEmpresaValidators = [
  query('nombre')
    .trim()
    .notEmpty()
    .withMessage('Debes proporcionar un nombre para buscar'),
];
export const createOfertaValidators = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio.').isLength({ min: 5, max: 150 }).withMessage('El título debe tener entre 5 y 150 caracteres.'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  body('rubro').trim().notEmpty().withMessage('El rubro es obligatorio.'),
  body('salario_minimo').optional().isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo.'),
  body('salario_maximo').optional().isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo.')
    .custom((value, { req }) => {
      if (value && req.body.salario_minimo && parseFloat(value) < parseFloat(req.body.salario_minimo)) {
        throw new Error('El salario máximo no puede ser menor que el salario mínimo.');
      }
      return true;
    }),
  body('tipo_salario').isIn(['Quincenal', 'Mensual']).withMessage('El tipo de salario debe ser "Quincenal" o "Mensual".'),
  body('tipo_contrato').trim().notEmpty().withMessage('El tipo de contrato es obligatorio.'),
  body('educacion').optional().trim(),
  body('experiencia').optional().trim(),
  body('responsabilidades').optional().trim(),
  body('cantidad_plazas').optional().isInt({ min: 1 }).withMessage('La cantidad de plazas debe ser al menos 1.'),
];

export const updateOfertaValidators = [
  param('id').isInt({ min: 1 }).withMessage('El ID de la oferta es inválido.'),
  body('titulo').optional().trim().notEmpty().withMessage('El título no puede quedar vacío.').isLength({ min: 5, max: 150 }).withMessage('El título debe tener entre 5 y 150 caracteres.'),
  body('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede quedar vacía.'),
  body('rubro').optional().trim().notEmpty().withMessage('El rubro es obligatorio.'),
  body('salario_minimo').optional().isFloat({ min: 0 }).withMessage('El salario mínimo debe ser un número positivo.'),
  body('salario_maximo').optional().isFloat({ min: 0 }).withMessage('El salario máximo debe ser un número positivo.')
    .custom((value, { req }) => {
      const minSalary = req.body.salario_minimo || req.ofertaOriginal?.salario_minimo; 
      if (value && minSalary && parseFloat(value) < parseFloat(minSalary)) {
        throw new Error('El salario máximo no puede ser menor que el salario mínimo.');
      }
      return true;
    }),
  body('tipo_salario').optional().isIn(['Quincenal', 'Mensual']).withMessage('El tipo de salario debe ser "Quincenal" o "Mensual".'),
  body('tipo_contrato').optional().trim().notEmpty().withMessage('El tipo de contrato no puede quedar vacío.'),
  body('educacion').optional().trim(),
  body('experiencia').optional().trim(),
  body('responsabilidades').optional().trim(),
  body('cantidad_plazas').optional().isInt({ min: 1 }).withMessage('La cantidad de plazas debe ser al menos 1.'),
];

export const idOfertaValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID de oferta inválido'),
];