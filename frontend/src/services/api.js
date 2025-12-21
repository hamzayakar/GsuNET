import axios from 'axios';

// Base API URL - loaded from environment variable
// Fallback to localhost if not set
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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

  cancel: async (id) => {
    const response = await api.put(`/events/${id}/cancel`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Event registration endpoints
  register: async (eventId) => {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  },

  unregister: async (eventId) => {
    const response = await api.delete(`/events/${eventId}/unregister`);
    return response.data;
  },

  getRegistrations: async (eventId) => {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  getMyRegistrations: async () => {
    const response = await api.get('/users/me/registrations');
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

  // Club follow/unfollow
  follow: async (id) => {
    const response = await api.post(`/clubs/${id}/follow`);
    return response.data;
  },

  unfollow: async (id) => {
    const response = await api.delete(`/clubs/${id}/unfollow`);
    return response.data;
  },

  getFollowers: async (id) => {
    const response = await api.get(`/clubs/${id}/followers`);
    return response.data;
  },

  getMyFollowedClubs: async () => {
    const response = await api.get('/users/me/followed-clubs');
    return response.data;
  },

  getManagedClubs: async () => {
    const response = await api.get('/users/me/managed-clubs');
    return response.data;
  },

  getMyMemberClubs: async () => {
    const response = await api.get('/users/me/member-clubs');
    return response.data;
  },

  getMembers: async (id) => {
    const response = await api.get(`/clubs/${id}/members`);
    return response.data;
  },

  removeMember: async (clubId, userId) => {
    const response = await api.delete(`/clubs/${clubId}/members/${userId}`);
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

  recommendEnhanced: async (capacity, eventDate, startTime, duration) => {
    const response = await api.get('/rooms/recommend', {
      params: {
        capacity,
        event_date: eventDate,
        start_time: startTime,
        duration,
      },
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

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// User Management API (Admin only)
export const usersAPI = {
  // Get all users (admin only)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  // Get user by ID (admin only)
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (admin only)
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Club Join Requests API
export const clubJoinRequestsAPI = {
  // Create a join request
  create: async (clubId, message = null) => {
    const response = await api.post('/club-join-requests', {
      club_id: clubId,
      message,
    });
    return response.data;
  },

  // Get my join requests
  getMyRequests: async () => {
    const response = await api.get('/club-join-requests/my-requests');
    return response.data;
  },

  // Get join requests for a specific club (managers only)
  getClubRequests: async (clubId) => {
    const response = await api.get(`/club-join-requests/club/${clubId}`);
    return response.data;
  },

  // Review a join request (approve/reject) - managers only
  review: async (requestId, status, rejectionReason = null) => {
    const response = await api.put(`/club-join-requests/${requestId}/review`, {
      status,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  // Cancel a pending join request
  cancel: async (requestId) => {
    const response = await api.delete(`/club-join-requests/${requestId}`);
    return response.data;
  },
};

// Sponsorships API (Review6: AI-powered sponsor matching)
export const sponsorshipsAPI = {
  // Create sponsorship application (sponsor role)
  createApplication: async (applicationData) => {
    const response = await api.post('/sponsorships/apply', applicationData);
    return response;
  },

  // Get my applications (sponsor role)
  getMyApplications: async () => {
    const response = await api.get('/sponsorships/my-applications');
    return response;
  },

  // Get pending applications (admin/advisor role)
  getPendingApplications: async () => {
    const response = await api.get('/sponsorships/pending');
    return response;
  },

  // Review application - approve/reject (admin role)
  reviewApplication: async (requestId, reviewData) => {
    const response = await api.put(`/sponsorships/${requestId}/review`, reviewData);
    return response.data;
  },

  // Get matches for my club (club_manager/advisor role)
  getMyClubMatches: async () => {
    const response = await api.get('/sponsorships/matches/my-club');
    return response.data;
  },

  // Get sponsorship details (authorized users)
  getDetails: async (requestId) => {
    const response = await api.get(`/sponsorships/${requestId}/details`);
    return response.data;
  },
};

export default api;
