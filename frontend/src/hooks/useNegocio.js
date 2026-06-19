// src/hooks/useNegocio.js
import { useContext } from "react";
import { NegocioContext } from "../context/NegocioContext";

export function useNegocio() {
  const { state, dispatch } = useContext(NegocioContext);

  return {
    state,
    dispatch,
    setVista: (vista) => dispatch({ type: "SET_VISTA", payload: vista }),
    completarOnboarding: (datos) => dispatch({ type: "COMPLETAR_ONBOARDING", payload: datos }),
    agregarProducto: (p) => dispatch({ type: "AGREGAR_PRODUCTO", payload: p }),
    editarProducto: (p) => dispatch({ type: "EDITAR_PRODUCTO", payload: p }),
    eliminarProducto: (id) => dispatch({ type: "ELIMINAR_PRODUCTO", payload: id }),
    agregarCita: (c) => dispatch({ type: "AGREGAR_CITA", payload: c }),
    eliminarCita: (id) => dispatch({ type: "ELIMINAR_CITA", payload: id }),
    agregarNotificacion: (n) => dispatch({ type: "AGREGAR_NOTIFICACION", payload: n }),
    marcarLeida: (id) => dispatch({ type: "MARCAR_LEIDA", payload: id }),
  };
}
