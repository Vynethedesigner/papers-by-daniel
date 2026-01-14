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

    const idStr = String(imageId);
    console.log(`Tracking download for: ${title} (ID: ${idStr})`);

    try {
        // Try to increment existing record via RPC
        const { data, error } = await supabase.rpc('increment_download', { image_id_input: idStr });

        if (error) {
            console.warn("RPC 'increment_download' failed, trying fallback:", error.message);

            // Fallback: Fetch -> Increment -> Upsert
            const { data: currentStats, error: fetchError } = await supabase
                .from('image_stats')
                .select('downloads')
                .eq('id', idStr)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'not found'
                console.error('Error fetching stats for fallback:', fetchError);
                return;
            }

            const currentDownloads = currentStats ? currentStats.downloads : 0;
            const newDownloads = currentDownloads + 1;

            const { error: upsertError } = await supabase
                .from('image_stats')
                .upsert({ id: idStr, title: title, downloads: newDownloads });

            if (upsertError) {
                console.error('Error tracking download (fallback):', upsertError);
            } else {
                console.log(`Download tracked via fallback (New count: ${newDownloads})`);
            }
        } else {
            console.log('Download tracked successfully via RPC.');
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
