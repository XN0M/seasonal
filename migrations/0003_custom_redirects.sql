-- Preserve existing identifiers, statuses and attribution. Do not rewrite migration 0001.
CREATE TABLE redirect_links_v3 (
 id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL,
 brand_id TEXT REFERENCES destinations(brand_id), locale TEXT, market TEXT,
 event_id TEXT, channel TEXT NOT NULL, campaign_label TEXT NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('active','paused','archived')),
 expires_at TEXT, checklist_json TEXT NOT NULL, system INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL,
 target_kind TEXT NOT NULL DEFAULT 'brand' CHECK(target_kind IN ('brand','custom')),
 destination_url TEXT, destination_hostname TEXT,
 CHECK((target_kind='brand' AND brand_id IS NOT NULL AND locale IS NOT NULL AND market IS NOT NULL AND destination_url IS NULL AND destination_hostname IS NULL)
    OR (target_kind='custom' AND brand_id IS NULL AND locale IS NULL AND market IS NULL AND event_id IS NULL AND system=0 AND destination_url IS NOT NULL AND destination_hostname IS NOT NULL))
);
INSERT INTO redirect_links_v3 (id,slug,brand_id,locale,market,event_id,channel,campaign_label,status,expires_at,checklist_json,system,created_at)
 SELECT id,slug,brand_id,locale,market,event_id,channel,campaign_label,status,expires_at,checklist_json,system,created_at FROM redirect_links;
DROP TABLE redirect_links;
ALTER TABLE redirect_links_v3 RENAME TO redirect_links;
CREATE TRIGGER redirect_identity_immutable BEFORE UPDATE OF slug,brand_id,id,target_kind,destination_url,destination_hostname,system ON redirect_links
 BEGIN SELECT RAISE(ABORT,'redirect identity is immutable'); END;
CREATE TRIGGER redirect_archive_final BEFORE UPDATE OF status ON redirect_links WHEN OLD.status='archived' AND NEW.status!='archived'
 BEGIN SELECT RAISE(ABORT,'archived slug cannot be reused'); END;

CREATE TABLE redirect_events_v3 (
 id TEXT PRIMARY KEY, occurred_at TEXT NOT NULL, day TEXT NOT NULL, redirect_id TEXT NOT NULL,
 brand_id TEXT, campaign TEXT NOT NULL, event_id TEXT, channel TEXT NOT NULL, result INTEGER NOT NULL, eligible INTEGER NOT NULL
);
INSERT INTO redirect_events_v3 SELECT * FROM redirect_events;
DROP TABLE redirect_events;
ALTER TABLE redirect_events_v3 RENAME TO redirect_events;
CREATE INDEX event_retention ON redirect_events(occurred_at);
CREATE TABLE redirect_daily_v3 (
 day TEXT NOT NULL, redirect_id TEXT NOT NULL, brand_id TEXT, campaign TEXT NOT NULL, event_id TEXT,
 channel TEXT NOT NULL, result INTEGER NOT NULL, requests INTEGER NOT NULL, estimated_clicks INTEGER NOT NULL,
 PRIMARY KEY(day,redirect_id,result)
);
INSERT INTO redirect_daily_v3 SELECT * FROM redirect_daily;
DROP TABLE redirect_daily;
ALTER TABLE redirect_daily_v3 RENAME TO redirect_daily;
