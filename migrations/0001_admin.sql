PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS destinations (brand_id TEXT PRIMARY KEY, link_json TEXT NOT NULL, profile_status TEXT NOT NULL DEFAULT 'active', merchant_status TEXT NOT NULL DEFAULT 'active', updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS redirect_links (
 id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, brand_id TEXT NOT NULL REFERENCES destinations(brand_id), locale TEXT NOT NULL, market TEXT NOT NULL,
 event_id TEXT, channel TEXT NOT NULL, campaign_label TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','paused','archived')),
 expires_at TEXT, checklist_json TEXT NOT NULL, system INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS redirect_identity_immutable BEFORE UPDATE OF slug,brand_id,id ON redirect_links BEGIN SELECT RAISE(ABORT,'redirect identity is immutable'); END;
CREATE TRIGGER IF NOT EXISTS redirect_archive_final BEFORE UPDATE OF status ON redirect_links WHEN OLD.status='archived' AND NEW.status!='archived' BEGIN SELECT RAISE(ABORT,'archived slug cannot be reused'); END;
CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY CHECK(id='main'), version INTEGER NOT NULL, content_json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY, schema_version INTEGER NOT NULL, content_json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TRIGGER IF NOT EXISTS revision_immutable BEFORE UPDATE ON revisions BEGIN SELECT RAISE(ABORT,'immutable revision'); END;
CREATE TABLE IF NOT EXISTS publish_jobs (id TEXT PRIMARY KEY, revision_id TEXT NOT NULL REFERENCES revisions(id), status TEXT NOT NULL CHECK(status IN ('queued','building','failed','published')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL, error TEXT);
CREATE UNIQUE INDEX IF NOT EXISTS one_publish_job ON publish_jobs((1)) WHERE status IN ('queued','building');
CREATE TABLE IF NOT EXISTS audit (id TEXT PRIMARY KEY, occurred_at TEXT NOT NULL, action TEXT NOT NULL, entity_id TEXT NOT NULL, detail TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS redirect_events (id TEXT PRIMARY KEY, occurred_at TEXT NOT NULL, day TEXT NOT NULL, redirect_id TEXT NOT NULL, brand_id TEXT NOT NULL, campaign TEXT NOT NULL, event_id TEXT, channel TEXT NOT NULL, result INTEGER NOT NULL, eligible INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS event_retention ON redirect_events(occurred_at);
CREATE TABLE IF NOT EXISTS redirect_daily (day TEXT NOT NULL, redirect_id TEXT NOT NULL, brand_id TEXT NOT NULL, campaign TEXT NOT NULL, event_id TEXT, channel TEXT NOT NULL, result INTEGER NOT NULL, requests INTEGER NOT NULL, estimated_clicks INTEGER NOT NULL, PRIMARY KEY(day,redirect_id,result));
CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, value TEXT NOT NULL);
