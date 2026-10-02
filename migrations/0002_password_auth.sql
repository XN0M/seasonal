CREATE TABLE IF NOT EXISTS admin_credentials (
 id TEXT PRIMARY KEY CHECK(id='owner'), email TEXT NOT NULL,
 password_hash TEXT NOT NULL, version INTEGER NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_sessions (
 session_hash TEXT PRIMARY KEY, credential_version INTEGER NOT NULL,
 created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS admin_session_expiry ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS admin_login_limit (
 id TEXT PRIMARY KEY CHECK(id='owner'), attempts INTEGER NOT NULL, window_start INTEGER NOT NULL);
