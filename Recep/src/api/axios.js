import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/",
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/",
});

let renovando = false;
let filaEspera = [];

function processarFila(erro, novoToken) {
  filaEspera.forEach(({ resolve, reject }) => {
    if (erro) reject(erro);
    else resolve(novoToken);
  });
  filaEspera = [];
}

function irParaLogin() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

api.interceptors.request.use((config) => {
  if (config.url) {
    const queryIndex = config.url.indexOf("?");
    const path = queryIndex === -1 ? config.url : config.url.slice(0, queryIndex);
    const query = queryIndex === -1 ? "" : config.url.slice(queryIndex);
    if (!path.endsWith("/")) {
      config.url = `${path}/${query}`;
    }
  }

  config.headers["ngrok-skip-browser-warning"] = "true"; // linha nova

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const foi401 = error.response?.status === 401;
    const jaTentouDeNovo = originalRequest._retry;
    const eraORequestDeToken = originalRequest.url?.includes("token/");

    if (!foi401 || jaTentouDeNovo || eraORequestDeToken) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      irParaLogin();
      return Promise.reject(error);
    }

    if (renovando) {
      return new Promise((resolve, reject) => {
        filaEspera.push({ resolve, reject });
      }).then((novoToken) => {
        originalRequest.headers.Authorization = `Bearer ${novoToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    renovando = true;

    try {
      const res = await refreshApi.post("token/refresh/", { refresh: refreshToken });
      const novoAccessToken = res.data.access;
      localStorage.setItem("access_token", novoAccessToken);
      processarFila(null, novoAccessToken);
      originalRequest.headers.Authorization = `Bearer ${novoAccessToken}`;
      return api(originalRequest);
    } catch (erroRefresh) {
      processarFila(erroRefresh, null);
      irParaLogin();
      return Promise.reject(erroRefresh);
    } finally {
      renovando = false;
    }
  }
);

export default api;