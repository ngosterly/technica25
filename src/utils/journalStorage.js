// utility functions for journal entries

const STORAGE_KEY = 'decisionera_journal_entries';

export const getAllEntries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return {};
  }
};

export const getEntryByDate = (date) => {
  const entries = getAllEntries();
  return entries[date] || null;
};

export const saveEntry = (date, entry) => {
  try {
    const entries = getAllEntries();
    entries[date] = {
      ...entry,
      date,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const deleteEntry = (date) => {
  try {
    const entries = getAllEntries();
    delete entries[date];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
};

export const hasEntryForDate = (date) => {
  const entries = getAllEntries();
  return !!entries[date];
};

export const getDatesWithEntries = () => {
  const entries = getAllEntries();
  return Object.keys(entries).sort();
};

export const getEntriesForMonth = (year, month) => {
  const entries = getAllEntries();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  
  return Object.keys(entries)
    .filter(date => date.startsWith(monthStr))
    .reduce((acc, date) => {
      acc[date] = entries[date];
      return acc;
    }, {});
};

export const exportEntries = () => {
  const entries = getAllEntries();
  return JSON.stringify(entries, null, 2);
};

export const importEntries = (jsonData) => {
  try {
    const entries = JSON.parse(jsonData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Error importing entries:', error);
    return false;
  }
};
