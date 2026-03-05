import axiosInstance from '../lib/axios.js';

export const subscriptionService = {
  /**
   * Check subscription status
   * @returns {Promise} Subscription status data
   */
  async checkStatus() {
    const response = await axiosInstance.get('/subscription/status');
    return response.data;
  },

  /**
   * Get payment URL
   * @returns {Promise} Payment URL
   */
  async getPaymentUrl() {
    const response = await axiosInstance.get('/subscription/payment-url');
    return response.data;
  }
};

export default subscriptionService;
