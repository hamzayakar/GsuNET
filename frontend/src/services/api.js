import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);

    // Fetch user info after login
    const user = await authAPI.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(user));

    return { access_token, user };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  isAuthenticated: () => {
    return localStorage.getItem('access_token') !== null;
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  approve: async (id, status, rejectionReason = null) => {
    const response = await api.put(`/events/${id}/approve`, {
      status,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Clubs API
export const clubsAPI = {
  getAll: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  create: async (clubData) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },

  update: async (id, clubData) => {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/clubs/${id}`);
    return response.data;
  },
};

// Rooms API
export const roomsAPI = {
  getAll: async () => {
    const response = await api.get('/rooms');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  recommend: async (capacity) => {
    const response = await api.get('/rooms/recommend', {
      params: { capacity },
    });
    return response.data;
  },

  create: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  update: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};

export default api;
