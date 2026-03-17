import api from "./client.js";

export const documentsApi = {
  getAll:  (params) => api.get("/documents", { params }).then((r) => r.data),
  create:  (data)   => api.post("/documents", data).then((r) => r.data),
  remove:  (id)     => api.delete(`/documents/${id}`),
};
