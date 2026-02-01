// API client for StayEase backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  getMe: () => apiRequest('/auth/me'),
  
  sendOTP: (phone: string) =>
    apiRequest('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  
  verifyOTP: (phone: string, otp: string) =>
    apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
  
  updateProfile: (data: { name: string; email: string }) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
};

// Rooms API
export const roomsAPI = {
  getRooms: (params?: {
    type?: string;
    area?: string;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    checkIn?: string;
    checkOut?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return apiRequest(`/rooms${query ? `?${query}` : ''}`);
  },
  
  getRoom: (id: string) => apiRequest(`/rooms/${id}`),
  
  checkAvailability: (id: string, checkIn: string, checkOut: string) =>
    apiRequest(`/rooms/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`),
  
  getRoomTypes: () => apiRequest('/rooms/types'),
};

// Bookings API
export const bookingsAPI = {
  createBooking: (data: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    guestDetails: {
      name: string;
      email: string;
      phone: string;
      specialRequests?: string;
    };
  }) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  
  verifyPayment: (bookingId: string, paymentData: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => apiRequest(`/bookings/${bookingId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  
  getMyBookings: () => apiRequest('/bookings/my-bookings'),
  
  getBooking: (id: string) => apiRequest(`/bookings/${id}`),
  
  cancelBooking: (id: string, reason?: string) =>
    apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),
};

// Admin API
export const adminAPI = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getRevenueAnalytics: (period?: string) =>
    apiRequest(`/admin/analytics/revenue${period ? `?period=${period}` : ''}`),
  getOccupancyAnalytics: () => apiRequest('/admin/analytics/occupancy'),
  getUsers: () => apiRequest('/admin/users'),
  
  // Room management
  createRoom: (data: unknown) =>
    apiRequest('/rooms', { method: 'POST', body: JSON.stringify(data) }),
  updateRoom: (id: string, data: unknown) =>
    apiRequest(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoom: (id: string) =>
    apiRequest(`/rooms/${id}`, { method: 'DELETE' }),
  
  // Booking management
  getAllBookings: (params?: { status?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
    }
    const query = searchParams.toString();
    return apiRequest(`/bookings${query ? `?${query}` : ''}`);
  },
  updateBookingStatus: (id: string, status: string) =>
    apiRequest(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// Chatbot API
export const chatbotAPI = {
  chat: (message: string, language?: string, sessionId?: string) =>
    apiRequest('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, sessionId }),
    }),
  
  checkAvailability: (checkIn: string, checkOut: string, roomType?: string) =>
    apiRequest('/chatbot/check-availability', {
      method: 'POST',
      body: JSON.stringify({ checkIn, checkOut, roomType }),
    }),
  
  clearHistory: (sessionId: string) =>
    apiRequest(`/chatbot/history/${sessionId}`, { method: 'DELETE' }),
};

// Payments API
export const paymentsAPI = {
  getKey: () => apiRequest('/payments/key'),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data: {
    bookingId: string;
    rating: number;
    title: string;
    comment: string;
  }) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  
  getRoomReviews: (roomId: string) => apiRequest(`/reviews/room/${roomId}`),
  
  getMyReviews: () => apiRequest('/reviews/my-reviews'),
  
  canReview: (bookingId: string) => apiRequest(`/reviews/can-review/${bookingId}`),
  
  updateReview: (id: string, data: { rating: number; title: string; comment: string }) =>
    apiRequest(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteReview: (id: string) =>
    apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
};
