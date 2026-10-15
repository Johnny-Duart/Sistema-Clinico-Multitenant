import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaPlus,
  FaCheck,
  FaTimes,
  FaUserCheck,
  FaClock,
  FaSpinner,
  FaList,
  FaFilter,
} from "react-icons/fa";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

function formatarDataBR(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 8);
  const partes = [];
  if (digits.length > 0) partes.push(digits.slice(0, 2));
  if (digits.length > 2) partes.push(digits.slice(2, 4));
  if (digits.length > 4) partes.push(digits.slice(4, 8));
  return partes.join("/");
}

function formatarHora24(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + ":" + digits.slice(2, 4);
}

function horaValida(horaBR) {
  const m = /^(\d{2}):(\d{2})$/.exec(horaBR);
  if (!m) return false;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  return h >= 0 && h <= 23 && min >= 0 && min <= 59;
}

function converterParaISO(dataBR, horaBR) {
  const [dia, mes, ano] = dataBR.split("/");
  if (!dia || !mes || !ano || ano.length !== 4) return null;
  if (!horaValida(horaBR)) return null;
  return `${ano}-${mes}-${dia}T${horaBR}:00`;
}

function Agendamentos() {
  const [abaAtiva, setAbaAtiva] = useState("lista"); // 'lista' ou 'novo'
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  // Form states
  const [pacienteId, setPacienteId] = useState("");
  const [dataBR, setDataBR] = useState("");
  const [horaBR, setHoraBR] = useState("");
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  async function carregarDados() {
    setCarregando(true);
    try {
      let url = "agendamentos/?";
      if (filtroStatus) url += `status=${filtroStatus}&`;
      if (filtroData) url += `data=${filtroData}&`;

      const [resAg, resPac] = await Promise.all([
        api.get(url),
        api.get("pacientes/"),
      ]);
      setAgendamentos(resAg.data);
      setPacientes(resPac.data);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [filtroStatus, filtroData]);

  async function handleMudarStatus(id, novoStatus) {
    try {
      await api.patch(`agendamentos/${id}/status/`, { status: novoStatus });
      setMensagem(`Status alterado para "${novoStatus}"`);
      setTimeout(() => setMensagem(""), 3500);
      carregarDados();
    } catch (err) {
      console.error("Erro ao mudar status:", err);
      alert("Não foi possível atualizar o status.");
    }
  }

  async function handleCriarAgendamento(e) {
    e.preventDefault();
    setMensagem("");

    const dataHoraISO = converterParaISO(dataBR, horaBR);
    if (!dataHoraISO) {
      alert("Informe uma data (DD/MM/AAAA) e hora (HH:MM) válidas.");
      return;
    }

    setSalvando(true);
    try {
      await api.post("agendamentos/", {
        paciente: pacienteId,
        data_hora: dataHoraISO,
        valor: valor ? parseFloat(valor) : null,
      });
      setMensagem("Agendamento cadastrado com sucesso!");
      setPacienteId("");
      setDataBR("");
      setHoraBR("");
      setValor("");
      setAbaAtiva("lista");
      carregarDados();
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
      const erroMsg = err.response?.data ? Object.values(err.response.data)[0] : "Erro ao criar agendamento.";
      alert(`Erro: ${erroMsg}`);
    } finally {
      setSalvando(false);
    }
  }

  const statusBadge = {
    agendado: { label: "Agendado", bg: "#fef3c7", cor: "#92400e" },
    confirmado: { label: "Confirmado", bg: "#dcfce7", cor: "#166534" },
    realizado: { label: "Realizado", bg: "#e0f2fe", cor: "#075985" },
    cancelado: { label: "Cancelado", bg: "#fee2e2", cor: "#991b1b" },
  };

  return (
    <div>
      <Sidebar />
      <div style={styles.container(isMobile)}>
        <main style={styles.main(isMobile)}>
          {/* Header */}
          <div style={styles.header(isMobile)}>
            <div>
              <h1 style={styles.title}>Gestão de Agendamentos</h1>
              <p style={styles.subtitle}>
                Controle completo da agenda médica e odontológica
              </p>
            </div>

            <div style={styles.tabButtons}>
              <button
                onClick={() => setAbaAtiva("lista")}
                style={{
                  ...styles.tabBtn,
                  ...(abaAtiva === "lista" ? styles.tabBtnActive : {}),
                }}
              >
                <FaList /> Ver Agenda
              </button>
              <button
                onClick={() => setAbaAtiva("novo")}
                style={{
                  ...styles.tabBtn,
                  ...(abaAtiva === "novo" ? styles.tabBtnActive : {}),
                }}
              >
                <FaPlus /> Novo Horário
              </button>
            </div>
          </div>

          {mensagem && <div style={styles.alertSuccess}>{mensagem}</div>}

          {abaAtiva === "lista" ? (
            <div>
              {/* Filtros */}
              <div style={styles.filterBar}>
                <div style={styles.filterGroup}>
                  <FaFilter color="#64748b" size={13} />
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>Filtros:</span>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Status:</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Todos os status</option>
                    <option value="agendado">Apenas Agendados</option>
                    <option value="confirmado">Apenas Confirmados</option>
                    <option value="realizado">Apenas Realizados</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Data específica:</label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    style={styles.dateInput}
                  />
                  {filtroData && (
                    <button
                      onClick={() => setFiltroData("")}
                      style={styles.btnClearDate}
                      title="Limpar filtro de data"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Tabela de Agendamentos */}
              <div style={styles.card}>
                {carregando ? (
                  <div style={styles.loadingBox}>
                    <FaSpinner className="spin" size={24} color="#2563eb" />
                    <p>Consultando horários agendados...</p>
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div style={styles.emptyBox}>
                    <FaCalendarAlt size={44} color="#cbd5e1" />
                    <h3 style={{ margin: "14px 0 6px", color: "#334155" }}>
                      Nenhum agendamento encontrado
                    </h3>
                    <p style={{ color: "#64748b", margin: 0 }}>
                      Tente ajustar os filtros ou cadastre um novo agendamento.
                    </p>
                  </div>
                ) : (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Data e Horário</th>
                          <th style={styles.th}>Paciente</th>
                          <th style={styles.th}>Clínica</th>
                          <th style={styles.th}>Duração</th>
                          <th style={styles.th}>Valor</th>
                          <th style={styles.th}>Status</th>
                          <th style={{ ...styles.th, textAlign: "right" }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agendamentos.map((ag) => {
                          const dt = new Date(ag.data_hora);
                          const st = statusBadge[ag.status] || {
                            label: ag.status,
                            bg: "#f1f5f9",
                            cor: "#475569",
                          };

                          return (
                            <tr key={ag.id} style={styles.tr}>
                              <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                                {dt.toLocaleDateString("pt-BR")} às{" "}
                                {dt.toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td style={{ ...styles.td, fontWeight: "600" }}>
                                {ag.paciente_nome}
                              </td>
                              <td style={styles.td}>
                                <span style={styles.clinicaBadge}>
                                  {ag.clinica_nome}
                                </span>
                              </td>
                              <td style={{ ...styles.td, color: "#64748b" }}>
                                {ag.duracao_minutos} min
                              </td>
                              <td style={{ ...styles.td, color: "#0f172a", fontWeight: "600" }}>
                                {ag.valor ? `R$ ${parseFloat(ag.valor).toFixed(2)}` : "-"}
                              </td>
                              <td style={styles.td}>
                                <span
                                  style={{
                                    ...styles.statusTag,
                                    background: st.bg,
                                    color: st.cor,
                                  }}
                                >
                                  {st.label}
                                </span>
                              </td>
                              <td style={{ ...styles.td, textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                  {ag.status === "agendado" && (
                                    <button
                                      onClick={() => handleMudarStatus(ag.id, "confirmado")}
                                      style={styles.btnActionConfirmar}
                                      title="Confirmar presença"
                                    >
                                      <FaUserCheck size={12} /> Confirmar
                                    </button>
                                  )}
                                  {ag.status !== "realizado" && ag.status !== "cancelado" && (
                                    <button
                                      onClick={() => handleMudarStatus(ag.id, "realizado")}
                                      style={styles.btnActionRealizar}
                                      title="Concluir atendimento"
                                    >
                                      <FaCheck size={12} /> Concluir
                                    </button>
                                  )}
                                  {ag.status !== "cancelado" && (
                                    <button
                                      onClick={() => handleMudarStatus(ag.id, "cancelado")}
                                      style={styles.btnActionCancelar}
                                      title="Cancelar"
                                    >
                                      <FaTimes size={12} />
                                    </button>
                                  )}
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
            </div>
          ) : (
            /* Formulário de Novo Agendamento */
            <div style={styles.formCard}>
              <h2 style={{ margin: "0 0 8px", fontSize: "20px", color: "#0f172a" }}>
                Cadastrar Agendamento Manual
              </h2>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>
                Marque uma consulta diretamente para um paciente já cadastrado
              </p>

              <form onSubmit={handleCriarAgendamento} style={styles.form}>
                <div>
                  <label style={styles.label}>Paciente *</label>
                  <select
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    style={styles.input}
                    required
                  >
                    <option value="">Selecione um paciente cadastrado</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} (CPF: {p.cpf})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={styles.label}>Data (DD/MM/AAAA) *</label>
                    <input
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={dataBR}
                      onChange={(e) => setDataBR(formatarDataBR(e.target.value))}
                      maxLength={10}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Horário (HH:MM) *</label>
                    <input
                      type="text"
                      placeholder="09:00"
                      value={horaBR}
                      onChange={(e) => setHoraBR(formatarHora24(e.target.value))}
                      maxLength={5}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.label}>Valor da Consulta (R$) - Opcional</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250.00"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("lista")}
                    style={styles.btnSecondary}
                    disabled={salvando}
                  >
                    Voltar para Lista
                  </button>
                  <button
                    type="submit"
                    style={styles.btnPrimary}
                    disabled={salvando}
                  >
                    {salvando ? "Salvando..." : "Salvar Agendamento"}
                  </button>
                </div>
              </form>
            </div>
          )}
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
    marginBottom: "24px",
  }),
  title: { margin: 0, fontSize: "28px", color: "#0f172a", fontWeight: "800" },
  subtitle: { color: "#64748b", margin: "6px 0 0", fontSize: "14px" },
  tabButtons: {
    display: "flex",
    gap: "8px",
    background: "#e2e8f0",
    padding: "4px",
    borderRadius: "12px",
  },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tabBtnActive: {
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    background: "#ffffff",
    padding: "12px 18px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600",
  },
  select: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#334155",
    background: "#f8fafc",
  },
  dateInput: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#334155",
  },
  btnClearDate: {
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    cursor: "pointer",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    border: "1px solid #e2e8f0",
  },
  formCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    border: "1px solid #e2e8f0",
    maxWidth: "600px",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "#f8fafc",
  },
  btnPrimary: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "12px 18px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
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
  },
  td: {
    padding: "14px",
    fontSize: "14px",
    color: "#334155",
  },
  clinicaBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
  },
  statusTag: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
  },
  btnActionConfirmar: {
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
  btnActionRealizar: {
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
  loadingBox: {
    textAlign: "center",
    padding: "48px",
    color: "#64748b",
  },
  emptyBox: {
    textAlign: "center",
    padding: "48px",
  },
};

export default Agendamentos;
