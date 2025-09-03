import React, { useState, useEffect, useCallback } from 'react';


export function useAutoLogin() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
