# Decisionera API Documentation

## Overview
This is a mock API that simulates database operations using JSON files. In production, these would be replaced with actual backend API calls.

## Database Files
All database files are located in `api/db/`:
- `users.json` - User accounts and settings
- `journals.json` - Journal entries
- `categories.json` - Decision categories
- `decisions.json` - Decision history

## Available Functions

### User Functions

```javascript
import { getUserById, authenticateUser, updateUserSettings } from '../api/api.js';

// Get user by ID
const user = getUserById('user_001');

// Login (mock authentication)
const authenticatedUser = authenticateUser('alice@example.com', 'hashed_password_123');

// Update user settings
const updated = updateUserSettings('user_001', {
  avoidTopics: ['failure', 'mistake'],
  theme: 'dark'
});

// Get user's avoid topics
const avoidTopics = getUserAvoidTopics('user_001');
// Returns: ['failure', 'bad choice', 'wrong decision', 'mistake']

// Get user's preferred categories
const preferredCategories = getUserPreferredCategories('user_001');
// Returns: ['Regret Likelihood', 'Reversibility Score', ...]
```

### Journal Functions

```javascript
import { getUserJournal, addJournalEntry, searchJournalEntries } from '../api/api.js';

// Get all journal entries for a user
const entries = getUserJournal('user_001');

// Add new journal entry
const newEntry = addJournalEntry('user_001', {
  title: 'Today\'s thoughts',
  content: 'Feeling anxious about the upcoming presentation...',
  mood: 'anxious',
  tags: ['work', 'anxiety']
});

// Search journal entries
const results = searchJournalEntries('user_001', 'presentation');
```

### Category Functions

```javascript
import { 
  getAllCategories, 
  getCategoryById,
  getMentalHealthCategories,
  getUserRelevantCategories 
} from '../api/api.js';

// Get all available categories
const categories = getAllCategories();

// Get specific category
const category = getCategoryById('cat_001');

// Get mental health specific categories
const mentalHealthCats = getMentalHealthCategories();

// Get categories relevant to a specific user
const userCategories = getUserRelevantCategories('user_001');
```

### Decision Functions

```javascript
import { 
  getUserDecisions, 
  createDecision,
  calculateDecisionScore,
  getDecisionStats 
} from '../api/api.js';

// Get all decisions for a user
const decisions = getUserDecisions('user_001');

// Create a new decision
const decision = createDecision(
  'user_001',
  'Should I accept the job offer?',
  [
    { categoryId: 'cat_001', userScore: 7, aiSuggestion: 6, finalScore: 6.5, reasoning: '...' },
    { categoryId: 'cat_002', userScore: 8, aiSuggestion: 7, finalScore: 7.5, reasoning: '...' }
  ],
  true, // include journal
  'entry_001' // journal entry ID
);

// Calculate weighted decision score
const score = calculateDecisionScore([
  { categoryId: 'cat_001', score: 7 },
  { categoryId: 'cat_002', score: 8 }
]);

// Get decision statistics
const stats = getDecisionStats('user_001');
// Returns: { totalDecisions, averageScore, decisionsWithJournal, recentDecisions }
```

## Example Usage in Components

### Using the API in a React component:

```javascript
import { useState, useEffect } from 'react';
import { getUserJournal, addJournalEntry } from '../../api/api.js';

function JournalComponent() {
  const [entries, setEntries] = useState([]);
  const currentUserId = 'user_001'; // In production, get from auth context

  useEffect(() => {
    // Load user's journal entries
    const userEntries = getUserJournal(currentUserId);
    setEntries(userEntries);
  }, []);

  const handleAddEntry = (newEntryData) => {
    const entry = addJournalEntry(currentUserId, newEntryData);
    setEntries([entry, ...entries]);
  };

  return (
    // Your component JSX
  );
}
```

## Mock Data

### Sample User
```json
{
  "id": "user_001",
  "email": "alice@example.com",
  "username": "alice_wonderland",
  "settings": {
    "disorders": ["anxiety", "adhd"],
    "avoidTopics": ["failure", "bad choice"],
    "preferredCategories": ["Regret Likelihood", "Impact on Anxiety"]
  }
}
```

### Sample Category
```json
{
  "id": "cat_001",
  "name": "Regret Likelihood",
  "description": "How likely are you to feel regret about this decision later?",
  "scale": { "min": 0, "max": 10 },
  "weight": 1.5
}
```

## Converting to Real Backend

When moving to production:

1. Replace JSON imports with fetch/axios calls
2. Add error handling and loading states
3. Implement authentication tokens
4. Add request/response validation
5. Handle API errors gracefully

Example conversion:
```javascript
// Current (mock)
const user = getUserById('user_001');

// Production (with real API)
const response = await fetch(`/api/users/${userId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
```

## Notes

- All functions return synchronously (no promises) since they're reading from imported JSON
- In production, these should be async and handle network errors
- User passwords are mock hashed - use proper authentication in production
- No actual data persistence - changes only exist in memory during runtime
