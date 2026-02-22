import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Class APIs
export const classAPI = {
  createClass: (classData) => api.post('/classes', classData),
  getClasses: () => api.get('/classes'),
  getClassById: (id) => api.get(`/classes/${id}`),
  updateClass: (id, classData) => api.put(`/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  enrollInClass: (classCode) => api.post('/classes/enroll', { classCode }),
  leaveClass: (id) => api.post(`/classes/${id}/leave`),
  getClassStudents: (id) => api.get(`/classes/${id}/students`),
};


// Assignment APIs
export const assignmentAPI = {
  createAssignment: (data) => api.post('/assignments', data),
  getClassAssignments: (classId) => api.get(`/assignments/class/${classId}`),
  getAssignmentById: (id) => api.get(`/assignments/${id}`),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  submitAssignment: (id, submission) => api.post(`/assignments/${id}/submit`, submission),
  gradeSubmission: (assignmentId, studentId, gradeData) => 
    api.put(`/assignments/${assignmentId}/grade/${studentId}`, gradeData),
  getMySubmissions: (classId) => api.get(`/assignments/student/my-submissions/${classId}`),
  getAssignmentStats: (id) => api.get(`/assignments/${id}/stats`)
};



export default api;