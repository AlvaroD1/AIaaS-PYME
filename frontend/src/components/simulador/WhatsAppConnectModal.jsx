// src/components/simulador/WhatsAppConnectModal.jsx
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { QrCode, ExternalLink } from "lucide-react";

export function WhatsAppConnectModal({ isOpen, onClose, negocioNombre }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conectar WhatsApp Business">
      <div className="space-y-5">
        <div className="bg-muted rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 bg-white border-2 border-border rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode size={32} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-dark">Código QR disponible próximamente</p>
            <p className="text-xs text-gray-400 mt-1">La integración real con WhatsApp Business API estará disponible cuando el backend esté listo.</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-semibold text-primary-dark">Pasos para conectar:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-gray-500">
            <li>Crea una cuenta en Meta for Developers</li>
            <li>Configura un número de WhatsApp Business</li>
            <li>Obtén tu token de acceso y Phone Number ID</li>
            <li>Agrégalos al archivo .env del backend</li>
            <li>Regresa aquí y escanea el código QR</li>
          </ol>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => window.open("https://developers.facebook.com/docs/whatsapp", "_blank")}
        >
          <ExternalLink size={14} /> Ver documentación Meta
        </Button>

        <Button onClick={onClose} className="w-full">Entendido</Button>
      </div>
    </Modal>
  );
}
