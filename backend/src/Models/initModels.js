import Usuario from "./Usuario.js";
import Empresa from "./Empresa.js";
import Oferta from "./Oferta.js";
import Aplicacion from "./Aplicacion.js";
import Resena from "./Resena.js";
import Foro from "./Foro.js";
import RespuestaForo from "./RespuestaForo.js";
import Recurso from "./Recurso.js";
const initModels = () => {
  return {
    Usuario,
    Empresa,
    Oferta,
    Aplicacion,
    Resena,
    Foro,
    RespuestaForo,
    Recurso
  };
};

export default initModels;
