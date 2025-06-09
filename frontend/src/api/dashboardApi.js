import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getDashboardStats = async (periodStart, periodEnd) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      params: {
        periodStart,
        periodEnd
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getPeriods = async () => {
  try {
    const response = await axios.get(`${API_URL}/periods`);
    return response.data;
  } catch (error) {
    console.error('Error fetching periods:', error);
    throw error;
  }
}; 