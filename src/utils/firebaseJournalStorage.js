// Firebase utility functions for journal entries
import { database } from '../contexts/AuthContext';
import { ref, set, get, remove, query, orderByKey } from 'firebase/database';

/**
 * Get all journal entries for a user
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Object>} Object with dates as keys and entry data as values
 */
export const getAllEntries = async (userId) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return {};
    }

    const entriesRef = ref(database, `journals/${userId}`);
    const snapshot = await get(entriesRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error('Error reading from Firebase:', error);
    return {};
  }
};

/**
 * Get a specific journal entry by date
 * @param {string} userId - User ID from Firebase Auth
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<Object|null>} Entry object or null if not found
 */
export const getEntryByDate = async (userId, date) => {
  try {
    if (!userId || !date) {
      console.error('User ID and date are required');
      return null;
    }

    const entryRef = ref(database, `journals/${userId}/${date}`);
    const snapshot = await get(entryRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error reading from Firebase:', error);
    return null;
  }
};

/**
 * Save a journal entry
 * @param {string} userId - User ID from Firebase Auth
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {Object} entry - Entry object with text, mood, etc.
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const saveEntry = async (userId, date, entry) => {
  try {
    if (!userId || !date) {
      console.error('User ID and date are required');
      return false;
    }

    const entryRef = ref(database, `journals/${userId}/${date}`);
    await set(entryRef, {
      ...entry,
      date,
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
};

/**
 * Delete a journal entry
 * @param {string} userId - User ID from Firebase Auth
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const deleteEntry = async (userId, date) => {
  try {
    if (!userId || !date) {
      console.error('User ID and date are required');
      return false;
    }

    const entryRef = ref(database, `journals/${userId}/${date}`);
    await remove(entryRef);

    return true;
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    return false;
  }
};

/**
 * Check if an entry exists for a specific date
 * @param {string} userId - User ID from Firebase Auth
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Promise<boolean>} True if entry exists, false otherwise
 */
export const hasEntryForDate = async (userId, date) => {
  const entry = await getEntryByDate(userId, date);
  return !!entry;
};

/**
 * Get all dates that have entries
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Array>} Array of date strings
 */
export const getDatesWithEntries = async (userId) => {
  try {
    const entries = await getAllEntries(userId);
    return Object.keys(entries).sort();
  } catch (error) {
    console.error('Error getting dates:', error);
    return [];
  }
};

/**
 * Get entries for a specific month
 * @param {string} userId - User ID from Firebase Auth
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @returns {Promise<Object>} Object with dates as keys and entry data as values
 */
export const getEntriesForMonth = async (userId, year, month) => {
  try {
    const entries = await getAllEntries(userId);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    return Object.keys(entries)
      .filter(date => date.startsWith(monthStr))
      .reduce((acc, date) => {
        acc[date] = entries[date];
        return acc;
      }, {});
  } catch (error) {
    console.error('Error getting month entries:', error);
    return {};
  }
};

/**
 * Export all entries as JSON
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<string>} JSON string of all entries
 */
export const exportEntries = async (userId) => {
  const entries = await getAllEntries(userId);
  return JSON.stringify(entries, null, 2);
};
