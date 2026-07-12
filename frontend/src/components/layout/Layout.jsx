import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";
import { useNegocio } from "../../hooks/useNegocio";

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useNegocio();
  const nombreNegocio = state.negocio.nombre || "Mi Negocio";

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg font-body flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-sidebar text-white p-4 flex items-center justify-between shadow-md z-40">
        <div className="overflow-hidden mr-4">
          <h1 className="font-heading text-white text-lg font-bold truncate">
            {nombreNegocio}
          </h1>
          <p className="text-secondary/70 text-[10px] uppercase font-medium tracking-wider mt-0.5">
            powered by AIaaS PYME
          </p>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 cursor-pointer flex-shrink-0">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
        {children}
      </main>
    </div>
  );
}
