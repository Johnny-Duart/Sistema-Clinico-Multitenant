import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaHospital,
  FaArrowLeft,
  FaSpinner,
  FaUserMd,
  FaTooth,
  FaUserShield,
} from "react-icons/fa";
import api from "../api/axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await api.post("token/", { username, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Buscar perfil do usuário para saber para onde direcionar
      try {
        const resMe = await api.get("usuarios/me/");
        localStorage.setItem("usuario_logado", JSON.stringify(resMe.data));

        if (resMe.data.role === "paciente") {
          navigate("/portal-paciente");
        } else {
          navigate("/dashboard");
        }
      } catch {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response?.status === 401) {
        setErro("Usuário ou senha incorretos.");
      } else if (err.request) {
        setErro("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
      } else {
        setErro("Erro inesperado: " + err.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  function preencherDemo(user, pass) {
    setUsername(user);
    setPassword(pass);
    setErro("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <FaHospital size={30} color="#2563eb" />
          </div>
          <h1 style={styles.title}>Sistema Clínico</h1>
          <p style={styles.subtitle}>
            Acesse o painel profissional ou portal do paciente
          </p>
        </div>

        {erro && <div style={styles.errorBox}>{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={styles.label}>Usuário ou E-mail</label>
            <div style={styles.inputWrap}>
              <FaUser color="#94a3b8" />
              <input
                type="text"
                placeholder="Ex: dermato ou seu@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Senha</label>
            <div style={styles.inputWrap}>
              <FaLock color="#94a3b8" />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              ...styles.btnSubmit,
              opacity: carregando ? 0.7 : 1,
            }}
          >
            {carregando ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <FaSpinner className="spin" /> Entrando...
              </span>
            ) : (
              "Acessar Sistema"
            )}
          </button>
        </form>

        {/* Demo Fast Logins para recrutadores/LinkedIn */}
        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Acesso Rápido para Demonstração:</p>
          <div style={styles.demoButtons}>
            <button
              type="button"
              onClick={() => preencherDemo("dermato", "dermato123")}
              style={{ ...styles.demoBtn, borderColor: "#b98a44", color: "#8a6030" }}
            >
              <FaUserMd /> Dermatologia
            </button>
            <button
              type="button"
              onClick={() => preencherDemo("odonto", "odonto123")}
              style={{ ...styles.demoBtn, borderColor: "#2f7a5b", color: "#1f5a45" }}
            >
              <FaTooth /> Odontologia
            </button>
            <button
              type="button"
              onClick={() => preencherDemo("admin", "admin123")}
              style={{ ...styles.demoBtn, borderColor: "#2563eb", color: "#1d4ed8" }}
            >
              <FaUserShield /> Admin Geral
            </button>
            <button
              type="button"
              onClick={() => preencherDemo("paciente", "paciente123")}
              style={{ ...styles.demoBtn, borderColor: "#64748b", color: "#475569" }}
            >
              <FaUser /> Paciente Demo
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>
            <FaArrowLeft size={12} /> Voltar para o site institucional
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "36px 32px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logoBadge: {
    width: "60px",
    height: "60px",
    borderRadius: "18px",
    background: "#eff6ff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
    border: "1px solid #dbeafe",
  },
  title: {
    margin: "0 0 6px",
    fontSize: "24px",
    color: "#0f172a",
    fontWeight: "800",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
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
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    transition: "border-color 0.2s ease",
  },
  input: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#0f172a",
  },
  btnSubmit: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
    marginTop: "8px",
    transition: "transform 0.15s ease",
  },
  errorBox: {
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fee2e2",
    color: "#b91c1c",
    fontSize: "13px",
    marginBottom: "18px",
    textAlign: "center",
  },
  demoSection: {
    marginTop: "24px",
    padding: "14px",
    background: "#f8fafc",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1",
  },
  demoTitle: {
    margin: "0 0 10px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    textAlign: "center",
  },
  demoButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  demoBtn: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid",
    background: "#ffffff",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "background 0.2s ease",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
  },
  backLink: {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "13px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
  },
};

export default Login;