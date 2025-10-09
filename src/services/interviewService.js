// services/interviewService.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Get user's interviews with filtering and pagination
export const getUserInterviews = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.order) queryParams.append('order', params.order);
  
  const endpoint = `/interviews?${queryParams.toString()}`;
  return apiCall(endpoint);
};

// Get all user interviews
export const getAllInterviews = async () => {
  return apiCall('/interviews');
};

// Get interview statistics
export const getInterviewStats = async () => {
  return apiCall('/interviews/stats');
};

// Get specific interview details
export const getInterviewDetails = async (interviewId) => {
  return apiCall(`/interviews/${interviewId}`);
};

// Start new interview
export const startInterview = async (interviewData) => {
  return apiCall('/interviews/start', {
    method: 'POST',
    body: JSON.stringify(interviewData),
  });
};

// Generate prepared question
export const generatePreparedQuestion = async (interviewId, roundNumber) => {
  return apiCall('/llm/generate-prepared-question', {
    method: 'POST',
    body: JSON.stringify({ interviewId, roundNumber }),
  });
};

// Generate context-aware follow-up question
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

// Complete round
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
    return response.data;
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      accuracy: "partial",
      summary: "Answer recorded",
      feedback: "Thank you for your response.",
      needsFollowUp: false,
      followUpType: "none",
      score: 5
    };
  }
};