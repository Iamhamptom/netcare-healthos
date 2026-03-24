-- RL Learning Events — persists events that survive Vercel cold starts
-- Used by src/lib/ml/reinforcement.ts for the closed-loop learning system

CREATE TABLE IF NOT EXISTS ho_learning_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'neutral',
  data JSONB NOT NULL DEFAULT '{}',
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cold start recovery (last 24h events)
CREATE INDEX IF NOT EXISTS idx_learning_events_created ON ho_learning_events (created_at DESC);

-- Index for pattern analysis queries
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON ho_learning_events (event_type);

-- Auto-cleanup: keep only last 30 days of events
-- (run via cron or manual: DELETE FROM ho_learning_events WHERE created_at < NOW() - INTERVAL '30 days')

-- RLS: service role only (no public access to learning data)
ALTER TABLE ho_learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON ho_learning_events
  FOR ALL USING (auth.role() = 'service_role');
