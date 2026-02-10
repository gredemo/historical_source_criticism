import { supabase } from './supabaseClient';

// Skapa ett anonymt session-ID (nytt varje besök)
function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

// Håll koll på starttider för att mäta duration
const startTimes = {};

// Logga att eleven valde en källa
export function trackSourceSelected(sourceTitle) {
  sendEvent({
    event_type: 'source_selected',
    source_title: sourceTitle,
  });
}

// Logga att en nivå/steg startades (för tidmätning)
export function trackLevelStarted(level, step = null) {
  const key = `level${level}_step${step || 0}`;
  startTimes[key] = Date.now();

  sendEvent({
    event_type: 'level_started',
    level,
    step,
  });
}

// Logga att en nivå/steg klarades
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

// Skicka event till Supabase
async function sendEvent(data) {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      session_id: getSessionId(),
      ...data,
    });
    if (error) console.warn('Analytics error:', error.message);
  } catch (e) {
    // Tyst fel — analytics ska aldrig störa appen
    console.warn('Analytics failed:', e.message);
  }
}