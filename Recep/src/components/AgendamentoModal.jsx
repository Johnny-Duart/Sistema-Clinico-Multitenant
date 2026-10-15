import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaTimes,
  FaSpinner,
  FaTooth,
  FaHeartbeat,
} from "react-icons/fa";
import api from "../api/axios";

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

export default function AgendamentoModal({ isOpen, onClose, defaultClinica = "dermato" }) {
  const navigate = useNavigate();
  const [clinicaSlug, setClinicaSlug] = useState(defaultClinica);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState("");
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(null);

  // Formulário do paciente
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    setClinicaSlug(defaultClinica);
  }, [defaultClinica]);

  // Data mínima: hoje
  const hojeISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!dataSelecionada) {
      // Define a data inicial como hoje ou próximo dia útil
      setDataSelecionada(hojeISO);
    }
  }, [hojeISO, dataSelecionada]);

  // Buscar horários sempre que data ou clínica mudar
  useEffect(() => {
    if (!isOpen || !dataSelecionada || !clinicaSlug) return;

    let ativo = true;
    async function carregarHorarios() {
      setCarregandoHorarios(true);
      setErro("");
      setHorarioSelecionado("");
      try {
        const res = await api.get(
          `clinicas/${clinicaSlug}/horarios-disponiveis/?data=${dataSelecionada}`
        );
        if (ativo) {
          setHorarios(res.data.horarios || []);
        }
      } catch (err) {
        if (ativo) {
          console.error("Erro ao carregar horários:", err);
          setErro("Não foi possível carregar os horários para esta data.");
          setHorarios([]);
        }
      } finally {
        if (ativo) setCarregandoHorarios(false);
      }
    }

    carregarHorarios();
    return () => {
      ativo = false;
    };
  }, [dataSelecionada, clinicaSlug, isOpen]);

  if (!isOpen) return null;

  async function handleConfirmarAgendamento(e) {
    e.preventDefault();
    setErro("");

    if (!horarioSelecionado) {
      setErro("Por favor, selecione um horário disponível.");
      return;
    }

    const dataHoraISO = `${dataSelecionada}T${horarioSelecionado}:00`;

    setEnviando(true);
    try {
      const res = await api.post(`clinicas/${clinicaSlug}/agendar/`, {
        nome,
        cpf: cpf.replace(/\D/g, ""),
        telefone,
        email,
        senha,
        data_hora: dataHoraISO,
        observacoes,
      });

      // Se retornou tokens, salva no localStorage para o paciente já ficar autenticado
      if (res.data.tokens?.access) {
        localStorage.setItem("access_token", res.data.tokens.access);
        localStorage.setItem("refresh_token", res.data.tokens.refresh);
      }

      setSucesso({
        ...res.data.agendamento,
        tokens: !!res.data.tokens?.access,
      });
    } catch (err) {
      console.error("Erro ao agendar:", err);
      const msgErro =
        err.response?.data?.erro ||
        "Não foi possível concluir o agendamento. Verifique os dados.";
      setErro(msgErro);
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setSucesso(null);
    setHorarioSelecionado("");
    setNome("");
    setCpf("");
    setTelefone("");
    setEmail("");
    setSenha("");
    setObservacoes("");
    setErro("");
  }

  const isDermato = clinicaSlug === "dermato";
  const primaryColor = isDermato ? "#b98a44" : "#2f7a5b";
  const secondaryColor = isDermato ? "#d7b172" : "#68b58a";

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isDermato ? (
              <FaHeartbeat size={24} color={primaryColor} />
            ) : (
              <FaTooth size={24} color={primaryColor} />
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#1e293b" }}>
                Agendar Consulta Online
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                Escolha a especialidade, data e horário conveniente
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              reiniciar();
              onClose();
            }}
            style={styles.closeBtn}
            aria-label="Fechar"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {sucesso ? (
          /* Sucesso */
          <div style={styles.successBox}>
            <FaCheckCircle size={56} color="#16a34a" />
            <h3 style={{ margin: "16px 0 8px", color: "#0f172a" }}>
              Consulta Confirmada!
            </h3>
            <p style={{ color: "#475569", lineHeight: 1.6, margin: 0 }}>
              Sua consulta de <strong>{sucesso.clinica}</strong> foi agendada
              com sucesso para o dia{" "}
              <strong>
                {new Date(sucesso.data_hora).toLocaleDateString("pt-BR")}
              </strong>{" "}
              às{" "}
              <strong>
                {new Date(sucesso.data_hora).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
              .
            </p>

            <div style={styles.successCard}>
              <div>
                <strong>Paciente:</strong> {sucesso.paciente}
              </div>
              <div>
                <strong>Duração estimada:</strong> {sucesso.duracao_minutos} min
              </div>
              <div>
                <strong>Status:</strong> Agendado
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, width: "100%" }}>
              <button
                onClick={() => {
                  onClose();
                  reiniciar();
                  navigate("/portal-paciente");
                }}
                style={{
                  ...styles.btnPrimary,
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  flex: 1,
                }}
              >
                Acessar Portal do Paciente
              </button>
              <button
                onClick={() => {
                  reiniciar();
                  onClose();
                }}
                style={{ ...styles.btnSecondary, flex: 1 }}
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          /* Formulário de Agendamento */
          <form onSubmit={handleConfirmarAgendamento} style={styles.body}>
            {erro && <div style={styles.errorBox}>{erro}</div>}

            {/* Seletor de Clínica */}
            <div style={styles.section}>
              <label style={styles.label}>1. Especialidade</label>
              <div style={styles.variantTabs}>
                <button
                  type="button"
                  onClick={() => setClinicaSlug("dermato")}
                  style={{
                    ...styles.variantTab,
                    ...(isDermato ? styles.variantTabActive : {}),
                    borderColor: isDermato ? "#b98a44" : "#e2e8f0",
                  }}
                >
                  <FaHeartbeat /> Dermatologia (Slots 20 min)
                </button>
                <button
                  type="button"
                  onClick={() => setClinicaSlug("odonto")}
                  style={{
                    ...styles.variantTab,
                    ...(!isDermato ? styles.variantTabActive : {}),
                    borderColor: !isDermato ? "#2f7a5b" : "#e2e8f0",
                  }}
                >
                  <FaTooth /> Odontologia (Slots 40 min)
                </button>
              </div>
            </div>

            {/* Escolha de Data */}
            <div style={styles.section}>
              <label style={styles.label}>
                <FaCalendarAlt style={{ marginRight: 6 }} /> 2. Selecione a Data
              </label>
              <input
                type="date"
                min={hojeISO}
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Grade de Horários Livres */}
            <div style={styles.section}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={styles.label}>
                  <FaClock style={{ marginRight: 6 }} /> 3. Horários Disponíveis
                </label>
                {carregandoHorarios && (
                  <span style={{ fontSize: "12px", color: primaryColor, display: "flex", alignItems: "center", gap: 4 }}>
                    <FaSpinner className="spin" /> Verificando vagas...
                  </span>
                )}
              </div>

              {carregandoHorarios ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  Consultando agenda em tempo real...
                </div>
              ) : horarios.length === 0 ? (
                <div style={styles.emptySlots}>
                  Nenhum horário livre encontrado para esta data. Escolha outro dia.
                </div>
              ) : (
                <div style={styles.slotsGrid}>
                  {horarios.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorarioSelecionado(h)}
                      style={{
                        ...styles.slotBtn,
                        ...(horarioSelecionado === h
                          ? {
                              background: primaryColor,
                              color: "#fff",
                              borderColor: primaryColor,
                              fontWeight: "700",
                              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                            }
                          : {}),
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dados do Paciente */}
            <div style={styles.section}>
              <label style={styles.label}>4. Seus Dados e Criação de Acesso</label>
              <div style={styles.formGrid}>
                <div>
                  <div style={styles.inputWrap}>
                    <FaUser color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Nome Completo *"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      style={styles.innerInput}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div style={styles.inputWrap}>
                    <FaIdCard color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="CPF *"
                      value={cpf}
                      onChange={(e) => setCpf(formatarCPF(e.target.value))}
                      maxLength={14}
                      style={styles.innerInput}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div style={styles.inputWrap}>
                    <FaPhone color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="WhatsApp / Telefone *"
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      maxLength={15}
                      style={styles.innerInput}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div style={styles.inputWrap}>
                    <FaEnvelope color="#94a3b8" />
                    <input
                      type="email"
                      placeholder="Seu E-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.innerInput}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={styles.inputWrap}>
                    <FaLock color="#94a3b8" />
                    <input
                      type="password"
                      placeholder="Crie uma Senha para acompanhar/cancelar consulta depois *"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      style={styles.innerInput}
                      required
                    />
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <textarea
                    placeholder="Observação ou motivo da consulta (opcional)"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    style={styles.textarea}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={styles.footer}>
              <button
                type="button"
                onClick={() => {
                  reiniciar();
                  onClose();
                }}
                style={styles.btnSecondary}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  ...styles.btnPrimary,
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  opacity: enviando || !horarioSelecionado ? 0.7 : 1,
                }}
                disabled={enviando || !horarioSelecionado}
              >
                {enviando ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "16px",
    boxSizing: "border-box",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "680px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #f1f5f9",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 10,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    padding: "6px",
    borderRadius: "8px",
    display: "flex",
  },
  body: {
    padding: "20px 24px",
    display: "grid",
    gap: "20px",
  },
  section: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
    display: "flex",
    alignItems: "center",
  },
  variantTabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  variantTab: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#475569",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  },
  variantTabActive: {
    background: "#fff",
    color: "#0f172a",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#0969ca",
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(78px, 1fr))",
    gap: "8px",
    maxHeight: "150px",
    overflowY: "auto",
    padding: "4px",
  },
  slotBtn: {
    padding: "9px 6px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#1e293b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.15s ease",
  },
  emptySlots: {
    padding: "18px",
    background: "#fffbeb",
    border: "1px solid #fef3c7",
    color: "#92400e",
    borderRadius: "10px",
    fontSize: "13px",
    textAlign: "center",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
  },
  innerInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#0f172a",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    fontFamily: "inherit",
    background: "#f8fafc",
    boxSizing: "border-box",
    resize: "vertical",
    color: "#0f172a",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f1f5f9",
  },
  btnPrimary: {
    padding: "12px 22px",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
  },
  btnSecondary: {
    padding: "12px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#fff",
    color: "#475569",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  errorBox: {
    padding: "12px",
    background: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#b91c1c",
    borderRadius: "10px",
    fontSize: "13px",
  },
  successBox: {
    padding: "40px 24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  successCard: {
    marginTop: "20px",
    padding: "16px 20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    width: "100%",
    textAlign: "left",
    display: "grid",
    gap: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
};
