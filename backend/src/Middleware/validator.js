import { body, validationResult } from "express-validator";

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
