import { useState, useEffect } from 'react';
import { getCustomers } from '../services/customerService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      console.log('Fetched customers:', data);
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { 
    customers, 
    loading, 
    error, 
    refreshCustomers: fetchCustomers 
  };
}; 