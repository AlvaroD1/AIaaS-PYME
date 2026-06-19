import { Sidebar } from "./Sidebar";

export function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-app-bg font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
