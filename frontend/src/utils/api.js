import axios from 'axios';

// On Vercel, the frontend and backend are on the same domain
// In development, it points to localhost:5000
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
