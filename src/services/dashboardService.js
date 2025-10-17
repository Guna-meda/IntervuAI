// dashboardService.js
import { UserLevel } from '../models/UserLevel.model.js';
import { Interview } from '../models/interview.model.js';

export const getDashboardData = async (userId) => {
  try {
    const [userLevel, recentInterviews, stats] = await Promise.all([
      UserLevel.findOne({ user: userId }),
      Interview.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      getInterviewStats(userId)
    ]);

    const nextLevel = getNextLevel(userLevel?.currentLevel || 1);
    const interviewsToNextLevel = nextLevel ? Math.max(nextLevel.required - (userLevel?.completedInterviews || 0), 0) : 0;

    // Calculate readiness score based on actual data
    const readinessScore = calculateReadinessScore(userLevel, stats);

    return {
      userLevel: userLevel || { currentLevel: 1, completedInterviews: 0 },
      recentInterviews,
      stats,
      interviewsToNextLevel,
      readinessScore,
      badges: userLevel?.badges || []
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const getNextLevel = (currentLevel) => {
  const levels = {
    1: { required: 5, name: 'Intermediate' },
    2: { required: 20, name: 'Advanced' },
    3: { required: 50, name: 'Expert' },
    4: { required: 75, name: 'Master' },
    5: null
  };
  return levels[currentLevel];
};

const getInterviewStats = async (userId) => {
  const interviews = await Interview.find({ user: userId });
  
  return {
    totalInterviews: interviews.length,
    averageScore: calculateAverageScore(interviews),
    completionRate: calculateCompletionRate(interviews),
    currentStreak: calculateCurrentStreak(interviews),
    performanceScore: calculatePerformanceScore(interviews)
  };
};

const calculateAverageScore = (interviews) => {
  if (interviews.length === 0) return 0;
  const totalScore = interviews.reduce((sum, interview) => sum + (interview.overallScore || 0), 0);
  return Math.round(totalScore / interviews.length);
};

const calculateCompletionRate = (interviews) => {
  if (interviews.length === 0) return 0;
  const completed = interviews.filter(interview => interview.status === 'completed').length;
  return Math.round((completed / interviews.length) * 100);
};

const calculateCurrentStreak = (interviews) => {
  // Implement streak logic based on consecutive days with completed interviews
  const completedInterviews = interviews
    .filter(interview => interview.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  let streak = 0;
  let currentDate = new Date();
  
  for (let interview of completedInterviews) {
    const interviewDate = new Date(interview.createdAt).toDateString();
    if (interviewDate === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

const calculatePerformanceScore = (interviews) => {
  if (interviews.length === 0) return 0;
  const recentInterviews = interviews.slice(0, 5); // Last 5 interviews
  const totalScore = recentInterviews.reduce((sum, interview) => sum + (interview.overallScore || 0), 0);
  return Math.round(totalScore / recentInterviews.length);
};

const calculateReadinessScore = (userLevel, stats) => {
  if (!userLevel) return 0;
  
  const practiceVolume = Math.min(userLevel.completedInterviews * 2, 40);
  const performanceScore = Math.min(stats.averageScore * 0.35, 35);
  const consistencyBonus = stats.completionRate >= 80 ? 25 : Math.min(stats.completionRate * 0.25, 25);
  
  return Math.min(practiceVolume + performanceScore + consistencyBonus, 100);
};