const STORAGE_KEY = 'typing_stats_v1';
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

export function getRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read stats from localStorage', e);
    return [];
  }
}

export function setRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to write stats to localStorage', e);
  }
}

export function saveRecord(record) {
  const all = getRecords();
  all.push(record);
  const cutoff = Date.now() - TWO_WEEKS_MS;
  const recent = all.filter((r) => (r.finishedAt || r.createdAt || 0) >= cutoff);
  setRecords(recent);
  return recent;
}

export function clearRecords() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear stats from localStorage', e);
  }
}

export function getRecordsSorted() {
  return getRecords().slice().sort((a, b) => (b.finishedAt || b.createdAt || 0) - (a.finishedAt || a.createdAt || 0));
}

const statsStorage = {
  getRecords,
  setRecords,
  saveRecord,
  clearRecords,
  getRecordsSorted,
};

export default statsStorage;
