/**
 * CycleWise — API Service Layer
 * All backend calls organized by domain.
 */

import api from './axiosInstance';

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const authAPI = {
  register: (data) =>
    api.post('/auth/register', data),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// ─────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────
export const userAPI = {
  submitOnboarding: (data) =>
    api.post('/user/onboarding', data),

  getProfile: () =>
    api.get('/user/profile'),

  getCycleInfo: () =>
    api.get('/user/cycle-info'),
};

// ─────────────────────────────────────────────
// PREDICTIONS
// ─────────────────────────────────────────────
export const predictAPI = {
  predictPCOS: () =>
    api.get('/predict/pcos'),

  getRecommendations: () =>
    api.get('/predict/recommendation'),

  analyzeReport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/predict/report-analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCyclePrediction: () =>
    api.get('/predict/cycle-phase'),
};
// ─────────────────────────────────────────────
// DOCTOR CONSULTATION (nearby hospitals)
// ─────────────────────────────────────────────
export const consultationAPI = {
  getNearbyHospitals: ({ lat, lon, placeName, radiusM, topN } = {}) =>
    api.post('/consultation/nearby', {
      lat,
      lon,
      place_name: placeName,
      radius_m: radiusM || 5000,
      top_n: topN || 5,
    }),
};