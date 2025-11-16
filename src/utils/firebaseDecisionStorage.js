// Firebase utility functions for decision storage
import { database } from '../contexts/AuthContext';
import { ref, set, get, push, query, orderByChild, limitToLast } from 'firebase/database';

/**
 * Save a decision to Firebase
 * @param {string} userId - User ID from Firebase Auth
 * @param {Object} decisionData - Decision data object
 * @returns {Promise<string|null>} Decision ID if successful, null otherwise
 */
export const saveDecision = async (userId, decisionData) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return null;
    }

    // Create a new decision entry with auto-generated ID
    const decisionsRef = ref(database, `decisions/${userId}`);
    const newDecisionRef = push(decisionsRef);

    const decision = {
      ...decisionData,
      id: newDecisionRef.key,
      timestamp: new Date().toISOString(),
      userId
    };

    await set(newDecisionRef, decision);
    console.log('Decision saved successfully:', newDecisionRef.key);

    return newDecisionRef.key;
  } catch (error) {
    console.error('Error saving decision to Firebase:', error);
    return null;
  }
};

/**
 * Get all decisions for a user
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Array>} Array of decision objects
 */
export const getAllDecisions = async (userId) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return [];
    }

    const decisionsRef = ref(database, `decisions/${userId}`);
    const snapshot = await get(decisionsRef);

    if (snapshot.exists()) {
      const decisionsObj = snapshot.val();
      // Convert to array and sort by timestamp (newest first)
      return Object.values(decisionsObj).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
    }
    return [];
  } catch (error) {
    console.error('Error reading decisions from Firebase:', error);
    return [];
  }
};

/**
 * Get a specific decision by ID
 * @param {string} userId - User ID from Firebase Auth
 * @param {string} decisionId - Decision ID
 * @returns {Promise<Object|null>} Decision object or null if not found
 */
export const getDecisionById = async (userId, decisionId) => {
  try {
    if (!userId || !decisionId) {
      console.error('User ID and decision ID are required');
      return null;
    }

    const decisionRef = ref(database, `decisions/${userId}/${decisionId}`);
    const snapshot = await get(decisionRef);

    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error reading decision from Firebase:', error);
    return null;
  }
};

/**
 * Get recent decisions for a user
 * @param {string} userId - User ID from Firebase Auth
 * @param {number} limit - Number of recent decisions to retrieve
 * @returns {Promise<Array>} Array of recent decision objects
 */
export const getRecentDecisions = async (userId, limit = 5) => {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return [];
    }

    const decisions = await getAllDecisions(userId);
    return decisions.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent decisions:', error);
    return [];
  }
};

/**
 * Get decision statistics for a user
 * @param {string} userId - User ID from Firebase Auth
 * @returns {Promise<Object>} Statistics object
 */
export const getDecisionStats = async (userId) => {
  try {
    const decisions = await getAllDecisions(userId);

    return {
      totalDecisions: decisions.length,
      averageScore: decisions.length > 0
        ? decisions.reduce((sum, d) => sum + (d.overallScore || 0), 0) / decisions.length
        : 0,
      recentDecisions: decisions.slice(0, 5)
    };
  } catch (error) {
    console.error('Error calculating decision stats:', error);
    return {
      totalDecisions: 0,
      averageScore: 0,
      recentDecisions: []
    };
  }
};
