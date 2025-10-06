// src/Routes/passwordRecoveryRoutes.js
import express from 'express';
import * as passwordRecoveryController from '../Controllers/paswordRecoveryController.js';

const router = express.Router();

router.post('/forgot-password', passwordRecoveryController.postSolicitarOTP);
router.post('/verify-otp', passwordRecoveryController.postVerificarOTP);
router.post('/reset-password', passwordRecoveryController.postRestablecerPassword);

export default router;