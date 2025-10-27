// Backend API URL (always production)
export const BACKEND_URL = 'https://aphrodite-admin.onrender.com';

// Type for MongoDB image object
interface MongoImage {
  _id: string;
  data?: Buffer | { type: string; data: number[] };
  contentType?: string;
  alt?: string;
  isPrimary?: boolean;
}

// Image URL builder helper
export const getImageUrl = (path?: string | MongoImage | null) => {
  // Always use production URL for images
  const baseUrl = 'https://aphrodite-admin.onrender.com';

  // Always use absolute URL for placeholder
  const ABS_PLACEHOLDER = 'https://aphrodite-admin.onrender.com/images/placeholder.svg';

  // Handle undefined, null, or empty input
  if (!path) return ABS_PLACEHOLDER;

  try {
    // If path is a string
    if (typeof path === 'string') {
      // Return as-is if it's already a full URL or our placeholder
      if (path.startsWith('http') || path === ABS_PLACEHOLDER) return path;

      // For placeholder relative path
      if (path === '/images/placeholder.svg') return ABS_PLACEHOLDER;

      // For relative API paths
      if (path.startsWith('/api/')) {
        return `${baseUrl}${path}`;
      }

      // For other relative paths
      return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    }

    // For legacy compatibility - if we still get a MongoDB image object
    if (typeof path === 'object' && '_id' in path) {
      console.warn('Received raw image object instead of URL:', path);
      return ABS_PLACEHOLDER;
    }

    // If we get here, the path format is not recognized
    console.warn('Unrecognized image path format:', path);
    return ABS_PLACEHOLDER;
  } catch (error: unknown) {
    console.warn('Invalid image path:', path, error);
    return ABS_PLACEHOLDER;
  }
};

// Placeholder image when product image is not available
export const PLACEHOLDER_IMAGE = 'https://aphrodite-admin.onrender.com/images/placeholder.svg';