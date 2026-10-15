import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AgendamentoModal from "../components/AgendamentoModal";
import {
  FaWhatsapp,
  FaArrowUp,
  FaMapMarkerAlt,
  FaClock,
  FaStar,
  FaShieldAlt,
  FaUserMd,
  FaStethoscope,
  FaHeart,
  FaPhoneAlt,
  FaEnvelope,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaTooth,
  FaSmile,
} from "react-icons/fa";

const contentByVariant = {
  dermatologia: {
    brand: "Dr. Sofia Martins | Dermatologia",
    badge: "Dermatologia de excelência",
    title: "Cuidando da saúde e da beleza da sua pele com excelência e atendimento humanizado.",
    subtitle: "Atendimento dermatológico personalizado, seguro e baseado em evidências científicas, com foco na saúde, na estética e no bem-estar da sua pele, cabelos e unhas.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Médica dermatologista em consultório",
    aboutTitle: "Formação, experiência e compromisso com a sua pele",
    aboutText: "A Dra. Sofia Martins é dermatologista com foco em diagnóstico preciso, tratamentos individualizados e resultados naturais. Seu trabalho une ciência, sensibilidade e atenção direta ao paciente, com uma prática ética, segura e orientada para o melhor cuidado possível.",
    credentialList: [
      { icon: <FaShieldAlt />, label: "CRM-SP 123456 | Dermatologia Clínica" },
      { icon: <FaUserMd />, label: "Especialista em Medicina Estética e Laser" },
      { icon: <FaStar />, label: "Cursos e certificações em rejuvenescimento e prevenção cutânea" },
    ],
    valuesList: [
      { icon: <FaHeart />, label: "Atendimento ético, acolhedor e individualizado" },
      { icon: <FaShieldAlt />, label: "Tratamentos baseados em evidências científicas" },
      { icon: <FaStar />, label: "Planejamento personalizado para cada estádio e objetivo" },
    ],
    services: [
      { icon: <FaStethoscope />, title: "Dermatologia Clínica", text: "Avaliação e acompanhamento de condições dermatológicas do dia a dia." },
      { icon: <FaStar />, title: "Dermatologia Estética", text: "Procedimentos voltados para rejuvenescimento e melhora da qualidade da pele." },
      { icon: <FaHeart />, title: "Tratamentos Faciais", text: "Planos personalizados com foco em luminosidade, hidratação e revitalização." },
      { icon: <FaShieldAlt />, title: "Tratamentos Corporais", text: "Cuidados com pele, textura e conforto em todo o corpo." },
      { icon: <FaUserMd />, title: "Prevenção e Diagnóstico do Câncer de Pele", text: "Exames estratégicos para identificação precoce e acompanhamento seguro." },
      { icon: <FaStar />, title: "Procedimentos a Laser", text: "Tecnologia moderna para tratamento seguro e com excelente resultado estético." },
      { icon: <FaStar />, title: "Aplicação de Toxina Botulínica", text: "Procedimento minimamente invasivo para suavizar linhas de expressão." },
      { icon: <FaStar />, title: "Preenchimento Facial", text: "Reequilíbrio facial com estética natural e respeitando a identidade de cada paciente." },
      { icon: <FaHeart />, title: "Bioestimuladores de Colágeno", text: "Estimulação da produção de colágeno para rejuvenescimento consistente e progressivo." },
    ],
    clinicTitle: "Ambiente pensado para conforto, tecnologia e acolhimento",
    clinicText: "A clínica oferece um ambiente sofisticado, organizado e acolhedor com infraestrutura pensada para conforto, privacidade e segurança. Cada espaço foi planejado para proporcionar uma experiência premium durante a consulta, diagnóstico e procedimentos.",
    locationTitle: "Venha conhecer a clínica",
    locationAddress: "Av. Dr. Luiz Pereira, 1200 — Centro, São Paulo — SP",
    locationHours: "Segunda a Sexta: 08h às 18h | Sábado: 08h às 13h",
    locationDetails: "Estacionamento disponível no local e em vias adjacentes.",
    mapSrc: "https://www.google.com/maps?q=Av.%20Dr.%20Luiz%20Pereira%201200%20Centro%20Sao%20Paulo%20SP&output=embed",
    gallery: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1608490137020-4fb4f8a94a50?auto=format&fit=crop&w=900&q=80",
    ],
    testimonials: [
      "Atendimento impecável, muito acolhedor e com explicações claras. Senti confiança em todo o processo.",
      "A experiência foi excelente do começo ao fim: profissionalismo, cuidado e um ambiente muito agradável.",
      "Fiquei muito satisfeita com o resultado e com o suporte de toda a equipe durante o tratamento.",
    ],
    faqs: [
      { question: "Como agendar uma consulta?", answer: "Você pode preencher o formulário de contato ou utilizar o botão de WhatsApp para agendar diretamente com nossa equipe." },
      { question: "Quais convênios são aceitos?", answer: "A clínica atende com uma rede de convênios e também oferece consultas particulares. Consulte nossa equipe para confirmação." },
      { question: "Quais procedimentos são realizados?", answer: "A clínica realiza consultas clínicas, estética, prevenção, laser, preenchimentos e outros procedimentos dermatológicos personalizados." },
      { question: "Como funciona a primeira consulta?", answer: "Na primeira consulta, realizamos acolhimento, avaliação da pele, histórico do paciente e definição do plano terapêutico ideal." },
    ],
    contactEmail: "drasofia@dermacare.com",
    phone: "(11) 99999-9999",
    footerName: "Dra. Sofia Martins",
    footerDescription: "CRM-SP 123456 · Dermatologia",
  },
  dentista: {
    brand: "Dra. Marina Costa | Odontologia",
    badge: "Odontologia de excelência",
    title: "Sorriso bonito e saúde bucal com atenção sofisticada, moderna e acolhedora.",
    subtitle: "Consultas odontológicas com foco em estética, prevenção, reabilitação e conforto, unindo tecnologia avançada, diagnóstico preciso e cuidado humanizado.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Dentista em consultório",
    aboutTitle: "Exclusividade, confiança e resultado para o seu sorriso",
    aboutText: "A Dra. Marina Costa é odontóloga com especialização em estética, clareamento, reabilitação e prevenção. Sua prática combina comunicação clara, exames rigorosos e tratamentos cuidadosamente planejados para entregar segurança e beleza natural.",
    credentialList: [
      { icon: <FaShieldAlt />, label: "CRO-SP 245678 | Odontologia Geral" },
      { icon: <FaUserMd />, label: "Especialista em Harmonização Orofacial" },
      { icon: <FaStar />, label: "Cursos em estética dental e tratamento de sorriso" },
    ],
    valuesList: [
      { icon: <FaHeart />, label: "Atendimento acolhedor e personalizado" },
      { icon: <FaShieldAlt />, label: "Tecnologia e diagnóstico de alta precisão" },
      { icon: <FaSmile />, label: "Planejamento do sorriso com estética natural" },
    ],
    services: [
      { icon: <FaTooth />, title: "Consulta Preventiva", text: "Avaliação completa da saúde bucal com foco em prevenção e longevidade." },
      { icon: <FaSmile />, title: "Clareamento Dental", text: "Tratamento seguro para brilho e refinamento do sorriso." },
      { icon: <FaHeart />, title: "Estética Dental", text: "Molduras, alinhamentos e simetria com resultado sofisticado." },
      { icon: <FaShieldAlt />, title: "Implantes", text: "Reabilitação funcional e estética com planejamento individualizado." },
      { icon: <FaUserMd />, title: "Ortodontia", text: "Ajustes dentários para alinhamento e qualidade de vida." },
      { icon: <FaStar />, title: "Lentes de Contato Dental", text: "Refinamento do sorriso com resultados naturais e sofisticados." },
      { icon: <FaStar />, title: "Restaurações Estéticas", text: "Recuperação funcional com aparência discreta e elegante." },
      { icon: <FaStar />, title: "Harmonização Orofacial", text: "Equilíbrio entre sorriso, sorriso e expressão facial." },
      { icon: <FaHeart />, title: "Cuidados com Saúde Bucal", text: "Orientação preventiva e manutenção para sorriso duradouro." },
    ],
    clinicTitle: "Consultório moderno e pensado para conforto absoluto",
    clinicText: "A clínica de odontologia foi pensada para criar uma experiência acolhedora, elegante e segura. Cada ambiente foi organizado para brindar conforto, tecnologia e uma rotina ágil em procedimentos estéticos, preventivos e reabilitadores.",
    locationTitle: "Encontre nosso consultório",
    locationAddress: "Av. das Flores, 540 — Jardim Paulista, São Paulo — SP",
    locationHours: "Segunda a Sexta: 09h às 19h | Sábado: 09h às 14h",
    locationDetails: "Estacionamento, recepção premium e atendimento com horários flexíveis.",
    mapSrc: "https://www.google.com/maps?q=Av.%20das%20Flores%20540%20Jardim%20Paulista%20Sao%20Paulo%20SP&output=embed",
    gallery: [
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1640286317851-7201efff3242?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616391182219-a78be3f6b715?auto=format&fit=crop&w=900&q=80",
    ],
    testimonials: [
      "O atendimento foi impecável, com cuidado e precisão em cada detalhe. O resultado superou minhas expectativas.",
      "Ambiente muito bonito, equipe atenciosa e uma clínica realmente premium em todos os sentidos.",
      "Sinto muita confiança para realizar todos os procedimentos aqui, a experiência foi inigualável.",
    ],
    faqs: [
      { question: "Como agendar a primeira consulta?", answer: "Você pode entrar em contato pelo WhatsApp ou pelo formulário para receber atendimento rápido e personalizado." },
      { question: "Os tratamentos são personalizados?", answer: "Sim. Cada plano é elaborado com base no histórico, na saúde bucal e na expectativa estética de cada paciente." },
      { question: "Qual a melhor opção para clarear o sorriso?", answer: "A avaliação inicial identifica as melhores técnicas, como clareamento, lentes de contato ou harmonização." },
      { question: "A clínica atende para estética e prevenção?", answer: "Sim, trabalhamos com prevenção, estética, reabilitação e acompanhamento contínuo da saúde bucal." },
    ],
    contactEmail: "marina@odontoclinica.com",
    phone: "(11) 98888-8888",
    footerName: "Dra. Marina Costa",
    footerDescription: "CRO-SP 245678 · Odontologia",
  },
};

const themeByVariant = {
  dermatologia: {
    pageBg: "linear-gradient(135deg, #fbf8f3 0%, #f7f3ea 35%, #f5fbf9 100%)",
    navBg: "rgba(251, 248, 243, 0.9)",
    brandColor: "#6b4f2a",
    accent: "#8a6030",
    accentSoft: "#f3ead5",
    buttonStart: "#b98a44",
    buttonEnd: "#d7b172",
    buttonText: "#fff",
    secondaryBg: "#fffaf0",
    secondaryText: "#6b4f2a",
    titleColor: "#2b1f14",
    textColor: "#5f6b73",
    cardBorder: "rgba(197, 164, 97, 0.28)",
    cardShadow: "0 16px 40px rgba(89, 65, 29, 0.08)",
    footerBg: "#2b1f14",
    footerText: "#f8f4ec",
  },
  dentista: {
    pageBg: "linear-gradient(135deg, #f6fbf8 0%, #eef8f1 38%, #fbfcf9 100%)",
    navBg: "rgba(247, 252, 249, 0.92)",
    brandColor: "#1f5a45",
    accent: "#2f7a5b",
    accentSoft: "#e8f5ee",
    buttonStart: "#2f7a5b",
    buttonEnd: "#68b58a",
    buttonText: "#fff",
    secondaryBg: "#f7fbf8",
    secondaryText: "#234f3b",
    titleColor: "#17352a",
    textColor: "#58756a",
    cardBorder: "rgba(54, 120, 91, 0.22)",
    cardShadow: "0 16px 40px rgba(38, 88, 67, 0.09)",
    footerBg: "#163b30",
    footerText: "#f3fbf6",
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    color: "#1f2937",
    fontFamily: "Segoe UI, sans-serif",
  },
  wrap: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "0 20px",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    backdropFilter: "blur(12px)",
    background: "rgba(251, 248, 243, 0.9)",
    borderBottom: "1px solid rgba(184, 147, 82, 0.22)",
  },
  navInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "18px 0",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontWeight: 800,
    fontSize: "20px",
    color: "#6b4f2a",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #b98a44, #d7b172)",
    color: "#fff",
    padding: "12px 20px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(185, 138, 68, 0.26)",
  },
  secondaryButton: {
    border: "1px solid #d6b783",
    borderRadius: "999px",
    background: "#fffaf0",
    color: "#6b4f2a",
    padding: "12px 20px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(185, 138, 68, 0.12)",
  },
  section: {
    padding: "84px 0",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "40px",
    alignItems: "center",
    padding: "56px 0 42px",
  },
  heroText: {
    display: "grid",
    gap: "18px",
  },
  badge: {
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    gap: "8px",
    borderRadius: "999px",
    padding: "8px 14px",
    background: "#f3ead5",
    color: "#8a6030",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontSize: "12px",
  },
  title: {
    margin: 0,
    fontSize: "clamp(38px, 5vw, 63px)",
    lineHeight: 1.05,
    color: "#2b1f14",
  },
  subtitle: {
    margin: 0,
    color: "#5f6b73",
    fontSize: "18px",
    lineHeight: 1.8,
    maxWidth: "760px",
  },
  highlight: {
    color: "#8a6030",
  },
  heroActions: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  photoCard: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "28px",
    padding: "18px",
    border: "1px solid rgba(197, 164, 97, 0.32)",
    boxShadow: "0 22px 60px rgba(89, 65, 29, 0.13)",
  },
  heroImage: {
    width: "100%",
    height: "580px",
    objectFit: "cover",
    borderRadius: "22px",
    display: "block",
  },
  sectionHead: {
    display: "grid",
    gap: "8px",
    marginBottom: "28px",
  },
  sectionEyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#8a6030",
    fontWeight: 800,
  },
  sectionTitle: {
    margin: 0,
    fontSize: "32px",
    color: "#2b1f14",
  },
  sectionText: {
    margin: 0,
    color: "#5f6b73",
    lineHeight: 1.8,
    maxWidth: "760px",
  },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 0.9fr",
    gap: "22px",
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(197, 164, 97, 0.28)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 16px 40px rgba(89, 65, 29, 0.08)",
  },
  cardList: {
    display: "grid",
    gap: "12px",
    marginTop: "18px",
  },
  credential: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#fcf8ee",
    borderRadius: "14px",
    padding: "12px 14px",
    color: "#6b4f2a",
    fontWeight: 700,
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },
  serviceCard: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "20px",
    padding: "22px",
    border: "1px solid rgba(197, 164, 97, 0.26)",
    boxShadow: "0 12px 28px rgba(96, 72, 34, 0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  clinicGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  mapFrame: {
    width: "100%",
    minHeight: "320px",
    border: "none",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(89, 65, 29, 0.12)",
  },
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
  },
  galleryImage: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderRadius: "18px",
    boxShadow: "0 10px 24px rgba(89, 65, 29, 0.10)",
  },
  testimonialGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "18px",
  },
  stars: {
    display: "flex",
    gap: "6px",
    color: "#d4a74b",
    marginBottom: "10px",
  },
  faqGrid: {
    display: "grid",
    gap: "14px",
  },
  faqItem: {
    background: "rgba(255,255,255,0.9)",
    borderRadius: "18px",
    border: "1px solid rgba(197, 164, 97, 0.26)",
    padding: "16px 18px",
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 0.8fr",
    gap: "22px",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #d9c39d",
    background: "#fffdf9",
    boxSizing: "border-box",
    marginTop: "10px",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #d9c39d",
    background: "#fffdf9",
    boxSizing: "border-box",
    marginTop: "10px",
    resize: "vertical",
    minHeight: "120px",
    fontFamily: "inherit",
  },
  footer: {
    background: "#2b1f14",
    color: "#f8f4ec",
    padding: "26px 0",
  },
  footerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "14px",
    alignItems: "center",
  },
  footerLinks: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  linkText: {
    color: "#f2e4c4",
    textDecoration: "none",
  },
  floatingWpp: {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    background: "#25d366",
    color: "#fff",
    borderRadius: "999px",
    width: "58px",
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 30px rgba(37, 211, 102, 0.35)",
    zIndex: 40,
    textDecoration: "none",
  },
  topButton: {
    position: "fixed",
    right: "18px",
    bottom: "90px",
    background: "#6b4f2a",
    color: "#fff",
    borderRadius: "999px",
    width: "52px",
    height: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 24px rgba(93, 67, 33, 0.26)",
    zIndex: 40,
    cursor: "pointer",
  },
};

function Landing() {
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);
  const [variant, setVariant] = useState("dermatologia");
  const [modalAgendamento, setModalAgendamento] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const content = contentByVariant[variant];
  const theme = themeByVariant[variant];

  const ui = {
    page: { ...styles.page, background: theme.pageBg },
    nav: { ...styles.nav, background: theme.navBg },
    brand: { ...styles.brand, color: theme.brandColor },
    primaryButton: {
      ...styles.primaryButton,
      background: `linear-gradient(135deg, ${theme.buttonStart}, ${theme.buttonEnd})`,
      color: theme.buttonText,
    },
    secondaryButton: {
      ...styles.secondaryButton,
      background: theme.secondaryBg,
      color: theme.secondaryText,
      borderColor: theme.cardBorder,
    },
    badge: { ...styles.badge, background: theme.accentSoft, color: theme.accent },
    title: { ...styles.title, color: theme.titleColor },
    highlight: { ...styles.highlight, color: theme.accent },
    sectionEyebrow: { ...styles.sectionEyebrow, color: theme.accent },
    sectionTitle: { ...styles.sectionTitle, color: theme.titleColor },
    sectionText: { ...styles.sectionText, color: theme.textColor },
    subtitle: { ...styles.subtitle, color: theme.textColor },
    card: { ...styles.card, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow },
    serviceCard: { ...styles.serviceCard, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow },
    faqItem: { ...styles.faqItem, border: `1px solid ${theme.cardBorder}` },
    footer: { ...styles.footer, background: theme.footerBg },
    footerText: { ...styles.linkText, color: theme.footerText },
  };

  return (
    <div style={ui.page}>
      <style>{`
        html { scroll-behavior: smooth; }
        body { margin: 0; }
        * { box-sizing: border-box; }
        .landing-service-card:hover,
        .landing-testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 18px 35px rgba(96, 72, 34, 0.12); }
        .landing-link:hover { opacity: 0.88; }
        @media (max-width: 980px) {
          .landing-hero, .landing-about, .landing-contact, .landing-clinic { grid-template-columns: 1fr !important; }
          .landing-service-grid, .landing-testimonial-grid, .landing-gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 640px) {
          .landing-service-grid, .landing-testimonial-grid, .landing-gallery-grid { grid-template-columns: 1fr !important; }
          .landing-hero-image { height: 360px !important; }
        }
      `}</style>

      <header style={ui.nav}>
        <div style={{ ...styles.wrap, ...styles.navInner }}>
          <div style={ui.brand}>{content.brand}</div>
          <div style={styles.navActions}>
            <button
              onClick={() => setVariant("dermatologia")}
              style={variant === "dermatologia" ? ui.primaryButton : ui.secondaryButton}
            >
              Dermatologia
            </button>
            <button
              onClick={() => setVariant("dentista")}
              style={variant === "dentista" ? ui.primaryButton : ui.secondaryButton}
            >
              Odontologia
            </button>
            <button onClick={() => navigate("/login")} style={ui.secondaryButton}>Login</button>
            <button onClick={() => setModalAgendamento(true)} style={ui.primaryButton}>Agendar Consulta</button>
          </div>
        </div>
      </header>

      <main>
        <section style={{ ...styles.wrap, ...styles.hero }} className="landing-hero">
          <div style={styles.heroText}>
            <span style={ui.badge}><FaStar size={12} /> {content.badge}</span>
            <h1 style={ui.title}>
              {content.title}
            </h1>
            <p style={ui.subtitle}>
              {content.subtitle}
            </p>
            <div style={styles.heroActions}>
              <button onClick={() => setModalAgendamento(true)} style={ui.primaryButton}>Agendar Consulta</button>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" style={{ ...ui.secondaryButton, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <FaWhatsapp /> Fale pelo WhatsApp
              </a>
            </div>
          </div>

          <div style={styles.photoCard}>
            <img
              className="landing-hero-image"
              src={content.image}
              alt={content.imageAlt}
              style={styles.heroImage}
            />
          </div>
        </section>

        <section id="about" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={styles.sectionEyebrow}>Sobre a médica</p>
            <h2 style={styles.sectionTitle}>{content.aboutTitle}</h2>
            <p style={styles.sectionText}>
              {content.aboutText}
            </p>
          </div>

          <div style={{ ...styles.aboutGrid, ...{ gridTemplateColumns: "1fr 0.9fr" } }} className="landing-about">
            <div style={styles.card}>
              <p style={{ margin: 0, color: "#8a6030", fontWeight: 800 }}>Resumo profissional</p>
              <p style={{ marginTop: "12px", color: "#5f6b73", lineHeight: 1.8 }}>
                Formada em Medicina, com residência e especialização em Dermatologia, a médica atua com atenção
                individualizada em consultas clínicas, procedimentos estéticos e prevenção de doenças de pele.
                Sua missão é oferecer bem-estar, confiança e qualidade de vida por meio de uma abordagem técnica e
                humanizada.
              </p>
              <div style={styles.cardList}>
                {content.credentialList.map((item) => (
                  <div key={item.label} style={styles.credential}>{item.icon} {item.label}</div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <p style={{ margin: 0, color: "#8a6030", fontWeight: 800 }}>Valores da prática</p>
              <div style={styles.cardList}>
                {content.valuesList.map((item) => (
                  <div key={item.label} style={styles.credential}>{item.icon} {item.label}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Áreas de atuação</p>
            <h2 style={ui.sectionTitle}>Especialidades e procedimentos com excelência</h2>
          </div>

          <div style={{ ...styles.serviceGrid, ...{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" } }} className="landing-service-grid">
            {content.services.map((item) => (
              <article key={item.title} className="landing-service-card" style={ui.serviceCard}>
                <div style={{ fontSize: "28px", color: "#8a6030", marginBottom: "12px" }}>{item.icon}</div>
                <h3 style={{ margin: "0 0 10px", color: "#2b1f14" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "#5f6b73", lineHeight: 1.7 }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="clinic" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Sobre a clínica</p>
            <h2 style={ui.sectionTitle}>{content.clinicTitle}</h2>
          </div>

          <div style={{ ...styles.clinicGrid, ...{ gridTemplateColumns: "1fr 1fr" } }} className="landing-clinic">
            <div style={styles.card}>
              <p style={{ margin: 0, color: "#8a6030", fontWeight: 800 }}>Nossa estrutura</p>
              <p style={{ marginTop: "12px", color: "#5f6b73", lineHeight: 1.8 }}>
                {content.clinicText}
              </p>
            </div>
            <div style={styles.card}>
              <p style={{ margin: 0, color: "#8a6030", fontWeight: 800 }}>Diferenciais</p>
              <div style={styles.cardList}>
                <div style={styles.credential}><FaShieldAlt /> Tecnologia moderna de diagnóstico e tratamento</div>
                <div style={styles.credential}><FaHeart /> Atendimento personalizado e humanizado</div>
                <div style={styles.credential}><FaClock /> Agendamento eficiente e organização de rotina</div>
              </div>
            </div>
          </div>
        </section>

        <section id="location" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Localização</p>
            <h2 style={ui.sectionTitle}>{content.locationTitle}</h2>
          </div>

          <div style={styles.clinicGrid}>
            <div style={styles.card}>
              <div style={{ display: "grid", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8a6030", fontWeight: 800 }}><FaMapMarkerAlt /> Endereço</div>
                <p style={{ margin: 0, color: "#5f6b73", lineHeight: 1.8 }}>{content.locationAddress}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8a6030", fontWeight: 800 }}><FaClock /> Horário de funcionamento</div>
                <p style={{ margin: 0, color: "#5f6b73", lineHeight: 1.8 }}>{content.locationHours}</p>
                <p style={{ margin: 0, color: "#5f6b73", lineHeight: 1.8 }}>{content.locationDetails}</p>
              </div>
            </div>

            <div style={styles.card}>
              <iframe
                title="Mapa da clínica"
                src={content.mapSrc}
                style={styles.mapFrame}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        <section id="gallery" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Galeria</p>
            <h2 style={ui.sectionTitle}>Ambiente, tecnologia e cuidado em imagem</h2>
          </div>

          <div style={{ ...styles.galleryGrid, ...{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" } }} className="landing-gallery-grid">
            {content.gallery.map((img, index) => (
              <img key={index} src={img} alt={`Foto da clínica ${index + 1}`} style={styles.galleryImage} />
            ))}
          </div>
        </section>

        <section id="testimonials" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Depoimentos</p>
            <h2 style={ui.sectionTitle}>Experiências de quem confia no cuidado</h2>
          </div>

          <div style={{ ...styles.testimonialGrid, ...{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" } }} className="landing-testimonial-grid">
            {content.testimonials.map((item, index) => (
              <article key={`${item}-${index}`} className="landing-testimonial-card" style={ui.card}>
                <div style={styles.stars}>
                  <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
                </div>
                <p style={{ margin: 0, color: "#5f6b73", lineHeight: 1.8 }}>
                  “{item}”
                </p>
                <p style={{ marginTop: "16px", color: "#8a6030", fontWeight: 800 }}>Paciente satisfeita</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>FAQ</p>
            <h2 style={ui.sectionTitle}>Perguntas frequentes</h2>
          </div>

          <div style={styles.faqGrid}>
            {content.faqs.map((item) => (
              <details key={item.question} style={ui.faqItem}>
                <summary style={{ cursor: "pointer", fontWeight: 800, color: "#2b1f14" }}>{item.question}</summary>
                <p style={{ margin: "12px 0 0", color: "#5f6b73", lineHeight: 1.8 }}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" style={{ ...styles.wrap, ...styles.section }}>
          <div style={styles.sectionHead}>
            <p style={ui.sectionEyebrow}>Contato</p>
            <h2 style={ui.sectionTitle}>Entre em contato e agende sua consulta</h2>
          </div>

          <div style={{ ...styles.contactGrid, ...{ gridTemplateColumns: "1fr 0.8fr" } }} className="landing-contact">
            <div style={styles.card}>
              <form>
                <label style={{ color: "#6b4f2a", fontWeight: 700 }}>Nome</label>
                <input style={styles.input} type="text" placeholder="Seu nome" aria-label="Nome" />

                <label style={{ color: "#6b4f2a", fontWeight: 700, display: "block", marginTop: "14px" }}>E-mail</label>
                <input style={styles.input} type="email" placeholder="seu@email.com" aria-label="E-mail" />

                <label style={{ color: "#6b4f2a", fontWeight: 700, display: "block", marginTop: "14px" }}>Mensagem</label>
                <textarea style={styles.textarea} placeholder="Como podemos ajudar?" aria-label="Mensagem"></textarea>

                <button type="button" style={{ ...styles.primaryButton, marginTop: "18px" }}>Enviar mensagem</button>
              </form>
            </div>

            <div style={styles.card}>
              <p style={{ margin: 0, color: "#8a6030", fontWeight: 800 }}>Canal direto</p>
              <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FaPhoneAlt /> (11) 99999-9999</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FaEnvelope /> drasofia@dermacare.com</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FaInstagram /> Instagram</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FaFacebookF /> Facebook</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><FaLinkedinIn /> LinkedIn</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer style={ui.footer}>
        <div style={{ ...styles.wrap, ...styles.footerGrid }}>
          <div>
            <div style={{ fontWeight: 800, color: theme.footerText }}>{content.footerName}</div>
            <div style={{ marginTop: "6px", color: theme.footerText }}>{content.footerDescription}</div>
          </div>
          <div style={styles.footerLinks}>
            <a href="#" style={ui.footerText}>Política de Privacidade</a>
            <a href="#" style={ui.footerText}>Termos de Uso</a>
          </div>
        </div>
      </footer>

      <a className="landing-link" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" style={styles.floatingWpp} aria-label="Falar no WhatsApp">
        <FaWhatsapp size={25} />
      </a>

      {showTop && (
        <button onClick={scrollToTop} style={styles.topButton} aria-label="Voltar ao topo">
          <FaArrowUp />
        </button>
      )}

      <AgendamentoModal
        isOpen={modalAgendamento}
        onClose={() => setModalAgendamento(false)}
        defaultClinica={variant === "dermatologia" ? "dermato" : "odonto"}
      />
    </div>
  );
}

export default Landing;
