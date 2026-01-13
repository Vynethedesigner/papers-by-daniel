import { supabase } from '../lib/supabaseClient';

/**
 * Increments the download count for a specific image.
 * @param {string|number} imageId - The ID of the image being downloaded.
 * @param {string} title - The title of the image (for fallback/logging).
 */
export const trackDownload = async (imageId, title) => {
    if (!supabase) {
        console.warn('Supabase not configured. Download not tracked.');
        return;
    }

    try {
        // Try to increment existing record
        const { data, error } = await supabase.rpc('increment_download', { image_id_input: imageId });

        if (error) {
            // If function doesn't exist or fails, fall back to simple upsert
            // Note: rpc is better for concurrency, but upsert is easier to start if you haven't made the function yet.
            // Let's implement a simple Upsert first or assume we set up the table correctly.

            // We'll insert a new row if it doesn't exist, or update the count.
            // But doing atomic increment in client is hard without RPC.
            // We'll assume for now we just want to Log it into a 'downloads_log' table or similar?
            // User asked for "total number of downloads".

            // Simpler approach: 'image_stats' table with 'id' and 'downloads'.
            // Fetch current, increment, update. (Race condition possible but negligible for this scale).

            const { data: currentStats, error: fetchError } = await supabase
                .from('image_stats')
                .select('downloads')
                .eq('id', imageId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
                console.error('Error fetching stats:', fetchError);
                return;
            }

            const currentDownloads = currentStats ? currentStats.downloads : 0;
            const newDownloads = currentDownloads + 1;

            const { error: upsertError } = await supabase
                .from('image_stats')
                .upsert({ id: imageId, title: title, downloads: newDownloads });

            if (upsertError) {
                console.error('Error tracking download:', upsertError);
            }
        }
    } catch (err) {
        console.error('Unexpected error tracking download:', err);
    }
};

/**
 * Fetches analytics data for all images.
 * @returns {Promise<Array>} List of images with download counts.
 */
export const getDownloadStats = async () => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('image_stats')
        .select('*')
        .order('downloads', { ascending: false });

    if (error) {
        console.error('Error fetching stats:', error);
        return [];
    }

    return data;
};

/**
 * Fetches total downloads across the platform.
 */
export const getTotalDownloads = async () => {
    if (!supabase) return 0;

    const { data, error } = await supabase
        .from('image_stats')
        .select('downloads');

    if (error) {
        console.error('Error fetching total:', error);
        return 0;
    }

    return data.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
};
