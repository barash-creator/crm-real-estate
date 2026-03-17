import api from "./client.js";

export const meetingsApi = {
  getAll:  (params) => api.get("/meetings", { params }).then((r) => r.data),
  create:  (data)   => api.post("/meetings", data).then((r) => r.data),
  update:  (id, data) => api.put(`/meetings/${id}`, data).then((r) => r.data),
  remove:  (id)     => api.delete(`/meetings/${id}`),
};
