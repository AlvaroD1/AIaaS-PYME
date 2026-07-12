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
    agregarProducto: async (p) => {
      try {
        let fotoUrlToSave = p.fotoUrl || "";

        // Si hay un archivo, subirlo primero
        if (p.fotoFile) {
          const formData = new FormData();
          formData.append("foto", p.fotoFile);
          const uploadRes = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            fotoUrlToSave = uploadData.url;
          }
        }

        const res = await fetch("http://localhost:3000/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: p.nombre,
            descripcion: p.descripcion || p.desc || "",
            precio: p.precio,
            stock_actual: p.stock,
            stock_minimo: 5,
            foto_url: fotoUrlToSave,
            pyme_id: 1, // hardcodeado para MVP
          }),
        });
        const data = await res.json();
        // Dispatch con el formato del frontend
        dispatch({ 
          type: "AGREGAR_PRODUCTO", 
          payload: { 
            id: data.producto_id, 
            nombre: data.nombre, 
            desc: data.descripcion || "", 
            precio: parseFloat(data.precio), 
            stock: data.stock_actual,
            fotoUrl: data.foto_url || ""
          } 
        });
      } catch (err) {
        console.error("Error agregando producto en DB", err);
      }
    },
    editarProducto: async (p) => {
      try {
        let fotoUrlToSave = p.fotoUrl || "";

        // Si hay un archivo nuevo, subirlo
        if (p.fotoFile) {
          const formData = new FormData();
          formData.append("foto", p.fotoFile);
          const uploadRes = await fetch("http://localhost:3000/api/upload", {
            method: "POST",
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            fotoUrlToSave = uploadData.url;
          }
        }

        const res = await fetch(`http://localhost:3000/api/productos/${p.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: p.nombre,
            descripcion: p.descripcion || p.desc || "",
            precio: p.precio,
            stock_actual: p.stock,
            foto_url: fotoUrlToSave,
          }),
        });
        const data = await res.json();
        dispatch({ 
          type: "EDITAR_PRODUCTO", 
          payload: { 
            id: data.producto_id, 
            nombre: data.nombre, 
            desc: data.descripcion || "", 
            precio: parseFloat(data.precio), 
            stock: data.stock_actual,
            fotoUrl: data.foto_url || ""
          } 
        });
      } catch (err) {
        console.error("Error editando producto en DB", err);
      }
    },
    eliminarProducto: async (id) => {
      try {
        await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
        dispatch({ type: "ELIMINAR_PRODUCTO", payload: id });
      } catch (err) {
        console.error("Error eliminando producto en DB", err);
      }
    },
    // -- Equipo Médico --
    agregarMiembroEquipo: async (miembro) => {
      try {
        const res = await fetch("http://localhost:3000/api/equipo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(miembro),
        });
        const data = await res.json();
        dispatch({ type: "AGREGAR_MIEMBRO_EQUIPO", payload: { id: data.miembro_id, nombre: data.nombre, especialidad: data.especialidad } });
      } catch (err) { console.error(err); }
    },
    eliminarMiembroEquipo: async (id) => {
      try {
        await fetch(`http://localhost:3000/api/equipo/${id}`, { method: "DELETE" });
        dispatch({ type: "ELIMINAR_MIEMBRO_EQUIPO", payload: id });
      } catch (err) { console.error(err); }
    },

    // -- Horarios --
    actualizarHorario: async (nuevosHorarios) => {
      try {
        await fetch("http://localhost:3000/api/horarios", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ horarios: nuevosHorarios }),
        });
        dispatch({ type: "SET_HORARIOS_DB", payload: nuevosHorarios });
      } catch (err) { console.error(err); }
    },

    // -- Agenda --
    agregarCita: async (c) => {
      try {
        const res = await fetch("http://localhost:3000/api/agenda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente_nombre: c.cliente_nombre,
            cliente_telefono: c.cliente_telefono || "",
            servicio: c.servicio,
            fecha: c.fecha,
            hora: c.hora,
            miembro_equipo_id: c.miembro_equipo_id
          }),
        });
        const data = await res.json();
        dispatch({ 
          type: "AGREGAR_CITA", 
          payload: {
            id: data.cita_id,
            cliente_nombre: data.cliente_nombre,
            cliente_telefono: data.cliente_telefono,
            fecha: new Date(data.fecha).toISOString().split("T")[0],
            hora: data.hora.substring(0, 5),
            estado: data.estado,
            miembro_equipo_id: data.miembro_equipo_id
          } 
        });
      } catch (err) { console.error(err); }
    },
    actualizarEstadoCita: async (id, estado) => {
      try {
        await fetch(`http://localhost:3000/api/agenda/${id}/estado`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado }),
        });
        // Refetch de la agenda para simplicidad o actualizar estado manual
        dispatch({ type: "SET_VISTA", payload: state.vistaActual }); // trigger re-render
      } catch (err) { console.error(err); }
    },
    eliminarCita: async (id) => {
      // MVP: En vez de eliminar, se suele cancelar. Pero si quieres delete hard... (asumimos cancelar via estado)
      dispatch({ type: "ELIMINAR_CITA", payload: id });
    },

    // -- Notificaciones --
    agregarNotificacion: (n) => dispatch({ type: "AGREGAR_NOTIFICACION", payload: n }),
    marcarLeida: async (id) => {
      // Para MVP, solo las marcamos globalmente o localmente
      dispatch({ type: "MARCAR_LEIDA", payload: id });
    },
    marcarTodasLeidas: async () => {
      try {
        await fetch("http://localhost:3000/api/notificaciones/marcar-leidas", { method: "PUT" });
        // Refetch the notifications is handled in context, or we can just clean them
        dispatch({ type: "LIMPIAR_NOTIFICACIONES" }); 
      } catch (err) { console.error(err); }
    },

    agregarPedido: (p) => dispatch({ type: "AGREGAR_PEDIDO", payload: p }),
    agregarPedidoPendiente: (p) => dispatch({ type: "AGREGAR_PEDIDO_PENDIENTE", payload: p }),
    validarPedidoPendiente: (data) => dispatch({ type: "VALIDAR_PEDIDO_PENDIENTE", payload: data }),
    resetApp: () => dispatch({ type: "RESET_APP" }),
  };
}
