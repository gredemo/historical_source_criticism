// Analytics-funktioner (Supabase borttaget)
// Funktionerna finns kvar så att komponenterna inte kraschar

export function trackSourceSelected(sourceTitle) {}

export function trackLevelStarted(level, step = null) {}

export function trackLevelCompleted(level, step = null, attempts = null, success = true) {}

export async function trackWordSelection(sourceId, step, selectedWords, correctWords, success, attemptNumber) {}

export async function getWordSelectionStats(sourceId, step) { return null; }

export async function getLevelSuccessRates(sourceTitle = null) { return null; }

export async function getSourcePopularity() { return null; }