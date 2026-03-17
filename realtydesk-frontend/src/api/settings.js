import api from "./client.js";

export const settingsApi = {
  get:    ()     => api.get("/settings").then((r) => r.data),
  update: (data) => api.put("/settings", data).then((r) => r.data),
};

export const dashboardApi = {
  get: () => api.get("/dashboard").then((r) => r.data),
};
