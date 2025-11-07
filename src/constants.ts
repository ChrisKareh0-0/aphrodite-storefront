// Backend API URL - prefer NEXT_PUBLIC_BACKEND_URL env var, otherwise default to the online backend.
// This makes the storefront use the online backend in development unless you override it.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aphrodite-admin.onrender.com';

// Type for MongoDB image object
interface MongoImage {
  _id: string;
  path?: string;
  data?: Buffer | { type: string; data: number[] };
  contentType?: string;
  alt?: string;
  isPrimary?: boolean;
}

// Image URL builder helper

export const getImageUrl = (path?: string | MongoImage | null) => {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aphrodite-admin.onrender.com';
  const ABS_PLACEHOLDER = `${baseUrl}/images/placeholder.svg`;
  if (!path) return ABS_PLACEHOLDER;
  try {
    if (typeof path === 'string') {
      if (path.startsWith('http') || path === ABS_PLACEHOLDER) return path;
      if (path === '/images/placeholder.svg') return ABS_PLACEHOLDER;
      // For /uploads/products/ relative path, always prepend backend URL
      if (path.startsWith('/uploads/products/')) {
        return `${baseUrl}${path}`;
      }
      // For products/ relative path (no leading slash)
      if (path.startsWith('products/')) {
        return `${baseUrl}/uploads/${path}`;
      }
      // For relative API paths
      if (path.startsWith('/api/')) {
        return `${baseUrl}${path}`;
      }
      // For other relative paths
      return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    }
    if (typeof path === 'object' && '_id' in path) {
      // If MongoImage object, try to use .path if present
      if (path.path) {
        return `${baseUrl}/uploads/${path.path}`;
      }
      return ABS_PLACEHOLDER;
    }
    console.warn('Unrecognized image path format:', path);
    return ABS_PLACEHOLDER;
  } catch (error: unknown) {
    console.warn('Invalid image path:', path, error);
    return ABS_PLACEHOLDER;
  }
};

// Placeholder image when product image is not available
export const PLACEHOLDER_IMAGE = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://aphrodite-admin.onrender.com') + '/images/placeholder.svg';