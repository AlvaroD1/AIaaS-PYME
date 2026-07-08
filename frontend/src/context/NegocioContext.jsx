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
  },
  agente: {
    nombre: "Asistente",
    avatar: "🤖",
    tono: "informal",
    saludo: "¡Hola! ¿En qué te ayudo hoy?",
    faq: [],
  },
  inventario: [],
  agenda: [],
  horario: {
    lunes:    { activo: true,  apertura: "08:00", cierre: "18:00" },
    martes:   { activo: true,  apertura: "08:00", cierre: "18:00" },
    miercoles:{ activo: true,  apertura: "08:00", cierre: "18:00" },
    jueves:   { activo: true,  apertura: "08:00", cierre: "18:00" },
    viernes:  { activo: true,  apertura: "08:00", cierre: "18:00" },
    sabado:   { activo: false, apertura: "09:00", cierre: "14:00" },
    domingo:  { activo: false, apertura: "09:00", cierre: "14:00" },
  },
  suscripcion: "base",
  notificaciones: [],
  umbralStock: 10,
};

function reducer(state, action) {
  switch (action.type) {
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
    default:
      return state;
  }
}

const NegocioContext = createContext(null);

export function NegocioProvider({ children }) {
  const saved = localStorage.getItem(STORAGE_KEY);
  const parsedSaved = saved ? JSON.parse(saved) : null;

  const [state, dispatch] = useReducer(reducer, parsedSaved || initialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <NegocioContext.Provider value={{ state, dispatch }}>
      {children}
    </NegocioContext.Provider>
  );
}

export { NegocioContext };
