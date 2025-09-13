/**
 * Generate a unique ID using crypto.randomUUID if available,
 * fallback to timestamp + random for compatibility
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a short ID for UI purposes
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substr(2, 8);
};

/**
 * Validate if a string is a valid ID format
 */
export const isValidId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  
  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return true;
  
  // Fallback format (timestamp-random)
  const fallbackRegex = /^\d{13}-[a-z0-9]{9}$/;
  return fallbackRegex.test(id);
};
