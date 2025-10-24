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
  
  // Handle undefined, null, or empty input
  if (!path) return PLACEHOLDER_IMAGE;
  
  try {
    // If path is a string
    if (typeof path === 'string') {
      // Return as-is if it's already a full URL or our placeholder
      if (path.startsWith('http') || path === PLACEHOLDER_IMAGE) return path;
      
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
      return PLACEHOLDER_IMAGE;
    }
    
    // If we get here, the path format is not recognized
    console.warn('Unrecognized image path format:', path);
    return PLACEHOLDER_IMAGE;
  } catch (error: unknown) {
    console.warn('Invalid image path:', path, error);
    return PLACEHOLDER_IMAGE;
  }
};

// Placeholder image when product image is not available
export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';