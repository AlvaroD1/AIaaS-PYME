// src/context/NegocioContext.jsx
import { createContext, useContext, useReducer, useEffect } from "react";

const STORAGE_KEY = "aiaas_pyme_state";

const initialState = {
  onboardingCompleto: false,
  vistaActual: "onboarding",
  negocio: {
    nombre: "",
    ciudad: "",
    sector: "",
    tipoNegocio: "productos",
    subTipoSalud: "medico", // "medico", "dentista", "veterinaria" (solo si tipoNegocio === "salud")
  },
  agente: {
    nombre: "Asistente",
    tono: "informal",
    saludo: "¡Hola! ¿En qué te ayudo hoy?",
    faq: [],
  },
  inventario: [],
  equipo: [],
  agenda: [],
  horario: {
    lunes:    { activo: true,  apertura: "08:00", cierre: "18:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    martes:   { activo: true,  apertura: "08:00", cierre: "18:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    miercoles:{ activo: true,  apertura: "08:00", cierre: "18:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    jueves:   { activo: true,  apertura: "08:00", cierre: "18:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    viernes:  { activo: true,  apertura: "08:00", cierre: "18:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    sabado:   { activo: false, apertura: "09:00", cierre: "14:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
    domingo:  { activo: false, apertura: "09:00", cierre: "14:00", dobleJornada: false, apertura2: "14:00", cierre2: "18:00" },
  },
  suscripcion: "base",
  notificaciones: [],
  pedidos: [],
  pedidosPendientes: [],
  umbralStock: 10,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_PRODUCTOS_DB":
      return { ...state, inventario: action.payload };
    case "SET_EQUIPO_DB":
      return { ...state, equipo: action.payload };
    case "SET_HORARIOS_DB":
      return { ...state, horario: action.payload };
    case "SET_AGENDA_DB":
      return { ...state, agenda: action.payload };
    case "SET_NOTIFICACIONES_DB":
      return { ...state, notificaciones: action.payload };
    case "SET_VISTA":
      return { ...state, vistaActual: action.payload };
    case "COMPLETAR_ONBOARDING":
      return { ...state, onboardingCompleto: true, vistaActual: "dashboard", negocio: { ...state.negocio, ...action.payload } };
    case "SET_NEGOCIO":
      return { ...state, negocio: { ...state.negocio, ...action.payload } };
    case "SET_AGENTE":
      return { ...state, agente: { ...state.agente, ...action.payload } };
    case "SET_HORARIO":
      return { ...state, horario: { ...state.horario, ...action.payload } };
    case "SET_SUSCRIPCION":
      return { ...state, suscripcion: action.payload };
    case "SET_UMBRAL_STOCK":
      return { ...state, umbralStock: action.payload };
    case "AGREGAR_PRODUCTO":
      return { ...state, inventario: [...state.inventario, { ...action.payload, id: Date.now() }] };
    case "EDITAR_PRODUCTO":
      return { ...state, inventario: state.inventario.map(p => p.id === action.payload.id ? action.payload : p) };
    case "ELIMINAR_PRODUCTO":
      return { ...state, inventario: state.inventario.filter(p => p.id !== action.payload) };
    case "AGREGAR_MIEMBRO_EQUIPO":
      return { ...state, equipo: [...(state.equipo || []), { ...action.payload, id: Date.now() }] };
    case "ELIMINAR_MIEMBRO_EQUIPO":
      return { ...state, equipo: (state.equipo || []).filter(m => m.id !== action.payload) };
    case "AGREGAR_CITA":
      return { ...state, agenda: [...state.agenda, { ...action.payload, id: Date.now() }] };
    case "ELIMINAR_CITA":
      return { ...state, agenda: state.agenda.filter(c => c.id !== action.payload) };
    case "AGREGAR_NOTIFICACION":
      return { ...state, notificaciones: [{ ...action.payload, id: Date.now(), leida: false, fecha: new Date().toISOString() }, ...state.notificaciones] };
    case "MARCAR_LEIDA":
      return { ...state, notificaciones: state.notificaciones.map(n => n.id === action.payload ? { ...n, leida: true } : n) };
    case "LIMPIAR_NOTIFICACIONES":
      return { ...state, notificaciones: [] };
    case "AGREGAR_PEDIDO":
      return { ...state, pedidos: [{ ...action.payload, id: Date.now(), fecha: new Date().toISOString() }, ...(state.pedidos || [])] };
    case "AGREGAR_PEDIDO_PENDIENTE":
      return { ...state, pedidosPendientes: [{ ...action.payload, id: Date.now(), fecha: new Date().toISOString(), estado: "pendiente" }, ...(state.pedidosPendientes || [])] };
    case "VALIDAR_PEDIDO_PENDIENTE": {
      const { id, aprobado, motivoRechazo } = action.payload;
      const pendientes = (state.pedidosPendientes || []).map(p =>
        p.id === id ? { ...p, estado: aprobado ? "aprobado" : "rechazado", motivoRechazo: motivoRechazo || "", fechaValidacion: new Date().toISOString() } : p
      );
      const pedidoValidado = pendientes.find(p => p.id === id);
      const nuevosPedidos = aprobado && pedidoValidado
        ? [pedidoValidado, ...(state.pedidos || [])]
        : (state.pedidos || []);
      return { ...state, pedidosPendientes: pendientes, pedidos: nuevosPedidos };
    }
    case "RESET_APP":
      localStorage.removeItem(STORAGE_KEY);
      return { ...initialState };
    default:
      return state;
  }
}

const NegocioContext = createContext(null);

export function NegocioProvider({ children }) {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsedSaved = saved ? JSON.parse(saved) : null;

  // Merge saved state with initialState to fill in any missing keys (e.g. pedidos)
  const mergedState = parsedSaved ? { ...initialState, ...parsedSaved } : initialState;

  const [state, dispatch] = useReducer(reducer, mergedState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Cargar datos desde la base de datos PostgreSQL
  useEffect(() => {
    if (state.onboardingCompleto) {
      // 1. Productos
      fetch("http://localhost:3000/api/productos")
        .then(res => res.json())
        .then(data => {
          const formatted = data.map(dbProd => ({
            id: dbProd.producto_id,
            nombre: dbProd.nombre,
            desc: dbProd.descripcion || "",
            precio: parseFloat(dbProd.precio),
            stock: dbProd.stock_actual,
            fotoUrl: dbProd.foto_url || "",
          }));
          dispatch({ type: "SET_PRODUCTOS_DB", payload: formatted });
        })
        .catch(err => console.error("Error fetching products:", err));

      // 2. Equipo
      fetch("http://localhost:3000/api/equipo")
        .then(res => res.json())
        .then(data => {
          const formatted = data.map(m => ({
            id: m.miembro_id,
            nombre: m.nombre,
            especialidad: m.especialidad
          }));
          dispatch({ type: "SET_EQUIPO_DB", payload: formatted });
        })
        .catch(err => console.error("Error fetching equipo:", err));

      // 3. Horarios
      fetch("http://localhost:3000/api/horarios")
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const formatted = { ...initialState.horario };
            data.forEach(h => {
              formatted[h.dia_semana] = {
                activo: h.activo,
                apertura: h.apertura.substring(0, 5), // "08:00:00" -> "08:00"
                cierre: h.cierre.substring(0, 5),
                apertura2: h.apertura2 ? h.apertura2.substring(0, 5) : "14:00",
                cierre2: h.cierre2 ? h.cierre2.substring(0, 5) : "18:00",
                dobleJornada: h.apertura2 !== null
              };
            });
            dispatch({ type: "SET_HORARIOS_DB", payload: formatted });
          }
        })
        .catch(err => console.error("Error fetching horarios:", err));

      // 4. Agenda
      fetch("http://localhost:3000/api/agenda")
        .then(res => res.json())
        .then(data => {
          const formatted = data.map(c => ({
            id: c.cita_id,
            cliente_nombre: c.cliente_nombre,
            cliente_telefono: c.cliente_telefono,
            fecha: new Date(c.fecha).toISOString().split("T")[0],
            hora: c.hora.substring(0, 5),
            estado: c.estado,
            miembro_equipo_id: c.miembro_equipo_id
          }));
          dispatch({ type: "SET_AGENDA_DB", payload: formatted });
        })
        .catch(err => console.error("Error fetching agenda:", err));

      // 5. Notificaciones
      fetch("http://localhost:3000/api/notificaciones")
        .then(res => res.json())
        .then(data => {
          const formatted = data.map(n => ({
            id: n.alerta_id,
            tipo: n.tipo,
            mensaje: n.mensaje,
            fecha: new Date(n.fecha_creacion).toISOString(),
            leida: n.leida
          }));
          dispatch({ type: "SET_NOTIFICACIONES_DB", payload: formatted });
        })
        .catch(err => console.error("Error fetching notificaciones:", err));
    }
  }, [state.onboardingCompleto]);

  return (
    <NegocioContext.Provider value={{ state, dispatch }}>
      {children}
    </NegocioContext.Provider>
  );
}

export { NegocioContext };
