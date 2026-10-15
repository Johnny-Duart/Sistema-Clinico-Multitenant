import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaHeartbeat,
  FaTooth,
  FaHospital,
  FaFilter,
} from "react-icons/fa";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clinicaFiltroAdmin, setClinicaFiltroAdmin] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagemAcao, setMensagemAcao] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  async function carregarDados(filtroSlug = clinicaFiltroAdmin) {
    try {
      setCarregando(true);
      const urlAgendamentos = filtroSlug
        ? `agendamentos/?clinica=${filtroSlug}`
        : "agendamentos/";
      const urlPacientes = filtroSlug
        ? `pacientes/?clinica=${filtroSlug}`
        : "pacientes/";

      const [resMe, resPacientes, resAgendamentos] = await Promise.all([
        api.get("usuarios/me/"),
        api.get(urlPacientes),
        api.get(urlAgendamentos),
      ]);
      setUsuario(resMe.data);
      setPacientes(resPacientes.data);
      setAgendamentos(resAgendamentos.data);
      setErro("");
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setErro("Não foi possível carregar os dados. Verifique a conexão com o backend.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [clinicaFiltroAdmin]);

  async function handleMudarStatus(id, novoStatus) {
    try {
      await api.patch(`agendamentos/${id}/status/`, { status: novoStatus });
      setMensagemAcao(`Status atualizado para "${novoStatus}" com sucesso!`);
      setTimeout(() => setMensagemAcao(""), 3500);
      carregarDados();
    } catch (err) {
      console.error("Erro ao mudar status:", err);
      alert("Não foi possível atualizar o status.");
    }
  }

  const hojeStr = new Date().toLocaleDateString("pt-BR");

  const agendamentosHoje = agendamentos.filter(
    (a) => new Date(a.data_hora).toLocaleDateString("pt-BR") === hojeStr
  );

  const cards = [
    { titulo: "Pacientes Hoje", valor: agendamentosHoje.length, cor: "#2563eb" },
    {
      titulo: "Em Espera",
      valor: agendamentosHoje.filter(
        (a) => a.status === "agendado" || a.status === "confirmado"
      ).length,
      cor: "#d97706",
    },
    {
      titulo: "Atendidos Hoje",
      valor: agendamentosHoje.filter((a) => a.status === "realizado").length,
      cor: "#16a34a",
    },
    { titulo: "Total na Base", valor: agendamentos.length, cor: "#4f46e5" },
  ];

  const fila = agendamentosHoje
    .filter((a) => a.status === "agendado" || a.status === "confirmado")
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  const clinicaSlug = usuario?.clinica_detalhes?.slug;
  const isDermato = clinicaSlug === "dermato";
  const isOdonto = clinicaSlug === "odonto";
  const isAdmin = usuario?.role === "admin";

  return (
    <div>
      <Sidebar />
      <div style={styles.container(isMobile)}>
        <main style={styles.main(isMobile)}>
          {/* Header */}
          <div style={styles.header(isMobile)}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={styles.title}>Dashboard Clínico</h1>
                {isDermato && (
                  <span style={{ ...styles.badgeClinica, background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}>
                    <FaHeartbeat /> Dermatologia Integrada
                  </span>
                )}
                {isOdonto && (
                  <span style={{ ...styles.badgeClinica, background: "#dcfce7", color: "#15803d", borderColor: "#bbf7d0" }}>
                    <FaTooth /> Odontologia & Estética
                  </span>
                )}
                {isAdmin && (
                  <span style={{ ...styles.badgeClinica, background: "#dbeafe", color: "#1d4ed8", borderColor: "#bfdbfe" }}>
                    <FaHospital /> Painel Master Multi-Clínica
                  </span>
                )}
              </div>
              <p style={styles.subtitle}>
                Acompanhamento em tempo real dos atendimentos e consultas
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {isAdmin && (
                <div style={styles.filterBox}>
                  <FaFilter color="#64748b" size={12} />
                  <select
                    value={clinicaFiltroAdmin}
                    onChange={(e) => setClinicaFiltroAdmin(e.target.value)}
                    style={styles.selectFilter}
                  >
                    <option value="">Todas as Clínicas</option>
                    <option value="dermato">Apenas Dermatologia</option>
                    <option value="odonto">Apenas Odontologia</option>
                  </select>
                </div>
              )}

              <div style={styles.userBox}>
                <FaUserCircle size={26} color="#2563eb" />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700" }}>
                    {usuario?.nome_completo || "Carregando..."}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", textTransform: "capitalize" }}>
                    {usuario?.role || "Acesso"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {mensagemAcao && (
            <div style={styles.alertSuccess}>{mensagemAcao}</div>
          )}

          {erro && <p style={{ color: "#b91c1c", marginBottom: 20 }}>{erro}</p>}

          {/* Cards Métricas */}
          <div style={styles.cardsContainer}>
            {cards.map((card, index) => (
              <div key={index} style={styles.card}>
                <h4 style={{ margin: "0 0 10px", color: "#64748b", fontSize: "14px" }}>
                  {card.titulo}
                </h4>
                <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: card.cor }}>
                  {carregando ? "..." : card.valor}
                </h2>
              </div>
            ))}
          </div>

          {/* Tabela de Fila de Espera */}
          <div style={styles.tableCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h2 style={styles.sectionTitle}>Fila de Atendimento de Hoje</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  Pacientes aguardando ou confirmados na recepção
                </p>
              </div>
              <span style={styles.hojeBadge}>{hojeStr}</span>
            </div>

            {carregando ? (
              <p style={{ color: "#64748b", padding: "20px 0" }}>Carregando dados da recepção...</p>
            ) : fila.length === 0 ? (
              <div style={styles.emptyFila}>
                Nenhum paciente aguardando atendimento para hoje nesta unidade.
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Horário</th>
                      <th style={styles.th}>Paciente</th>
                      <th style={styles.th}>Clínica</th>
                      <th style={styles.th}>Contato</th>
                      <th style={styles.th}>Status</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Ações da Recepção / Médico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fila.map((ag) => {
                      const hora = new Date(ag.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr key={ag.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                            {hora}
                          </td>
                          <td style={{ ...styles.td, fontWeight: "600" }}>
                            {ag.paciente_nome}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.miniBadgeClinica}>
                              {ag.clinica_nome}
                            </span>
                          </td>
                          <td style={{ ...styles.td, color: "#64748b" }}>
                            {ag.paciente_telefone || ag.paciente_cpf || "-"}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                ...styles.status,
                                background:
                                  ag.status === "agendado" ? "#fef3c7" : "#dcfce7",
                                color:
                                  ag.status === "agendado" ? "#92400e" : "#166534",
                              }}
                            >
                              {ag.status === "agendado" ? "Aguardando" : "Presente"}
                            </span>
                          </td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "8px" }}>
                              {ag.status === "agendado" && (
                                <button
                                  onClick={() => handleMudarStatus(ag.id, "confirmado")}
                                  style={styles.btnActionCheckin}
                                  title="Marcar presença na recepção"
                                >
                                  <FaUserCheck size={12} /> Confirmar Chegada
                                </button>
                              )}
                              <button
                                onClick={() => handleMudarStatus(ag.id, "realizado")}
                                style={styles.btnActionConcluir}
                                title="Concluir consulta realizada"
                              >
                                <FaCheck size={12} /> Atender / Concluir
                              </button>
                              <button
                                onClick={() => handleMudarStatus(ag.id, "cancelado")}
                                style={styles.btnActionCancelar}
                                title="Cancelar agendamento"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "Segoe UI, sans-serif",
    paddingLeft: isMobile ? 0 : "260px",
    boxSizing: "border-box",
  }),
  main: (isMobile) => ({
    flex: 1,
    padding: isMobile ? "16px" : "32px",
    width: "100%",
    boxSizing: "border-box",
  }),
  header: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    gap: "16px",
    marginBottom: "28px",
  }),
  title: { margin: 0, fontSize: "28px", color: "#0f172a", fontWeight: "800" },
  subtitle: { color: "#64748b", margin: "6px 0 0", fontSize: "14px" },
  badgeClinica: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid",
  },
  filterBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#ffffff",
    padding: "8px 12px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
  },
  selectFilter: {
    border: "none",
    background: "transparent",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    outline: "none",
    cursor: "pointer",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    padding: "8px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  alertSuccess: {
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: "600",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
    border: "1px solid #e2e8f0",
  },
  tableCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "18px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: { margin: "0 0 4px", fontSize: "18px", color: "#0f172a", fontWeight: "700" },
  hojeBadge: {
    padding: "4px 12px",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
  },
  emptyFila: {
    padding: "36px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    background: "#f8fafc",
    borderRadius: "12px",
    marginTop: "12px",
  },
  tableWrap: {
    overflowX: "auto",
    marginTop: "12px",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "600px" },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    borderBottom: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.15s ease",
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: "#334155",
  },
  miniBadgeClinica: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
  },
  status: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },
  btnActionCheckin: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnActionConcluir: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnActionCancelar: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "12px",
    cursor: "pointer",
  },
};

export default Dashboard;