// backend/src/Controllers/empresaControllers.js
import * as empresaService from '../Services/empresaServices.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {generarToken } from '../Middleware/authMiddleware.js';
import Usuario from '../Models/Usuario.js';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const getEmpresaPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        console.log('📋 Obteniendo empresa:', id);
        
        const empresa = await empresaService.obtenerEmpresaPorId(id);
        
        console.log('✅ Empresa encontrada');
        res.status(200).json(empresa);
        
    } catch (err) {
        console.error('❌ Error en getEmpresaPorId:', err);
        next(err);
    }
};
export const getEmpresaDelUsuario = async (req, res, next) => {
    try {
        const empresa = await empresaService.obtenerEmpresaPorUsuario(req.usuario.id);
        res.status(200).json(empresa);
    } catch (err) { next(err); }
};
export const getTodasLasEmpresas = async (req, res, next) => {
    try {
        console.log('📋 Obteniendo todas las empresas');
        
        const empresas = await empresaService.obtenerTodasLasEmpresas();
        
        console.log(`✅ ${empresas.length} empresas encontradas`);
        res.status(200).json(empresas);
        
    } catch (err) {
        console.error('❌ Error en getTodasLasEmpresas:', err);
        next(err);
    }
};
export const getBuscarEmpresas = async (req, res, next) => {
    try {
        const { nombre } = req.query;
        
        if (!nombre) {
            const error = new Error("Debes proporcionar un nombre para buscar");
            error.statusCode = 400;
            throw error;
        }
        
        console.log('🔍 Buscando empresas:', nombre);
        
        const empresas = await empresaService.buscarEmpresasPorNombre(nombre);
        
        console.log(`✅ ${empresas.length} empresas encontradas`);
        res.status(200).json(empresas);
        
    } catch (err) {
        console.error('❌ Error en getBuscarEmpresas:', err);
        next(err);
    }
};
export const postCrearEmpresa = async (req, res, next) => {
    try {
        const { nombre, direccion, descripcion, redesSociales } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            if (req.file) {
                const rutaArchivo = path.join(__dirname, '../uploads/fotoPerfil', req.file.filename);
                if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);
            }
            const error = new Error("El nombre de la empresa es obligatorio");
            error.statusCode = 400;
            throw error;
        }
        const logo = req.file ? req.file.filename : null;
        const nuevaEmpresa = await empresaService.crearEmpresa(
            nombre, direccion, logo, descripcion, redesSociales
        );
        const usuario = await Usuario.findByPk(req.usuario.id);
        usuario.idempresa = nuevaEmpresa.idempresa;
        await usuario.save();

        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
            idempresa: usuario.idempresa
        };

        const nuevoToken = generarToken(payload);
        res.status(201).json({
            empresa: nuevaEmpresa,
            token: nuevoToken,
            usuario: {
              id: usuario.id,
              correo: usuario.correo,
              rol: usuario.rol,
              idempresa: usuario.idempresa
            }
        });
        
    } catch (err) {
        next(err);
    }
};


export const putActualizarEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Verificación de permisos (esta parte ya está bien)
        if (req.usuario.idempresa != id) {
            const error = new Error("No tienes permisos para actualizar esta empresa");
            error.statusCode = 403;
            throw error;
        }

        let datosActualizados = { ...req.body };
        if (req.file) {
            datosActualizados.logo = req.file.filename;
        }
        delete datosActualizados.idempresa;

        
        
        // 3. Limpieza de datos (convertir vacíos a null)
        // Esto ahora se ejecuta DESPUÉS de la validación del nombre.
        Object.keys(datosActualizados).forEach(key => {
            if (datosActualizados[key] === '' || datosActualizados[key] === 'null' || datosActualizados[key] === 'undefined') {
                datosActualizados[key] = null;
            }
        });

        // 4. Llamada al servicio
        const empresaActualizada = await empresaService.actualizarEmpresa(id, datosActualizados);

        if (!empresaActualizada) {
            // Este error solo debería ocurrir si el ID no existe en la BD
            throw new Error("Empresa no encontrada o sin cambios para realizar.");
        }

        res.status(200).json(empresaActualizada);
        
    } catch (err) {
        // ... tu código de manejo de errores ...
        next(err);
    }
};
export const deleteEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const idusuario = req.usuario.id;

        // Verificación de permisos
        if (req.usuario.idempresa !== parseInt(id)) {
            throw new Error("No tienes permisos para eliminar esta empresa");
        }

        const eliminado = await empresaService.eliminarEmpresa(id);
        if (!eliminado) {
            throw new Error("Empresa no encontrada");
        }

        // --- LÓGICA DE REFRESCO DE TOKEN ---
        // 1. Buscamos al usuario que realizó la acción
        const usuario = await Usuario.findByPk(idusuario);

        // 2. Creamos el nuevo payload con idempresa: null
        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            rol: usuario.rol,
            idempresa: null // El usuario ya no tiene empresa
        };

        // 3. Generamos y enviamos el nuevo token
        const nuevoToken = generarToken(payload);

        res.status(200).json({ 
            message: "Empresa eliminada y token refrescado exitosamente",
            token: nuevoToken // Devolvemos el nuevo token al frontend
        });
        
    } catch (err) {
        err.statusCode = err.statusCode || 500;
        next(err);
    }
};