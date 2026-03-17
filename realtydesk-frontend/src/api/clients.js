import api from "./client.js";

export const clientsApi = {
  getAll:      (params) => api.get("/clients", { params }).then((r) => r.data),
  getOne:      (id)     => api.get(`/clients/${id}`).then((r) => r.data),
  create:      (data)   => api.post("/clients", data).then((r) => r.data),
  update:      (id, data) => api.put(`/clients/${id}`, data).then((r) => r.data),
  remove:      (id)     => api.delete(`/clients/${id}`),
  updateStage: (id, stage) => api.patch(`/clients/${id}/stage`, { stage }).then((r) => r.data),
  addNote:     (id, body)  => api.post(`/clients/${id}/notes`, { body }).then((r) => r.data),
  deleteNote:  (clientId, noteId) => api.delete(`/clients/${clientId}/notes/${noteId}`),
};
