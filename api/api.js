// Mock API functions to interact with fake database files
// In production, these would be actual API calls to a backend server

import usersData from './db/users.json';
import journalsData from './db/journals.json';
import categoriesData from './db/categories.json';
import decisionsData from './db/decisions.json';

// ============== USER FUNCTIONS ==============

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object|null} User object or null if not found
 */
export const getUserById = (userId) => {
  return usersData.users.find(user => user.id === userId) || null;
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {object|null} User object or null if not found
 */
export const getUserByEmail = (email) => {
  return usersData.users.find(user => user.email === email) || null;
};

/**
 * Authenticate user (mock login)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object|null} User object (without password) or null if authentication fails
 */
export const authenticateUser = (email, password) => {
  const user = usersData.users.find(
    u => u.email === email && u.password === password
  );
  
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

/**
 * Update user settings
 * @param {string} userId - User ID
 * @param {object} newSettings - New settings object
 * @returns {object} Updated user object
 */
export const updateUserSettings = (userId, newSettings) => {
  const user = getUserById(userId);
  if (user) {
    user.settings = { ...user.settings, ...newSettings };
    return user;
  }
  return null;
};

/**
 * Get user's avoid topics
 * @param {string} userId - User ID
 * @returns {array} Array of topics to avoid
 */
export const getUserAvoidTopics = (userId) => {
  const user = getUserById(userId);
  return user?.settings?.avoidTopics || [];
};

/**
 * Get user's preferred categories
 * @param {string} userId - User ID
 * @returns {array} Array of preferred category names
 */
export const getUserPreferredCategories = (userId) => {
  const user = getUserById(userId);
  return user?.settings?.preferredCategories || [];
};

// ============== JOURNAL FUNCTIONS ==============

/**
 * Get all journal entries for a user
 * @param {string} userId - User ID
 * @returns {array} Array of journal entries
 */
export const getUserJournal = (userId) => {
  const journal = journalsData.journals.find(j => j.userId === userId);
  return journal?.entries || [];
};

/**
 * Get specific journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Entry ID
 * @returns {object|null} Journal entry or null
 */
export const getJournalEntry = (userId, entryId) => {
  const entries = getUserJournal(userId);
  return entries.find(entry => entry.entryId === entryId) || null;
};

/**
 * Add new journal entry
 * @param {string} userId - User ID
 * @param {object} entry - Entry object (title, content, mood, tags)
 * @returns {object} Created entry with ID and timestamp
 */
export const addJournalEntry = (userId, entry) => {
  const journal = journalsData.journals.find(j => j.userId === userId);
  
  const newEntry = {
    entryId: `entry_${Date.now()}`,
    date: new Date().toISOString(),
    ...entry
  };
  
  if (journal) {
    journal.entries.push(newEntry);
  } else {
    journalsData.journals.push({
      id: `journal_${Date.now()}`,
      userId,
      entries: [newEntry]
    });
  }
  
  return newEntry;
};

/**
 * Search journal entries by tags or keywords
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {array} Array of matching entries
 */
export const searchJournalEntries = (userId, searchTerm) => {
  const entries = getUserJournal(userId);
  const term = searchTerm.toLowerCase();
  
  return entries.filter(entry => 
    entry.title.toLowerCase().includes(term) ||
    entry.content.toLowerCase().includes(term) ||
    entry.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

// ============== CATEGORY FUNCTIONS ==============

/**
 * Get all default categories
 * @returns {array} Array of category objects
 */
export const getAllCategories = () => {
  return categoriesData.defaultCategories;
};

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {object|null} Category object or null
 */
export const getCategoryById = (categoryId) => {
  return categoriesData.defaultCategories.find(cat => cat.id === categoryId) || null;
};

/**
 * Get mental health specific categories
 * @returns {array} Array of mental health category objects
 */
export const getMentalHealthCategories = () => {
  return categoriesData.mentalHealthCategories.map(catId => 
    getCategoryById(catId)
  ).filter(Boolean);
};

/**
 * Get categories by user preferences
 * @param {string} userId - User ID
 * @returns {array} Array of preferred category objects
 */
export const getUserRelevantCategories = (userId) => {
  const preferredNames = getUserPreferredCategories(userId);
  return categoriesData.defaultCategories.filter(cat => 
    preferredNames.includes(cat.name)
  );
};

/**
 * Filter categories based on avoid topics
 * @param {array} categories - Array of categories
 * @param {array} avoidTopics - Topics to avoid
 * @returns {array} Filtered categories
 */
export const filterCategoriesByAvoidTopics = (categories, avoidTopics) => {
  // In a real implementation, this would use NLP to check descriptions
  // For now, simple keyword matching
  return categories.filter(cat => {
    const text = `${cat.name} ${cat.description}`.toLowerCase();
    return !avoidTopics.some(topic => text.includes(topic.toLowerCase()));
  });
};

// ============== DECISION FUNCTIONS ==============

/**
 * Get all decisions for a user
 * @param {string} userId - User ID
 * @returns {array} Array of decision objects
 */
export const getUserDecisions = (userId) => {
  return decisionsData.decisions.filter(d => d.userId === userId);
};

/**
 * Get specific decision
 * @param {string} decisionId - Decision ID
 * @returns {object|null} Decision object or null
 */
export const getDecisionById = (decisionId) => {
  return decisionsData.decisions.find(d => d.id === decisionId) || null;
};

/**
 * Create new decision
 * @param {string} userId - User ID
 * @param {string} query - User's decision query
 * @param {array} categories - Array of category assessments
 * @param {boolean} includeJournal - Whether to link journal entry
 * @param {string} journalEntryId - Optional journal entry ID
 * @returns {object} Created decision
 */
export const createDecision = (userId, query, categories, includeJournal = false, journalEntryId = null) => {
  const overallScore = categories.reduce((sum, cat) => sum + cat.finalScore, 0) / categories.length;
  
  const newDecision = {
    id: `decision_${Date.now()}`,
    userId,
    query,
    timestamp: new Date().toISOString(),
    categories,
    overallScore: parseFloat(overallScore.toFixed(2)),
    recommendation: generateRecommendation(overallScore),
    includeJournal,
    journalEntryId
  };
  
  decisionsData.decisions.push(newDecision);
  return newDecision;
};

/**
 * Calculate decision matrix score
 * @param {array} categoryScores - Array of {categoryId, score, weight}
 * @returns {number} Weighted overall score
 */
export const calculateDecisionScore = (categoryScores) => {
  const totalWeight = categoryScores.reduce((sum, item) => {
    const category = getCategoryById(item.categoryId);
    return sum + (category?.weight || 1);
  }, 0);
  
  const weightedSum = categoryScores.reduce((sum, item) => {
    const category = getCategoryById(item.categoryId);
    const weight = category?.weight || 1;
    return sum + (item.score * weight);
  }, 0);
  
  return weightedSum / totalWeight;
};

/**
 * Generate recommendation based on score
 * @param {number} score - Overall decision score
 * @returns {string} Recommendation message
 */
const generateRecommendation = (score) => {
  if (score >= 7) {
    return "This decision aligns well with your priorities and well-being. Trust your process.";
  } else if (score >= 5) {
    return "This decision shows balanced considerations. Take time to reflect on what matters most to you.";
  } else if (score >= 3) {
    return "Consider taking more time with this decision. Explore how it aligns with your current needs.";
  } else {
    return "This decision may benefit from additional reflection. Your well-being is the priority.";
  }
};

// ============== UTILITY FUNCTIONS ==============

/**
 * Get decision statistics for user
 * @param {string} userId - User ID
 * @returns {object} Statistics object
 */
export const getDecisionStats = (userId) => {
  const decisions = getUserDecisions(userId);
  
  return {
    totalDecisions: decisions.length,
    averageScore: decisions.length > 0 
      ? decisions.reduce((sum, d) => sum + d.overallScore, 0) / decisions.length 
      : 0,
    decisionsWithJournal: decisions.filter(d => d.includeJournal).length,
    recentDecisions: decisions.slice(-5).reverse()
  };
};

/**
 * Export all data (for debugging/testing)
 * @returns {object} All database data
 */
export const getAllData = () => ({
  users: usersData.users,
  journals: journalsData.journals,
  categories: categoriesData.defaultCategories,
  decisions: decisionsData.decisions
});
