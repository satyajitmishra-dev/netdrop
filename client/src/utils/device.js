/**
 * Generates a short, consistent device name based on type and ID
 * @param {Object} peer - The peer object containing type and id
 * @returns {string} - Short name like "PC-A7F" or "Mobile-3B2"
 */

// Check if it's a default generated name (e.g. "Windows PC-123", "Android-456")
export const isDefaultDeviceName = (name) => {
    return /^(Windows PC|MacBook|Android|iPhone|Linux PC|Device)-\d+$/.test(name);
};

export const getShortName = (peer) => {
    if (!peer) return 'Unknown Device';

    const name = peer.name || '';

    // If it's a default name, we override it with our cleaner "PC-A7F" format based on ID.
    // If it's a custom name (e.g. "Dev", "Sam's Laptop"), we show it as is.
    const isDefault = isDefaultDeviceName(name);

    if (name && !isDefault) {
        // It's a custom name, use it (truncate if too long)
        return name.length > 12 ? `${name.slice(0, 12)}...` : name;
    }

    // Fallback: Generate short ID-based name
    const type = peer.type?.toLowerCase() || 'desktop';
    let typeLabel = 'PC';

    if (type === 'mobile') typeLabel = 'Mobile';
    else if (type === 'tablet') typeLabel = 'Tablet';

    // Use last 3 chars of ID for uniqueness, uppercase
    const shortId = peer.id?.slice(-3).toUpperCase() || '???';

    return `${typeLabel}-${shortId}`;
};
