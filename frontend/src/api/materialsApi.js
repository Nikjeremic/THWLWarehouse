import api from './apiConfig';

export const getMaterials = async (params = {}) => {
  const response = await api.get('/materials', { params });
  return response.data;
};

export const getMaterialById = async (id) => {
  const response = await api.get(`/materials/${id}`);
  return response.data;
};

export const createMaterial = async (materialData) => {
  const response = await api.post('/materials', materialData);
  return response.data;
};

export const updateMaterial = async (id, materialData) => {
  const response = await api.put(`/materials/${id}`, materialData);
  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};

export const getMaterialConsumptions = async (id, params = {}) => {
  const response = await api.get(`/materials/${id}/consumptions`, { params });
  return response.data;
};

export const createMaterialConsumption = async (id, consumptionData) => {
  const response = await api.post(`/materials/${id}/consumptions`, consumptionData);
  return response.data;
};

export const updateMaterialConsumption = async (id, consumptionId, consumptionData) => {
  const response = await api.put(`/materials/${id}/consumptions/${consumptionId}`, consumptionData);
  return response.data;
};

export const deleteMaterialConsumption = async (id, consumptionId) => {
  const response = await api.delete(`/materials/${id}/consumptions/${consumptionId}`);
  return response.data;
};

export const getMaterialReport = async (params = {}) => {
  const response = await api.get('/materials/report', { params });
  return response.data;
};

export const getMaterialTransactions = async (materialId, startDate, endDate) => {
  try {
    const response = await api.get(`/materials/${materialId}/transactions`, {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching material transactions:', error);
    throw error;
  }
};

export const createTransaction = async (materialId, transactionData) => {
  try {
    const response = await api.post(`/materials/${materialId}/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (materialId, transactionId, transactionData) => {
  try {
    const response = await api.put(
      `/materials/${materialId}/transactions/${transactionId}`,
      transactionData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (materialId, transactionId) => {
  try {
    const response = await api.delete(
      `/materials/${materialId}/transactions/${transactionId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}; 