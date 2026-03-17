import api from "./client.js";

export const expensesApi = {
  getAll:  (params) => api.get("/expenses", { params }).then((r) => r.data),
  create:  (data)   => api.post("/expenses", data).then((r) => r.data),
  update:  (id, data) => api.put(`/expenses/${id}`, data).then((r) => r.data),
  remove:  (id)     => api.delete(`/expenses/${id}`),
};
