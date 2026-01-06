import { useState, useCallback, useMemo } from 'react';
import { PasswordEntry, PasswordInsert } from '@/lib/types/models';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

import { API_CONFIG } from '@/lib/config/app-config';

const API_URL = API_CONFIG.BASE_URL;

export const usePasswordsNeon = () => {
    const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showError } = useToastNotifications();

    const fetchPasswords = useCallback(async (query: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const url = query ? `${API_URL}?searchQuery=${encodeURIComponent(query)}` : API_URL;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch passwords');
            const data = await response.json();
            // Map database fields (snake_case) to model fields (camelCase)
            const mappedData = data.map((item: any) => ({
                id: item.id,
                service: item.service,
                username: item.username,
                password: item.password,
                createdAt: item.created_at,
                updatedAt: item.updated_at
            }));
            setPasswords(mappedData);
        } catch (err) {
            console.error(err);
            setError('Unable to load passwords');
            showError("Could not load passwords from server");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const addPassword = async (entry: PasswordInsert) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
            if (!response.ok) throw new Error('Failed to add password');
            await fetchPasswords(); // Refresh list
        } catch (err) {
            throw err;
        }
    };

    const updatePassword = async (id: string, entry: Partial<PasswordInsert>) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
            if (!response.ok) throw new Error('Failed to update password');
            await fetchPasswords();
        } catch (err) {
            throw err;
        }
    };

    const deletePassword = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete password');
            await fetchPasswords();
        } catch (err) {
            throw err;
        }
    };

    // Initial fetch
    useMemo(() => {
        fetchPasswords();
    }, [fetchPasswords]);

    const stats = useMemo(() => ({
        total: passwords.length,
        hasPasswords: passwords.length > 0
    }), [passwords]);

    return {
        passwords,
        loading,
        error,
        stats,
        searchPasswords: fetchPasswords,
        addPassword,
        updatePassword,
        deletePassword
    };
};
