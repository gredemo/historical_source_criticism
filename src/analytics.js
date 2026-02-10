import { supabase } from './supabaseClient';

// ========== SESSION ==========

function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// ========== STARTTIDER (för duration) ==========

const startTimes = {};

// ========== TRACKING-FUNKTIONER ==========

export function trackSourceSelected(sourceTitle) {
  sendEvent({
    event_type: 'source_selected',
    source_title: sourceTitle,
  });
}

export function trackLevelStarted(level, step = null) {
  const key = `level${level}_step${step || 0}`;
  startTimes[key] = Date.now();

  sendEvent({
    event_type: 'level_started',
    level,
    step,
  });
}

export function trackLevelCompleted(level, step = null, attempts = null, success = true) {
  const key = `level${level}_step${step || 0}`;
  const startTime = startTimes[key];
  const durationSeconds = startTime
    ? Math.round((Date.now() - startTime) / 1000)
    : null;

  sendEvent({
    event_type: 'level_completed',
    level,
    step,
    attempts,
    duration_seconds: durationSeconds,
    success,
  });
}

// NY: Spara vilka ord eleven valde i Level 1
export async function trackWordSelection(sourceId, step, selectedWords, correctWords, success, attemptNumber) {
  try {
    const { error } = await supabase.from('word_selections').insert({
      session_id: getSessionId(),
      source_id: sourceId,
      step: step,
      selected_words: selectedWords,
      correct_words: correctWords,
      success: success,
      attempt_number: attemptNumber,
    });
    if (error) console.warn('Word tracking error:', error.message);
  } catch (e) {
    console.warn('Word tracking failed:', e.message);
  }
}

// ========== DASHBOARD-FUNKTIONER ==========

// Hämta statistik om vilka ord som väljs oftast
export async function getWordSelectionStats(sourceId, step) {
  try {
    const { data, error } = await supabase
      .from('word_selections')
      .select('*')
      .eq('source_id', sourceId)
      .eq('step', step);

    if (error || !data || data.length === 0) return null;

    // Räkna hur ofta varje ord väljs
    const wordFrequency = {};
    let successCount = 0;

    data.forEach(row => {
      if (row.success) successCount++;
      row.selected_words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    // Hämta korrekta ord från första raden
    const correctWords = data[0].correct_words || [];

    return {
      totalAttempts: data.length,
      successRate: Math.round((successCount / data.length) * 100),
      wordFrequency,
      correctWords,
    };
  } catch (e) {
    console.warn('getWordSelectionStats failed:', e.message);
    return null;
  }
}

// Hämta success rates per level
export async function getLevelSuccessRates(sourceTitle = null) {
  try {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .eq('event_type', 'level_completed');

    if (sourceTitle) {
      query = query.eq('source_title', sourceTitle);
    }

    const { data, error } = await query;

    if (error || !data) return null;

    const stats = {};

    data.forEach(row => {
      const key = row.step
        ? `Nivå ${row.level} - Steg ${row.step}`
        : `Nivå ${row.level}`;

      if (!stats[key]) {
        stats[key] = { completed: 0, failed: 0, totalDuration: 0, count: 0 };
      }

      if (row.success) {
        stats[key].completed++;
      } else {
        stats[key].failed++;
      }

      if (row.duration_seconds) {
        stats[key].totalDuration += row.duration_seconds;
        stats[key].count++;
      }
    });

    // Beräkna snittid
    Object.values(stats).forEach(s => {
      s.avgDuration = s.count > 0 ? Math.round(s.totalDuration / s.count) : null;
    });

    return stats;
  } catch (e) {
    console.warn('getLevelSuccessRates failed:', e.message);
    return null;
  }
}

// Hämta populäraste källorna
export async function getSourcePopularity() {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('source_title')
      .eq('event_type', 'source_selected');

    if (error || !data) return null;

    const counts = {};
    data.forEach(row => {
      if (row.source_title) {
        counts[row.source_title] = (counts[row.source_title] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count);
  } catch (e) {
    console.warn('getSourcePopularity failed:', e.message);
    return null;
  }
}

// ========== INTERN HJÄLPFUNKTION ==========

async function sendEvent(data) {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      session_id: getSessionId(),
      ...data,
    });
    if (error) console.warn('Analytics error:', error.message);
  } catch (e) {
    console.warn('Analytics failed:', e.message);
  }
}