/**
 * useVideos - Custom hook for managing video list data.
 * Handles fetching, loading, error states, and polling.
 */
import { useState, useEffect, useCallback } from 'react';
import { videoService } from '../api/services';

export function useVideos(pollInterval = 10000) {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);

    const fetchVideos = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const response = await videoService.list();
            setVideos(response.data || []);
        } catch (err) {
            if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
                setError('backend_offline');
            } else if (err.response?.status === 401) {
                setError('unauthorized');
            } else {
                setError('fetch_failed');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Poll for updates (silent refresh)
    useEffect(() => {
        if (!pollInterval) return;
        const interval = setInterval(() => fetchVideos(true), pollInterval);
        return () => clearInterval(interval);
    }, [fetchVideos, pollInterval]);

    // Check if any video is currently processing
    const hasProcessing = videos.some(v => v.status === 'processing');

    const clearAll = useCallback(async () => {
        try {
            await videoService.clearAll();
            setVideos([]);
            return true;
        } catch (err) {
            console.error("Failed to clear detections:", err);
            return false;
        }
    }, []);

    return {
        videos,
        loading,
        error,
        hasProcessing,
        refetch: () => fetchVideos(false),
        silentRefetch: () => fetchVideos(true),
        clearAll,
    };
}
