export const schema = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
 password_hash TEXT, google_id TEXT UNIQUE, avatar_url TEXT, auth_provider TEXT NOT NULL DEFAULT 'local' CHECK(auth_provider IN ('local','google','both')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS transactions (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, type TEXT NOT NULL CHECK(type IN ('income','expense')),
 description TEXT NOT NULL, category TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount > 0), date TEXT NOT NULL,
 note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id,date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id,category);
CREATE TABLE IF NOT EXISTS budgets (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, category TEXT NOT NULL, monthly_limit INTEGER NOT NULL CHECK(monthly_limit > 0),
 month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12), year INTEGER NOT NULL CHECK(year BETWEEN 2000 AND 2200),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(user_id,category,month,year)
);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id,year,month);
CREATE TABLE IF NOT EXISTS savings_goals (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, target_amount INTEGER NOT NULL CHECK(target_amount > 0),
 saved_amount INTEGER NOT NULL DEFAULT 0 CHECK(saved_amount >= 0), due_date TEXT, description TEXT NOT NULL DEFAULT '',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_goals_user ON savings_goals(user_id);
CREATE TABLE IF NOT EXISTS recurring_commitments (
 id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, name TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount > 0), category TEXT NOT NULL,
 frequency TEXT NOT NULL CHECK(frequency IN ('weekly','monthly','quarterly','yearly')), next_due_date TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_recurring_user_due ON recurring_commitments(user_id,active,next_due_date);
`;
