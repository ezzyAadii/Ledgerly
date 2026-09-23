import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import config from '../config.js';
import { schema } from './schema.js';
let db;
export function getDb(){
 if (!db) {
  if (config.databasePath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(config.databasePath)),{recursive:true});
  db = new Database(config.databasePath); db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); db.exec(schema);
 }
 return db;
}
export function closeDb(){ if(db){db.close();db=undefined;} }
