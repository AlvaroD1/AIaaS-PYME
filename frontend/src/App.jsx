import { useNegocio } from "./hooks/useNegocio";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Inventario } from "./components/inventario/Inventario";
import { Agenda } from "./components/agenda/Agenda";
import { Horario } from "./components/horario/Horario";
import { MiNegocio } from "./components/config/MiNegocio";
import { Suscripcion } from "./components/suscripcion/Suscripcion";
import { Simulador } from "./components/simulador/Simulador";
import { NotificacionesPanel } from "./components/notificaciones/NotificacionesPanel";

const VISTAS = {
  dashboard: Dashboard,
  inventario: Inventario,
  agenda: Agenda,
  horario: Horario,
  config: MiNegocio,
  suscripcion: Suscripcion,
  simulador: Simulador,
  notificaciones: NotificacionesPanel,
};

function App() {
  const { state } = useNegocio();

  if (!state.onboardingCompleto) {
    return <OnboardingWizard />;
  }

  const VistaActual = VISTAS[state.vistaActual] || Dashboard;

  return (
    <Layout>
      <VistaActual />
    </Layout>
  );
}

export default App;
