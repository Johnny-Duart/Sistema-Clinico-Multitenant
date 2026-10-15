import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaChartLine,
  FaCog,
  FaHospital,
  FaSignOutAlt,
  FaUserCircle,
  FaTooth,
  FaHeartbeat,
} from "react-icons/fa";
import api from "../api/axios";

const itemsProfissional = [
  { to: "/dashboard", label: "Dashboard", icon: <FaChartPie /> },
  { to: "/clientes", label: "Pacientes", icon: <FaUsers /> },
  { to: "/agendamentos", label: "Agendamentos", icon: <FaCalendarAlt /> },
  { to: "/cadastros", label: "Novo Atendimento", icon: <FaClipboardList /> },
  { to: "/relatorios", label: "Relatórios", icon: <FaChartLine /> },
  { to: "/configuracoes", label: "Configurações", icon: <FaCog /> },
];

function Sidebar() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario_logado") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const atualizarLayout = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", atualizarLayout);
    return () => window.removeEventListener("resize", atualizarLayout);
  }, []);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const res = await api.get("usuarios/me/");
        setUsuario(res.data);
        localStorage.setItem("usuario_logado", JSON.stringify(res.data));
      } catch (err) {
        console.error("Erro ao carregar usuário na sidebar:", err);
      }
    }
    carregarUsuario();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("usuario_logado");
    navigate("/login");
  }

  const clinicaSlug = usuario?.clinica_detalhes?.slug;
  const clinicaNome = usuario?.clinica_detalhes?.nome || (usuario?.role === "admin" ? "Admin Geral (Multi-Clínica)" : "Clínica");
  const isDermato = clinicaSlug === "dermato";
  const isOdonto = clinicaSlug === "odonto";

  const styles = {
    sidebar: {
      position: isMobile ? "sticky" : "fixed",
      top: 0,
      left: 0,
      right: isMobile ? 0 : undefined,
      bottom: isMobile ? "auto" : 0,
      width: isMobile ? "100%" : "260px",
      background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
      color: "#fff",
      padding: isMobile ? "12px 14px" : "22px 18px",
      boxSizing: "border-box",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    topArea: {
      display: "flex",
      flexDirection: "column",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "18px",
      fontWeight: "700",
      marginBottom: "8px",
    },
    clinicaTag: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 10px",
      borderRadius: "8px",
      background: isDermato
        ? "rgba(185, 138, 68, 0.2)"
        : isOdonto
        ? "rgba(47, 122, 91, 0.2)"
        : "rgba(37, 99, 235, 0.2)",
      color: isDermato ? "#f59e0b" : isOdonto ? "#34d399" : "#60a5fa",
      fontSize: "12px",
      fontWeight: "700",
      marginBottom: isMobile ? "12px" : "24px",
      border: `1px solid ${
        isDermato
          ? "rgba(185, 138, 68, 0.4)"
          : isOdonto
          ? "rgba(47, 122, 91, 0.4)"
          : "rgba(37, 99, 235, 0.4)"
      }`,
    },
    menu: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(3, minmax(0, 1fr))" : "1fr",
      gap: isMobile ? "8px" : "10px",
    },
    link: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: isMobile ? "10px 8px" : "12px 14px",
      borderRadius: "12px",
      textDecoration: "none",
      color: "#cbd5e1",
      fontWeight: "600",
      fontSize: isMobile ? "13px" : "14px",
      background: "rgba(255,255,255,0.04)",
      transition: "all 0.2s ease",
    },
    activeLink: {
      background: isDermato
        ? "linear-gradient(135deg, #b98a44, #8a6030)"
        : isOdonto
        ? "linear-gradient(135deg, #2f7a5b, #1f5a45)"
        : "linear-gradient(135deg, #2563eb, #1d4ed8)",
      color: "#fff",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
    },
    bottomArea: {
      marginTop: isMobile ? "12px" : "auto",
      paddingTop: "16px",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isMobile ? "center" : "stretch",
      gap: "10px",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    userName: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#f8fafc",
      margin: 0,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "150px",
    },
    userRole: {
      fontSize: "11px",
      color: "#94a3b8",
      margin: 0,
      textTransform: "capitalize",
    },
    btnLogout: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "10px 14px",
      borderRadius: "10px",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#fca5a5",
      fontWeight: "600",
      fontSize: "13px",
      cursor: "pointer",
      transition: "background 0.2s ease",
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.topArea}>
        <div style={styles.logo}>
          <FaHospital size={26} color="#60a5fa" />
          <span>Gestão Clínica</span>
        </div>

        <div style={styles.clinicaTag}>
          {isDermato ? <FaHeartbeat /> : isOdonto ? <FaTooth /> : <FaHospital />}
          <span>{clinicaNome}</span>
        </div>

        <ul style={styles.menu}>
          {itemsProfissional.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => ({
                  ...styles.link,
                  ...(isActive ? styles.activeLink : {}),
                })}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.bottomArea}>
        <div style={styles.userInfo}>
          <FaUserCircle size={28} color="#94a3b8" />
          <div>
            <p style={styles.userName}>{usuario?.nome_completo || "Profissional"}</p>
            <p style={styles.userRole}>{usuario?.role || "Acesso Ativo"}</p>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.btnLogout} title="Sair do sistema">
          <FaSignOutAlt />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
