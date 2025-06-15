import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks";

export const getTasks = () => axios.get(API_URL);

export const createTask = ({ content, type }) =>
  axios.post(API_URL, { content, type });

export const markReviewDone = (taskId, reviewIndex) =>
  axios.patch(`${API_URL}/${taskId}/${reviewIndex}`);

export const autoRollback = (taskId) =>
  axios.post(`${API_URL}/${taskId}/auto-rollback`);

export const restoreTask = (taskId) =>
  axios.post(`${API_URL}/${taskId}/restore`);

export const deleteTask = (taskId) =>
  axios.delete(`${API_URL}/${taskId}`);
