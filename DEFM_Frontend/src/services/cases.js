import api from "./api";

const casesService = {
  list(params = {}) {
    return api.get("/cases/", { params });
  },
  getCase(id) {
    return api.get(`/cases/${id}`);
  },
  create(data) {
    return api.post("/cases/", data);
  },
  update(id, data) {
    return api.put(`/cases/${id}`, data);
  },
  remove(id) {
    return api.delete(`/cases/${id}`);
  },
};

export default casesService;
