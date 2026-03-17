import api from "./client.js";

export const transactionsApi = {
  getAll:  (params) => api.get("/transactions", { params }).then((r) => r.data),
  getOne:  (id)     => api.get(`/transactions/${id}`).then((r) => r.data),
  create:  (data)   => api.post("/transactions", data).then((r) => r.data),
  update:  (id, data) => api.put(`/transactions/${id}`, data).then((r) => r.data),
  remove:  (id)     => api.delete(`/transactions/${id}`),
};
