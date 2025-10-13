// services/interviewService.js
import { auth } from '../firebase/config';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  let token;
  try {
    if (auth?.currentUser) {
      token = await auth.currentUser.getIdToken(true);
      localStorage.setItem('token', token);
    } else {
      throw new Error('No authenticated user');
    }
  } catch (err) {
    // Don't force a full-page redirect from a service helper.
    // Let the caller decide how to handle authentication failures (show login, re-auth, etc.).
    console.warn('Could not retrieve token:', err.message);
    throw new Error('Authentication required');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const config = {
    headers,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const text = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return parsed;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export const getUserInterviews = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  
  const endpoint = `/interviews?${queryParams.toString()}`;
  return apiCall(endpoint);
};

export const getAllInterviews = async () => {
  return apiCall('/interviews');
};

export const getInterviewStats = async () => {
  return apiCall('/interviews/stats');
};

export const getInterviewDetails = async (interviewId) => {
  return apiCall(`/interviews/${interviewId}`);
};

export const startInterview = async (interviewData) => {
  return apiCall('/interviews/start', {
    method: 'POST',
    body: JSON.stringify(interviewData),
  });
};

export const startRound = async (interviewId, roundNumber) => {
  return apiCall(`/interviews/${interviewId}/start-round/${roundNumber}`, {
    method: 'POST',
  });
};

export const generatePreparedQuestion = async (interviewId, roundNumber, previousQuestions = []) => {
  return apiCall('/llm/generate-prepared-question', {
    method: 'POST',
    body: JSON.stringify({ interviewId, roundNumber, previousQuestions }),
  });
};

export const generateContextualFollowUp = async (interviewId, roundNumber, currentQuestion, userResponse, previousQuestions, feedbackData, followUpType) => {
  return apiCall('/llm/generate-followup-question', {
    method: 'POST',
    body: JSON.stringify({ 
      interviewId, 
      roundNumber, 
      currentQuestion, 
      userResponse, 
      previousQuestions,
      feedbackData,
      followUpType
    }),
  });
};

export const completeRound = async (interviewId, roundNumber, questions, roundFeedback = '') => {
  return apiCall(`/interviews/${interviewId}/complete-round`, {
    method: 'POST',
    body: JSON.stringify({ roundNumber, questions, roundFeedback }),
  });
};

export const generateAnswerFeedback = async (question, answer, interviewId, roundNumber) => {
  try {
    const response = await apiCall('/llm/generate-feedback', {
      method: 'POST',
      body: JSON.stringify({ question, answer, interviewId, roundNumber }),
    });
    return response.data; // Includes expectedAnswer
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      accuracy: "partial",
      summary: "Answer recorded",
      feedback: "Thank you for your response.",
      expectedAnswer: "A complete and accurate response addressing the core concepts of the question.",
      needsFollowUp: false,
      followUpType: "none",
      score: 5
    };
  }
};

export const getAnalytics = async () => {
  return apiCall('/analytics');
};

export const getPerformanceTrends = async () => {
  return apiCall('/analytics/trends');
};

export const getSkillAnalysis = async () => {
  return apiCall('/analytics/skills');
};