import { useState } from "react";

function App() {
  const [vistaActual, setVistaActual] = useState("dashboard");

  // --- ESTADOS DE CONFIGURACIÓN ---
  const [config, setConfig] = useState({
    nombre: "Mi Negocio Local",
    tipoNegocio: "ambos",
    modoHorario: "fijo",
    simularFueraHorario: false,
  });

  // --- ESTADOS DE INVENTARIO Y MODAL ---
  const [inventario, setInventario] = useState([
    {
      id: 1,
      nombre: "Corte Tradicional",
      desc: "Corte con tijera y máquina",
      img: "✂️",
      stock: 99,
      precio: 5,
    },
    {
      id: 2,
      nombre: "Cera para Cabello",
      desc: "Fijación fuerte mate",
      img: "🧴",
      stock: 8,
      precio: 12,
    },
    {
      id: 3,
      nombre: "Menú Ejecutivo",
      desc: "Almuerzo completo",
      img: "🍛",
      stock: 50,
      precio: 3.5,
    },
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    img: "📦",
    nombre: "",
    desc: "",
    precio: "",
    stock: "",
  });

  const agregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio) return;

    setInventario([
      ...inventario,
      {
        id: Date.now(),
        img: nuevoProducto.img || "📦",
        nombre: nuevoProducto.nombre,
        desc: nuevoProducto.desc,
        precio: parseFloat(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock) || 0,
      },
    ]);
    setMostrarModal(false);
    setNuevoProducto({
      img: "📦",
      nombre: "",
      desc: "",
      precio: "",
      stock: "",
    });
  };

  const [agenda, setAgenda] = useState([
    {
      id: 1,
      cliente: "Juan Pérez",
      fecha: "Hoy",
      hora: "15:00",
      servicio: "Corte",
    },
  ]);

  // --- ESTADOS DEL CHAT ---
  const [mensaje, setMensaje] = useState("");
  const [historial, setHistorial] = useState([
    { remitente: "bot", texto: "¡Hola! ¿En qué te ayudo hoy?" },
  ]);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    const nuevoHistorial = [
      ...historial,
      { remitente: "user", texto: mensaje },
    ];
    setHistorial(nuevoHistorial);
    setMensaje("");
    setCargando(true);

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: nuevoHistorial[nuevoHistorial.length - 1].texto,
          configuracion: config,
          inventario: inventario,
          agenda: agenda,
          fueraDeHorario: config.simularFueraHorario,
        }),
      });
      const data = await response.json();
      setHistorial((prev) => [
        ...prev,
        { remitente: "bot", texto: data.respuesta },
      ]);
    } catch (error) {
      setHistorial((prev) => [
        ...prev,
        { remitente: "bot", texto: "Error de conexión." },
      ]);
    } finally {
      setCargando(false);
    }
  };

  // --- ESTILOS MEJORADOS ---
  const cardStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    border: "1px solid #e2e8f0",
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    marginBottom: "20px",
    fontSize: "15px",
    backgroundColor: "#f8fafc",
    color: "#1e293b",
  };
  const labelStyle = {
    display: "block",
    fontWeight: "bold",
    color: "#334155",
    marginBottom: "8px",
    fontSize: "14px",
  };
  const navButtonStyle = (activo) => ({
    width: "100%",
    padding: "12px 15px",
    textAlign: "left",
    backgroundColor: activo ? "#1e3a8a" : "transparent",
    color: activo ? "white" : "#cbd5e1",
    border: activo ? "1px solid #3b82f6" : "1px solid transparent",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    fontWeight: "bold",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f4f7f6",
      }}
    >
      {/* --- MENÚ LATERAL MEJORADO --- */}
      <div
        style={{
          width: "260px",
          backgroundColor: "#0f172a",
          color: "white",
          padding: "25px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            color: "#38bdf8",
            marginBottom: "40px",
            textAlign: "center",
            fontSize: "24px",
            letterSpacing: "1px",
          }}
        >
          AIaaS PYME
        </h2>

        <button
          onClick={() => setVistaActual("dashboard")}
          style={navButtonStyle(vistaActual === "dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setVistaActual("config")}
          style={navButtonStyle(vistaActual === "config")}
        >
          ⚙️ Mi Negocio
        </button>

        {(config.tipoNegocio === "productos" ||
          config.tipoNegocio === "ambos" ||
          config.tipoNegocio === "comida") && (
          <button
            onClick={() => setVistaActual("inventario")}
            style={navButtonStyle(vistaActual === "inventario")}
          >
            📦 Inventario/Menú
          </button>
        )}

        {(config.tipoNegocio === "servicios" ||
          config.tipoNegocio === "ambos") && (
          <button
            onClick={() => setVistaActual("agenda")}
            style={navButtonStyle(vistaActual === "agenda")}
          >
            📅 Agenda
          </button>
        )}

        <div style={{ marginTop: "auto" }}>
          <button
            onClick={() => setVistaActual("simulador")}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(16,185,129,0.3)",
              transition: "background 0.2s",
            }}
          >
            📱 Probar Agente
          </button>
        </div>
      </div>

      {/* --- ÁREA PRINCIPAL --- */}
      <div style={{ flex: 1, padding: "40px 50px", overflowY: "auto" }}>
        {/* VISTA: DASHBOARD */}
        {vistaActual === "dashboard" && (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h1
              style={{
                color: "#0f172a",
                marginBottom: "30px",
                fontSize: "32px",
              }}
            >
              Resumen del Negocio
            </h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "25px",
                marginBottom: "40px",
              }}
            >
              <div style={{ ...cardStyle, borderTop: "4px solid #10b981" }}>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Ventas de la Semana
                </p>
                <h2
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "36px",
                    color: "#0f172a",
                  }}
                >
                  $425.50
                </h2>
              </div>
              <div style={{ ...cardStyle, borderTop: "4px solid #3b82f6" }}>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Consultas WhatsApp
                </p>
                <h2
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "36px",
                    color: "#0f172a",
                  }}
                >
                  128
                </h2>
              </div>
              <div style={{ ...cardStyle, borderTop: "4px solid #f59e0b" }}>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Citas Próximas
                </p>
                <h2
                  style={{
                    margin: "10px 0 0 0",
                    fontSize: "36px",
                    color: "#0f172a",
                  }}
                >
                  12
                </h2>
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                border: "1px solid #fecaca",
                backgroundColor: "#fff5f5",
              }}
            >
              <h3
                style={{
                  borderBottom: "1px solid #fecaca",
                  paddingBottom: "15px",
                  margin: "0 0 15px 0",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                ⚠️ Alertas de Stock Bajo (Menos de 10)
              </h3>
              {inventario
                .filter((item) => item.stock <= 10)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid #fecaca",
                    }}
                  >
                    <span style={{ color: "#450a0a", fontWeight: "500" }}>
                      {item.img} {item.nombre}
                    </span>
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>
                      Solo quedan {item.stock}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* VISTA: CONFIGURACIÓN */}
        {vistaActual === "config" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h1
              style={{
                color: "#0f172a",
                marginBottom: "30px",
                fontSize: "32px",
              }}
            >
              Configuración General
            </h1>

            <div style={cardStyle}>
              <label style={labelStyle}>¿Qué ofrece tu negocio?</label>
              <select
                style={inputStyle}
                value={config.tipoNegocio}
                onChange={(e) =>
                  setConfig({ ...config, tipoNegocio: e.target.value })
                }
              >
                <option value="productos">Solo Productos (Tienda)</option>
                <option value="servicios">
                  Solo Servicios (Barbería, Spa)
                </option>
                <option value="comida">Restaurante / Comida</option>
                <option value="ambos">Múltiples opciones</option>
              </select>

              <label style={labelStyle}>Horario de Atención</label>
              <select
                style={inputStyle}
                value={config.modoHorario}
                onChange={(e) =>
                  setConfig({ ...config, modoHorario: e.target.value })
                }
              >
                <option value="fijo">Jornada Fija (Ej. 08:00 a 18:00)</option>
                <option value="24_7">Atención 24/7</option>
              </select>

              {config.modoHorario === "fijo" && (
                <div
                  style={{
                    marginTop: "25px",
                    padding: "20px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fca5a5",
                    borderRadius: "10px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "14px",
                      color: "#991b1b",
                      lineHeight: "1.5",
                    }}
                  >
                    <strong>Demo:</strong> Activa esta opción para simular que
                    es de noche y mostrar cómo el agente gestiona a los clientes
                    fuera de horario.
                  </p>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      color: "#7f1d1d",
                      fontWeight: "bold",
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: "18px", height: "18px" }}
                      checked={config.simularFueraHorario}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          simularFueraHorario: e.target.checked,
                        })
                      }
                    />
                    Forzar estado "Fuera de Horario Laboral"
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: INVENTARIO */}
        {vistaActual === "inventario" && (
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h1 style={{ color: "#0f172a", margin: 0, fontSize: "32px" }}>
                Gestión de Productos
              </h1>
              <button
                onClick={() => setMostrarModal(true)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                + Agregar Producto
              </button>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                border: "1px solid #e2e8f0",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                }}
              >
                <thead
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <tr>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#475569",
                        fontSize: "14px",
                      }}
                    >
                      Producto
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#475569",
                        fontSize: "14px",
                      }}
                    >
                      Precio
                    </th>
                    <th
                      style={{
                        padding: "18px 20px",
                        color: "#475569",
                        fontSize: "14px",
                      }}
                    >
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((item) => (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "18px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <span style={{ fontSize: "28px" }}>{item.img}</span>
                        <div>
                          <strong
                            style={{
                              color: "#0f172a",
                              display: "block",
                              fontSize: "16px",
                            }}
                          >
                            {item.nombre}
                          </strong>
                          <span style={{ fontSize: "13px", color: "#64748b" }}>
                            {item.desc}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "18px 20px",
                          color: "#0f172a",
                          fontWeight: "600",
                        }}
                      >
                        ${item.precio.toFixed(2)}
                      </td>
                      <td style={{ padding: "18px 20px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            backgroundColor:
                              item.stock <= 10 ? "#fee2e2" : "#d1fae5",
                            color: item.stock <= 10 ? "#dc2626" : "#059669",
                          }}
                        >
                          {item.stock} unids
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL AGREGAR PRODUCTO */}
            {mostrarModal && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "15px",
                    width: "400px",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>
                    Nuevo Producto
                  </h3>
                  <form onSubmit={agregarProducto}>
                    <label style={labelStyle}>Nombre del Producto</label>
                    <input
                      style={inputStyle}
                      value={nuevoProducto.nombre}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          nombre: e.target.value,
                        })
                      }
                      placeholder="Ej. Hamburguesa doble"
                      required
                    />

                    <label style={labelStyle}>Descripción breve</label>
                    <input
                      style={inputStyle}
                      value={nuevoProducto.desc}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          desc: e.target.value,
                        })
                      }
                      placeholder="Ej. Con queso y tocino"
                    />

                    <div style={{ display: "flex", gap: "15px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Precio ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          style={inputStyle}
                          value={nuevoProducto.precio}
                          onChange={(e) =>
                            setNuevoProducto({
                              ...nuevoProducto,
                              precio: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Stock</label>
                        <input
                          type="number"
                          style={inputStyle}
                          value={nuevoProducto.stock}
                          onChange={(e) =>
                            setNuevoProducto({
                              ...nuevoProducto,
                              stock: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setMostrarModal(false)}
                        style={{
                          padding: "10px 15px",
                          border: "none",
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: "10px 15px",
                          border: "none",
                          backgroundColor: "#0f172a",
                          color: "white",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA: SIMULADOR DE CHAT */}
        {vistaActual === "simulador" && (
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "400px",
                height: "650px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#efeae2",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#075e54",
                  color: "white",
                  padding: "15px 20px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#075e54",
                    fontSize: "20px",
                  }}
                >
                  🤖
                </div>
                <div>
                  <div style={{ fontSize: "16px" }}>Simulador WhatsApp</div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "normal",
                      opacity: 0.9,
                    }}
                  >
                    Escribe como cliente...
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {historial.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      alignSelf:
                        msg.remitente === "user" ? "flex-end" : "flex-start",
                      backgroundColor:
                        msg.remitente === "user" ? "#dcf8c6" : "white",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      maxWidth: "85%",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      fontSize: "15px",
                      lineHeight: "1.4",
                      color: "#111b21",
                    }}
                  >
                    {msg.texto}
                  </div>
                ))}
                {cargando && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: "white",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      color: "#667781",
                      fontStyle: "italic",
                      fontSize: "14px",
                    }}
                  >
                    Escribiendo...
                  </div>
                )}
              </div>

              <form
                onSubmit={enviarMensaje}
                style={{
                  display: "flex",
                  padding: "15px",
                  backgroundColor: "#f0f0f0",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    borderRadius: "24px",
                    border: "none",
                    outline: "none",
                    fontSize: "15px",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "24px",
                    backgroundColor: "#00a884",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "15px",
                  }}
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
