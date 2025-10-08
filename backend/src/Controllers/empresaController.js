// backend/src/Controllers/empresaController.js
import * as empresaService from '../Services/empresaService.js';
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
        const idUsuario = req.usuario.id;
        
        console.log('📋 Obteniendo empresa del usuario:', idUsuario);
        
        const empresa = await empresaService.obtenerEmpresaPorUsuario(idUsuario);
        
        console.log('✅ Empresa del usuario encontrada');
        res.status(200).json(empresa);
        
    } catch (err) {
        console.error('❌ Error en getEmpresaDelUsuario:', err);
        next(err);
    }
};
export const getEmpresasPublicas = async (req, res, next) => {
    try {
        const { nombre } = req.query; 
        const empresas = await empresaService.obtenerEmpresasConValoracion(nombre);
        res.status(200).json(empresas);
    } catch (err) {
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
            email: usuario.email,
            rol: usuario.rol,
            idempresa: usuario.idempresa
        };

        const nuevoToken = generarToken(payload);
        res.status(201).json({
            empresa: nuevaEmpresa,
            token: nuevoToken
        });
        
    } catch (err) {
        next(err);
    }
};


export const putActualizarEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        console.log('📝 Actualizando empresa:', id);
        console.log('📦 Body recibido:', Object.keys(req.body));
        console.log('📸 Archivo recibido:', req.file ? req.file.filename : 'ninguno');
        if (req.usuario.idempresa !== parseInt(id)) {
            if (req.file) {
                const rutaArchivo = path.join(__dirname, '../uploads/fotoPerfil', req.file.filename);
                if (fs.existsSync(rutaArchivo)) {
                    fs.unlinkSync(rutaArchivo);
                }
            }
            const error = new Error("No tienes permisos para actualizar esta empresa");
            error.statusCode = 403;
            throw error;
        }

        let datosActualizados = { ...req.body };
        if (req.file) {
            datosActualizados.logo = req.file.filename;
            console.log('✅ Logo recibido y guardado:', req.file.filename);
        }
        delete datosActualizados.idempresa;
        if (datosActualizados.nombre !== undefined) {
            if (!datosActualizados.nombre || datosActualizados.nombre.trim() === '') {
                const error = new Error("El nombre no puede estar vacío");
                error.statusCode = 400;
                throw error;
            }
        }
        Object.keys(datosActualizados).forEach(key => {
            if (datosActualizados[key] === '' || 
                datosActualizados[key] === 'null' || 
                datosActualizados[key] === 'undefined') {
                datosActualizados[key] = null;
            }
        });
        console.log('💾 Datos a guardar:', datosActualizados);
        const empresaActualizada = await empresaService.actualizarEmpresa(id, datosActualizados);

        if (!empresaActualizada) {
            const error = new Error("Empresa no encontrada");
            error.statusCode = 404;
            throw error;
        }

        console.log('✅ Empresa actualizada exitosamente');
        res.status(200).json(empresaActualizada);
        
    } catch (err) {
        console.error('❌ Error en putActualizarEmpresa:', err);
        if (req.file) {
            const rutaArchivo = path.join(__dirname, '../uploads/fotoPerfil', req.file.filename);
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
                console.log('🗑️ Archivo eliminado por error:', req.file.filename);
            }
        }
        next(err);
    }
};
export const deleteEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Eliminando empresa:', id);
        if (req.usuario.idempresa !== parseInt(id)) {
            const error = new Error("No tienes permisos para eliminar esta empresa");
            error.statusCode = 403;
            throw error;
        }
        if (req.usuario.rol !== 'Empleador') {
            const error = new Error("Solo los empleadores pueden eliminar empresas");
            error.statusCode = 403;
            throw error;
        }
        const eliminado = await empresaService.eliminarEmpresa(id);
        if (!eliminado) {
            const error = new Error("Empresa no encontrada");
            error.statusCode = 404;
            throw error;
        }
        console.log('✅ Empresa eliminada exitosamente');
        res.status(200).json({ 
            message: "Empresa eliminada exitosamente",
            success: true 
        });
        
    } catch (err) {
        console.error('❌ Error en deleteEmpresa:', err);
        next(err);
    }
};