import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaUserPlus,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaTrash,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

function formatarCPF(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 11);
  const partes = [];
  if (digits.length > 0) partes.push(digits.slice(0, 3));
  if (digits.length > 3) partes.push(digits.slice(3, 6));
  if (digits.length > 6) partes.push(digits.slice(6, 9));
  let resultado = partes.join(".");
  if (digits.length > 9) resultado += "-" + digits.slice(9, 11);
  return resultado;
}

function formatarTelefone(digits) {
  digits = digits.replace(/\D/g, "").slice(0, 11);
  let resultado = "";
  if (digits.length > 0) resultado = "(" + digits.slice(0, 2);
  if (digits.length > 2) {
    resultado += ") " + digits.slice(2, digits.length <= 10 ? 6 : 7);
  }
  if (digits.length > 6 && digits.length <= 10) {
    resultado += "-" + digits.slice(6, 10);
  } else if (digits.length > 7) {
    resultado += "-" + digits.slice(7, 11);
  }
  return resultado;
}

function Clientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalNovo, setModalNovo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);

  // Form states
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  async function carregarPacientes(termo = busca) {
    setCarregando(true);
    try {
      const url = termo ? `pacientes/?search=${encodeURIComponent(termo)}` : "pacientes/";
      const res = await api.get(url);
      setPacientes(res.data);
    } catch (err) {
      console.error("Erro ao carregar pacientes:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      carregarPacientes(busca);
    }, 300);
    return () => clearTimeout(timeout);
  }, [busca]);

  async function handleSalvarPaciente(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await api.post("pacientes/", {
        nome,
        cpf: cpf.replace(/\D/g, ""),
        telefone,
        email,
      });
      setMensagem("Paciente cadastrado com sucesso!");
      setNome("");
      setCpf("");
      setTelefone("");
      setEmail("");
      setModalNovo(false);
      carregarPacientes();
    } catch (err) {
      console.error("Erro ao cadastrar paciente:", err);
      const erroMsg = err.response?.data ? Object.values(err.response.data)[0] : "Erro ao cadastrar paciente.";
      alert(`Erro: ${erroMsg}`);
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(id, nomePaciente) {
    if (!window.confirm(`Deseja realmente excluir o cadastro de "${nomePaciente}"?`)) return;

    try {
      await api.delete(`pacientes/${id}/`);
      setMensagem(`Paciente "${nomePaciente}" excluído.`);
      carregarPacientes();
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Não foi possível excluir o paciente.");
    }
  }

  return (
    <div>
      <Sidebar />
      <div style={styles.container(isMobile)}>
        <main style={styles.main(isMobile)}>
          {/* Header */}
          <div style={styles.header(isMobile)}>
            <div>
              <h1 style={styles.title}>Base de Pacientes</h1>
              <p style={styles.subtitle}>
                Gerenciamento de prontuários, contatos e identificação cadastral
              </p>
            </div>
            <button onClick={() => setModalNovo(true)} style={styles.btnNovo}>
              <FaUserPlus /> Novo Paciente
            </button>
          </div>

          {mensagem && <div style={styles.alertSuccess}>{mensagem}</div>}

          {/* Barra de Busca e Estatística */}
          <div style={styles.topControls}>
            <div style={styles.searchWrap}>
              <FaSearch color="#94a3b8" />
              <input
                type="text"
                placeholder="Buscar paciente por nome ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.countBadge}>
              <FaUsers color="#2563eb" />
              <span>{pacientes.length} pacientes cadastrados</span>
            </div>
          </div>

          {/* Tabela de Pacientes */}
          <div style={styles.card}>
            {carregando ? (
              <div style={styles.loadingBox}>
                <FaSpinner className="spin" size={24} color="#2563eb" />
                <p>Consultando base de pacientes...</p>
              </div>
            ) : pacientes.length === 0 ? (
              <div style={styles.emptyBox}>
                <FaUsers size={44} color="#cbd5e1" />
                <h3 style={{ margin: "14px 0 6px", color: "#334155" }}>
                  Nenhum paciente encontrado
                </h3>
                <p style={{ color: "#64748b", margin: 0 }}>
                  {busca
                    ? `Nenhum resultado para "${busca}".`
                    : "Cadastre seu primeiro paciente usando o botão acima."}
                </p>
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nome do Paciente</th>
                      <th style={styles.th}>CPF</th>
                      <th style={styles.th}>Telefone / WhatsApp</th>
                      <th style={styles.th}>E-mail</th>
                      <th style={styles.th}>Cadastrado Em</th>
                      <th style={{ ...styles.th, textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pacientes.map((p) => {
                      const dtCadastro = p.criado_em
                        ? new Date(p.criado_em).toLocaleDateString("pt-BR")
                        : "-";

                      return (
                        <tr key={p.id} style={styles.tr}>
                          <td style={{ ...styles.td, fontWeight: "700", color: "#0f172a" }}>
                            {p.nome}
                          </td>
                          <td style={{ ...styles.td, fontFamily: "monospace" }}>
                            {formatarCPF(p.cpf)}
                          </td>
                          <td style={{ ...styles.td, color: "#334155" }}>
                            {p.telefone ? formatarTelefone(p.telefone) : "-"}
                          </td>
                          <td style={{ ...styles.td, color: "#64748b" }}>
                            {p.email || "-"}
                          </td>
                          <td style={{ ...styles.td, color: "#64748b", fontSize: "13px" }}>
                            {dtCadastro}
                          </td>
                          <td style={{ ...styles.td, textAlign: "right" }}>
                            <button
                              onClick={() => handleExcluir(p.id, p.nome)}
                              style={styles.btnExcluir}
                              title="Excluir cadastro"
                            >
                              <FaTrash size={12} />
                            </button>
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

      {/* Modal Novo Paciente */}
      {modalNovo && (
        <div style={styles.backdrop}>
          <div style={styles.modalBox}>
            <h2 style={{ margin: "0 0 16px", fontSize: "20px", color: "#0f172a" }}>
              Cadastrar Novo Paciente
            </h2>
            <form onSubmit={handleSalvarPaciente} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={styles.label}>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do paciente"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCPF(e.target.value))}
                  maxLength={14}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                  maxLength={15}
                  style={styles.modalInput}
                />
              </div>

              <div>
                <label style={styles.label}>E-mail</label>
                <input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.modalInput}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setModalNovo(false)}
                  style={styles.btnCancelarModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.btnSalvarModal}
                  disabled={salvando}
                >
                  {salvando ? "Salvando..." : "Salvar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  btnNovo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
  },
  topControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    padding: "10px 16px",
    flex: 1,
    maxWidth: "420px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#0f172a",
  },
  countBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    padding: "8px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e40af",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
    border: "1px solid #e2e8f0",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "640px" },
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
  btnExcluir: {
    border: "1px solid #fee2e2",
    background: "#fef2f2",
    color: "#ef4444",
    padding: "6px 10px",
    borderRadius: "8px",
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
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "16px",
  },
  modalBox: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "6px",
    display: "block",
  },
  modalInput: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  btnSalvarModal: {
    padding: "11px 20px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
  },
  btnCancelarModal: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default Clientes;
