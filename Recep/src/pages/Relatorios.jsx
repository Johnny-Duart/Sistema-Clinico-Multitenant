import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

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
    maxWidth: "1120px",
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
    maxWidth: "1120px",
    margin: "0 auto",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "26px",
  },
  box: {
    background: "linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%)",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid #dbeafe",
  },
  boxTitle: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "18px",
  },
  boxText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },
};

function Relatorios() {
  const navigate = useNavigate();

  return (
    <div>
      <Sidebar />
      <div style={styles.page}>
      <div style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>Relatórios</h1>
          <p style={styles.subtitle}>Indicadores e visões analíticas da operação</p>
        </div>
        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          ← Voltar para Dashboard
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.statGrid}>
          <div style={styles.box}>
            <span style={styles.badge}>Atendimentos</span>
            <strong style={styles.boxTitle}>Quantidade por período</strong>
            <p style={styles.boxText}>Acompanhe o ritmo de consultas e o volume diário da recepção.</p>
          </div>
          <div style={styles.box}>
            <span style={styles.badge}>Financeiro</span>
            <strong style={styles.boxTitle}>Faturamento</strong>
            <p style={styles.boxText}>Resumo financeiro por turno, dia ou período selecionado.</p>
          </div>
          <div style={styles.box}>
            <span style={styles.badge}>Performance</span>
            <strong style={styles.boxTitle}>Performance operacional</strong>
            <p style={styles.boxText}>Monitore a fila, tempo de espera e eficiência da operação clínica.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Relatorios;
