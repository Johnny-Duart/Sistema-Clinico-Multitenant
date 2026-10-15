import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaSignOutAlt,
  FaPlus,
  FaClock,
  FaCalendarAlt,
  FaTimes,
  FaHospital,
  FaUserCircle,
  FaSpinner,
} from "react-icons/fa";
import api from "../api/axios";
import AgendamentoModal from "../components/AgendamentoModal";

export default function PortalPaciente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    try {
      setCarregando(true);
      const [resMe, resAgendamentos] = await Promise.all([
        api.get("usuarios/me/"),
        api.get("agendamentos/meus/"),
      ]);
      setUsuario(resMe.data);
      setAgendamentos(resAgendamentos.data);
    } catch (err) {
      console.error("Erro ao carregar dados do paciente:", err);
      // Se deu 401 ou erro de auth, redireciona
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleCancelar(id) {
    if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;

    setCancelandoId(id);
    try {
      await api.post(`agendamentos/${id}/cancelar/`);
      setMensagem("Agendamento cancelado com sucesso.");
      carregarDados();
    } catch (err) {
      console.error("Erro ao cancelar:", err);
      alert("Não foi possível cancelar o agendamento.");
    } finally {
      setCancelandoId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario_logado");
    navigate("/login");
  }

  const statusLabels = {
    agendado: { texto: "Agendado", bg: "#fef3c7", cor: "#92400e" },
    confirmado: { texto: "Confirmado", bg: "#dcfce7", cor: "#166534" },
    realizado: { texto: "Realizado", bg: "#e0f2fe", cor: "#075985" },
    cancelado: { texto: "Cancelado", bg: "#fee2e2", cor: "#991b1b" },
  };

  return (
    <div style={styles.page}>
      {/* Topo do Portal */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.avatar}>
              <FaHospital size={22} color="#2563eb" />
            </div>
            <div>
              <h1 style={styles.headerTitle}>Portal do Paciente</h1>
              <p style={styles.headerSub}>
                Olá, {usuario?.nome_completo || "Paciente"}! Acompanhe suas consultas
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => setModalNovoAberto(true)}
              style={styles.btnNovo}
            >
              <FaPlus size={12} /> Agendar Nova Consulta
            </button>
            <button onClick={handleLogout} style={styles.btnLogout}>
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main style={styles.container}>
        {mensagem && (
          <div style={styles.alertSuccess}>
            {mensagem}
            <button
              onClick={() => setMensagem("")}
              style={{ background: "transparent", border: "none", cursor: "pointer", float: "right" }}
            >
              ×
            </button>
          </div>
        )}

        <div style={styles.cardSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Meus Agendamentos</h2>
              <p style={styles.sectionSub}>Histórico e consultas confirmadas</p>
            </div>
          </div>

          {carregando ? (
            <div style={styles.loadingBox}>
              <FaSpinner className="spin" size={24} color="#2563eb" />
              <p>Carregando seus agendamentos...</p>
            </div>
          ) : agendamentos.length === 0 ? (
            <div style={styles.emptyBox}>
              <FaCalendarCheck size={48} color="#cbd5e1" />
              <h3 style={{ margin: "16px 0 8px", color: "#334155" }}>
                Você ainda não tem agendamentos
              </h3>
              <p style={{ color: "#64748b", margin: "0 0 20px" }}>
                Escolha uma data e horário conveniente para sua consulta médica ou odontológica.
              </p>
              <button
                onClick={() => setModalNovoAberto(true)}
                style={styles.btnNovo}
              >
                <FaPlus size={12} /> Agendar Consulta Agora
              </button>
            </div>
          ) : (
            <div style={styles.gridCards}>
              {agendamentos.map((ag) => {
                const dt = new Date(ag.data_hora);
                const infoStatus = statusLabels[ag.status] || {
                  texto: ag.status,
                  bg: "#f1f5f9",
                  cor: "#475569",
                };
                const podeCancelar = ag.status === "agendado" || ag.status === "confirmado";

                return (
                  <div key={ag.id} style={styles.agCard}>
                    <div style={styles.cardHeader}>
                      <div>
                        <span style={styles.clinicaBadge}>
                          {ag.clinica_nome || "Clínica"}
                        </span>
                        <h3 style={styles.agTitulo}>
                          Consulta {ag.clinica_slug === "odonto" ? "Odontológica" : "Dermatológica"}
                        </h3>
                      </div>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: infoStatus.bg,
                          color: infoStatus.cor,
                        }}
                      >
                        {infoStatus.texto}
                      </span>
                    </div>

                    <div style={styles.agDetails}>
                      <div style={styles.detailRow}>
                        <FaCalendarAlt color="#2563eb" />
                        <span>
                          {dt.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div style={styles.detailRow}>
                        <FaClock color="#2563eb" />
                        <span>
                          {dt.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({ag.duracao_minutos} min)
                        </span>
                      </div>
                    </div>

                    {podeCancelar && (
                      <div style={styles.cardFooter}>
                        <button
                          onClick={() => handleCancelar(ag.id)}
                          disabled={cancelandoId === ag.id}
                          style={styles.btnCancelar}
                        >
                          {cancelandoId === ag.id ? "Cancelando..." : "Cancelar Consulta"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AgendamentoModal
        isOpen={modalNovoAberto}
        onClose={() => {
          setModalNovoAberto(false);
          carregarDados();
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "Segoe UI, sans-serif",
    color: "#0f172a",
  },
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "16px 24px",
    position: "sticky",
    top: 0,
    zIndex: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  headerContent: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSub: {
    margin: 0,
    fontSize: "13px",
    color: "#64748b",
  },
  btnNovo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
  },
  btnLogout: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1100px",
    margin: "32px auto",
    padding: "0 20px",
  },
  alertSuccess: {
    padding: "14px 18px",
    borderRadius: "12px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    marginBottom: "20px",
    fontWeight: "600",
  },
  cardSection: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f1f5f9",
  },
  sectionTitle: {
    margin: "0 0 4px",
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionSub: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  agCard: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  clinicaBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  agTitulo: {
    margin: "4px 0 0",
    fontSize: "18px",
    color: "#0f172a",
    fontWeight: "700",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  agDetails: {
    display: "grid",
    gap: "10px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#334155",
    fontWeight: "500",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
  btnCancelar: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #fca5a5",
    background: "#fff",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  loadingBox: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
  emptyBox: {
    textAlign: "center",
    padding: "48px 20px",
  },
};
