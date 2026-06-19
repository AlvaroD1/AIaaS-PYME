// src/components/ui/ConfirmDialog.jsx
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message, confirmLabel = "Eliminar" }) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="" maxWidth="max-w-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h3 className="font-heading font-semibold text-primary-dark text-lg mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
