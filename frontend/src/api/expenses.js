import client from "./client";

export const getExpenses = (params) => client.get("/expenses/", { params });
export const getExpense = (id) => client.get(`/expenses/${id}`);
export const createExpense = (data) => client.post("/expenses/", data);
export const updateExpense = (id, data) => client.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => client.delete(`/expenses/${id}`);
export const getSummary = () => client.get("/expenses/summary");
export const getCategories = () => client.get("/expenses/categories");
