import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg font-body">
      {/* Overlay para móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar — visible siempre en desktop, drawer en móvil */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header móvil */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-white/10 flex-shrink-0">
          <h1 className="font-heading text-secondary text-lg font-bold tracking-wide">AIaaS PYME</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
