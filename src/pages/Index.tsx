import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '@/lib/mockData';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredAuth();
    if (user) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return null;
}
