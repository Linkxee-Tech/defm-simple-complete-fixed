import api from "./api"

export const login = (data) => api.post("/auth/login", data)
export const refreshToken = () => api.post("/auth/refresh")
export const me = () => api.get("/auth/me")
