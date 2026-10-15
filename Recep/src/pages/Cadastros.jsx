import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { color } from "framer-motion";

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

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  function calcularDigito(parcial) {
    const peso = parcial.length + 1;
    let soma = 0;
    for (let i = 0; i < parcial.length; i++) {
      soma += parseInt(parcial[i]) * (peso - i);
    }
    const resto = soma % 11;
    return resto < 2 ? "0" : String(11 - resto);
  }

  const digito1 = calcularDigito(cpf.slice(0, 9));
  const digito2 = calcularDigito(cpf.slice(0, 9) + digito1);
  return cpf.slice(-2) === digito1 + digito2;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%)",
    padding: "32px",
    paddingLeft: "292px",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, sans-serif",
  },
  topBar: {
    maxWidth: "900px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
  },
  titleBlock: {
    display: "grid",
    gap: "6px",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "32px",
  },
  subtitle: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 600,
  },
  backButton: {
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "12px 18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
  },
  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
    border: "1px solid #dbeafe",
    maxWidth: "900px",
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "18px",
  },
  form: {
    display: "grid",
    gap: "14px",
    marginTop: "8px",
  },
  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #93c5fd",
    boxSizing: "border-box",
    background: "#f8fbff",
    fontSize: "15px",
    color: "#0f172a",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.25)",
  },
};

function Cadastros() {
  const navigate = useNavigate();
  const [novoNome, setNovoNome] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [mensagemForm, setMensagemForm] = useState("");

  const cpfDigits = novoCpf.replace(/\D/g, "");
  const cpfCompleto = cpfDigits.length === 11;
  const cpfInvalido = cpfCompleto && !validarCPF(novoCpf);

  async function handleCadastrarPaciente(e) {
    e.preventDefault();
    setMensagemForm("");

    if (!validarCPF(novoCpf)) {
      setMensagemForm("CPF inválido. Verifique os números digitados.");
      return;
    }

    try {
      await api.post("pacientes/", {
        nome: novoNome,
        cpf: novoCpf.replace(/\D/g, ""),
        telefone: novoTelefone,
      });
      setMensagemForm("Paciente cadastrado com sucesso!");
      setNovoNome("");
      setNovoCpf("");
      setNovoTelefone("");
    } catch (err) {
      if (err.response?.data) {
        const primeiroErro = Object.values(err.response.data)[0];
        setMensagemForm(`Erro: ${primeiroErro}`);
      } else {
        setMensagemForm("Erro ao cadastrar paciente.");
      }
    }
  }

  return (
    <div>
      <Sidebar />
      <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Novo Atendimento</h1>
          <p style={styles.subtitle}>Cadastre o paciente e acompanhe o atendimento</p>
        </div>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Voltar para Dashboard
        </button>
      </div>

      <div style={styles.card}>
        <span style={styles.badge}>Cadastro rápido</span>
        <form style={styles.form} onSubmit={handleCadastrarPaciente}>
          <input
            style={styles.input}
            type="text"
            placeholder="Nome do Cliente"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            required
          />

          <input
            style={styles.input}
            type="text"
            placeholder="CPF"
            value={novoCpf}
            onChange={(e) => setNovoCpf(formatarCPF(e.target.value))}
            maxLength={14}
            required
          />
          {novoCpf.length > 0 && cpfCompleto && cpfInvalido && (
            <p style={{ color: "#b91c1c", fontSize: 13, margin: "-4px 0 0" }}>
              CPF inválido.
            </p>
          )}

          <input
            style={styles.input}
            type="text"
            placeholder="Telefone"
            value={novoTelefone}
            onChange={(e) => setNovoTelefone(formatarTelefone(e.target.value))}
            maxLength={15}
          />

          <button type="submit" style={styles.button}>
            Cadastrar Cliente
          </button>
        </form>

        {mensagemForm && <p style={{ marginTop: 14 }}>{mensagemForm}</p>}
      </div>
      </div>
    </div>
  );
}

export default Cadastros;
