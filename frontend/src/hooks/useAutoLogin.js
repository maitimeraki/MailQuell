import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAutoLogin() {
<<<<<<< HEAD
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
=======
    const navigate= useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
>>>>>>> 9550382a8e59c60e6142fafcd2b946dd2a9b5abb
    const autologin = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auto-login`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to autologin');
            }
            const data = await response.json();
            // Handle successful autologin
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { autologin() }, [autologin])
}
