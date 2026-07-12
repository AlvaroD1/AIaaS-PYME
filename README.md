# AIaaS PYME

Plataforma SaaS de agentes de inteligencia artificial para pequenas y medianas empresas ecuatorianas. Permite a un dueno de negocio, sin conocimientos tecnicos, configurar un agente de IA que atiende clientes por WhatsApp, gestiona inventario, agenda citas y genera reportes operativos basicos, todo desde un panel sin necesidad de escribir codigo.

El proyecto nace de un taller de Emprendimiento de Base Tecnologica (UTPL), a partir de un proceso de Design Thinking: entrevistas de empatia con tres usuarios reales, definicion de requerimientos formales y construccion de un backlog priorizado que guia el desarrollo del MVP.

## Problema y propuesta

Las PYMEs ecuatorianas dedican entre 4 y 8 horas semanales a tareas repetitivas de gestion (atencion al cliente, facturacion, control de inventario, generacion de reportes) que podrian automatizarse. La mayoria no tiene acceso real a herramientas de IA porque las soluciones enterprise cuestan mas de 50000 USD en implementacion y requieren equipos tecnicos especializados.

AIaaS PYME es una plataforma de IA como servicio que implementa agentes operativos para duenos de PYMEs sin conocimientos tecnicos, con plantillas preconfiguradas por rubro, integracion con WhatsApp Business, onboarding guiado en menos de 30 minutos y un modelo de suscripcion mensual accesible.

## Estado del proyecto

Este repositorio contiene un MVP funcional en etapa de prototipo. El backlog completo, con el estado real de cada requisito (completado, parcial o pendiente) y su evidencia en el codigo, esta documentado en [docs/backlog.csv](docs/backlog.csv).

## Estructura del repositorio

```
AIaaS-PYME/
  backend/            API Express que conecta el agente con Gemini
  frontend/            Aplicacion React (Vite + Tailwind)
  design-system/      Especificacion de diseno del producto
  docs/                Backlog, especificaciones y planes de desarrollo
```

## Requisitos previos

- Node.js 18 o superior
- Una clave de API de Google Gemini (https://aistudio.google.com/apikey)

## Instalacion y ejecucion

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env y agregar GEMINI_API_KEY
npm start
```

El servidor corre por defecto en `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicacion corre por defecto en `http://localhost:5173`.

## Funcionalidades principales

- Onboarding guiado para registrar el negocio y activar el primer agente.
- Configuracion del agente sin codigo: nombre, avatar, tono de comunicacion y mensaje de saludo.
- Modulo de preguntas frecuentes que el agente usa como base de conocimiento.
- Gestion de inventario con alertas automaticas de stock bajo.
- Simulador de conversacion conectado en vivo a Gemini, con reglas de negocio configurables (horario de atencion, disponibilidad de stock, pedidos grandes).
- Panel de suscripcion con planes y periodos de facturacion (mensual, trimestral, anual).
- Interfaz responsive con navegacion adaptada a dispositivos moviles.

## Stack tecnico

- Frontend: React, Vite, Tailwind CSS, Recharts, Lucide Icons
- Backend: Node.js, Express, Google Generative AI SDK (Gemini)
- Persistencia: estado local del navegador (localStorage) en esta etapa de prototipo

## Documentacion adicional

- [docs/backlog.csv](docs/backlog.csv): backlog completo con estado y evidencia por requisito
