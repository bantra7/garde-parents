import { useState, useEffect } from 'react';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

interface DatabaseConnection {
  db: SQLiteDBConnection | null;
  isReady: boolean;
  error: string | null;
}

interface GardeResult {
  enfant_nom: string;
  grand_parent_nom: string;
  date: string;
}

interface Enfant {
  id: number;
  nom: string;
  age: number;
  photo_url?: string;
  date_naissance?: string;
}

interface GrandParent {
  id: number;
  nom: string;
  lieu: string;
  telephone?: string;
  role: 'grand-mere' | 'grand-pere';
  photo_url?: string;
  couleur?: string;
}

const isNative = !!(window as any).Capacitor;

// Helpers pour le mode web/localStorage
const LS_ENFANTS = 'enfants';
const LS_GRANDS_PARENTS = 'grands_parents';
const LS_GARDES = 'gardes';

function getLS<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setLS<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const useDatabase = () => {
  const [connection, setConnection] = useState<DatabaseConnection>({
    db: null,
    isReady: false,
    error: null
  });

  const initializeDatabase = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setConnection({ db: null, isReady: true, error: null });
        return;
      }
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      const db = await sqlite.createConnection('gardeparents', false, 'no-encryption', 1, false);
      await db.open();
      await createTables(db);
      setConnection({ db, isReady: true, error: null });
    } catch (error) {
      console.error('Database initialization error:', error);
      setConnection({ db: null, isReady: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const createTables = async (db: SQLiteDBConnection) => {
    const queries = [
      `CREATE TABLE IF NOT EXISTS enfants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        age INTEGER NOT NULL,
        photo_url TEXT,
        date_naissance TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS grands_parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        lieu TEXT NOT NULL,
        telephone TEXT,
        role TEXT NOT NULL CHECK (role IN ('grand-mere', 'grand-pere')),
        photo_url TEXT,
        couleur TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS gardes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        enfant_id INTEGER NOT NULL,
        grand_parent_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (enfant_id) REFERENCES enfants(id),
        FOREIGN KEY (grand_parent_id) REFERENCES grands_parents(id)
      )`
    ];

    for (const query of queries) {
      await db.execute(query);
    }
    
    console.log('Tables created successfully');
  };

  const queryGardesWithJoin = async (db: SQLiteDBConnection) => {
    try {
      const query = `
        SELECT 
          e.nom as enfant_nom,
          gp.nom as grand_parent_nom,
          g.date
        FROM gardes g
        JOIN enfants e ON g.enfant_id = e.id
        JOIN grands_parents gp ON g.grand_parent_id = gp.id
        ORDER BY g.date DESC
      `;
      
      const result = await db.query(query);
      
      if (result.values) {
        console.log('=== GARDES WITH JOIN ===');
        result.values.forEach((row: GardeResult) => {
          console.log(`Enfant: ${row.enfant_nom}, Chez: ${row.grand_parent_nom}, Date: ${row.date}`);
        });
        console.log('========================');
      }
    } catch (error) {
      console.error('Error querying gardes:', error);
    }
  };

  // CRUD ENFANTS
  const getEnfants = async (): Promise<Enfant[]> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<Enfant>(LS_ENFANTS);
    }
    if (!connection.db) return [];
    try {
      const result = await connection.db.query('SELECT * FROM enfants ORDER BY nom');
      return result.values as Enfant[] || [];
    } catch (error) {
      console.error('Error fetching enfants:', error);
      return [];
    }
  };

  const getEnfantById = async (id: number): Promise<Enfant | null> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<Enfant>(LS_ENFANTS).find(e => e.id === id) || null;
    }
    if (!connection.db) return null;
    try {
      const result = await connection.db.query('SELECT * FROM enfants WHERE id = ?', [id]);
      return result.values?.[0] || null;
    } catch (error) {
      console.error('Error fetching enfant by id:', error);
      return null;
    }
  };

  const addEnfant = async (nom: string, age: number, photo_url?: string, date_naissance?: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const enfants = getLS<Enfant>(LS_ENFANTS);
      const id = enfants.length > 0 ? Math.max(...enfants.map(e => e.id)) + 1 : 1;
      enfants.push({ id, nom, age, photo_url, date_naissance });
      setLS(LS_ENFANTS, enfants);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('INSERT INTO enfants (nom, age, photo_url, date_naissance) VALUES (?, ?, ?, ?)', [nom, age, photo_url || null, date_naissance || null]);
    } catch (error) {
      console.error('Error adding enfant:', error);
    }
  };

  const updateEnfant = async (id: number, nom: string, age: number, photo_url?: string, date_naissance?: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const enfants = getLS<Enfant>(LS_ENFANTS);
      const idx = enfants.findIndex(e => e.id === id);
      if (idx !== -1) {
        enfants[idx] = { id, nom, age, photo_url, date_naissance };
        setLS(LS_ENFANTS, enfants);
      }
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('UPDATE enfants SET nom = ?, age = ?, photo_url = ?, date_naissance = ? WHERE id = ?', [nom, age, photo_url || null, date_naissance || null, id]);
    } catch (error) {
      console.error('Error updating enfant:', error);
    }
  };

  const deleteEnfant = async (id: number): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const enfants = getLS<Enfant>(LS_ENFANTS).filter(e => e.id !== id);
      setLS(LS_ENFANTS, enfants);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('DELETE FROM enfants WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting enfant:', error);
    }
  };

  // CRUD GRANDS-PARENTS
  const getGrandsParents = async (): Promise<GrandParent[]> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<GrandParent>(LS_GRANDS_PARENTS);
    }
    if (!connection.db) return [];
    try {
      const result = await connection.db.query('SELECT * FROM grands_parents ORDER BY nom');
      return result.values as GrandParent[] || [];
    } catch (error) {
      console.error('Error fetching grands parents:', error);
      return [];
    }
  };

  const getGrandParentById = async (id: number): Promise<GrandParent | null> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<GrandParent>(LS_GRANDS_PARENTS).find(gp => gp.id === id) || null;
    }
    if (!connection.db) return null;
    try {
      const result = await connection.db.query('SELECT * FROM grands_parents WHERE id = ?', [id]);
      return result.values?.[0] || null;
    } catch (error) {
      console.error('Error fetching grand-parent by id:', error);
      return null;
    }
  };

  const addGrandParent = async (nom: string, lieu: string, telephone?: string, role?: 'grand-mere' | 'grand-pere', photo_url?: string, couleur?: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gps = getLS<GrandParent>(LS_GRANDS_PARENTS);
      const id = gps.length > 0 ? Math.max(...gps.map(gp => gp.id)) + 1 : 1;
      gps.push({ id, nom, lieu, telephone, role: role || 'grand-pere', photo_url, couleur });
      setLS(LS_GRANDS_PARENTS, gps);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('INSERT INTO grands_parents (nom, lieu, telephone, role, photo_url, couleur) VALUES (?, ?, ?, ?, ?, ?)', [nom, lieu, telephone || null, role || 'grand-pere', photo_url || null, couleur || null]);
    } catch (error) {
      console.error('Error adding grand parent:', error);
    }
  };

  const updateGrandParent = async (id: number, nom: string, lieu: string, telephone?: string, role?: 'grand-mere' | 'grand-pere', photo_url?: string, couleur?: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gps = getLS<GrandParent>(LS_GRANDS_PARENTS);
      const idx = gps.findIndex(gp => gp.id === id);
      if (idx !== -1) {
        gps[idx] = { id, nom, lieu, telephone, role: role || 'grand-pere', photo_url, couleur };
        setLS(LS_GRANDS_PARENTS, gps);
      }
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('UPDATE grands_parents SET nom = ?, lieu = ?, telephone = ?, role = ?, photo_url = ?, couleur = ? WHERE id = ?', [nom, lieu, telephone || null, role || 'grand-pere', photo_url || null, couleur || null, id]);
    } catch (error) {
      console.error('Error updating grand parent:', error);
    }
  };

  const deleteGrandParent = async (id: number): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gps = getLS<GrandParent>(LS_GRANDS_PARENTS).filter(gp => gp.id !== id);
      setLS(LS_GRANDS_PARENTS, gps);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('DELETE FROM grands_parents WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting grand parent:', error);
    }
  };

  // CRUD GARDES
  const getGardes = async (): Promise<any[]> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<any>(LS_GARDES);
    }
    if (!connection.db) return [];
    try {
      const result = await connection.db.query('SELECT * FROM gardes ORDER BY date DESC');
      return result.values || [];
    } catch (error) {
      console.error('Error fetching gardes:', error);
      return [];
    }
  };

  const getGardeById = async (id: number): Promise<any | null> => {
    if (!Capacitor.isNativePlatform()) {
      return getLS<any>(LS_GARDES).find(g => g.id === id) || null;
    }
    if (!connection.db) return null;
    try {
      const result = await connection.db.query('SELECT * FROM gardes WHERE id = ?', [id]);
      return result.values?.[0] || null;
    } catch (error) {
      console.error('Error fetching garde by id:', error);
      return null;
    }
  };

  const addGarde = async (enfant_id: number, grand_parent_id: number, date: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gardes = getLS<any>(LS_GARDES);
      const id = gardes.length > 0 ? Math.max(...gardes.map(g => g.id)) + 1 : 1;
      gardes.push({ id, enfant_id, grand_parent_id, date });
      setLS(LS_GARDES, gardes);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('INSERT INTO gardes (enfant_id, grand_parent_id, date) VALUES (?, ?, ?)', [enfant_id, grand_parent_id, date]);
    } catch (error) {
      console.error('Error adding garde:', error);
    }
  };

  const updateGarde = async (id: number, enfant_id: number, grand_parent_id: number, date: string): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gardes = getLS<any>(LS_GARDES);
      const idx = gardes.findIndex(g => g.id === id);
      if (idx !== -1) {
        gardes[idx] = { id, enfant_id, grand_parent_id, date };
        setLS(LS_GARDES, gardes);
      }
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('UPDATE gardes SET enfant_id = ?, grand_parent_id = ?, date = ? WHERE id = ?', [enfant_id, grand_parent_id, date, id]);
    } catch (error) {
      console.error('Error updating garde:', error);
    }
  };

  const deleteGarde = async (id: number): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      const gardes = getLS<any>(LS_GARDES).filter(g => g.id !== id);
      setLS(LS_GARDES, gardes);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('DELETE FROM gardes WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting garde:', error);
    }
  };

  // RESET DATABASE
  const resetDatabase = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      setLS(LS_ENFANTS, []);
      setLS(LS_GRANDS_PARENTS, []);
      setLS(LS_GARDES, []);
      return;
    }
    if (!connection.db) return;
    try {
      await connection.db.run('DELETE FROM gardes');
      await connection.db.run('DELETE FROM enfants');
      await connection.db.run('DELETE FROM grands_parents');
    } catch (error) {
      console.error('Error resetting database:', error);
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  return {
    ...connection,
    initializeDatabase,
    resetDatabase,
    queryGardesWithJoin: () => connection.db ? queryGardesWithJoin(connection.db) : null,
    getEnfants,
    getEnfantById,
    addEnfant,
    updateEnfant,
    deleteEnfant,
    getGrandsParents,
    getGrandParentById,
    addGrandParent,
    updateGrandParent,
    deleteGrandParent,
    getGardes,
    getGardeById,
    addGarde,
    updateGarde,
    deleteGarde
  };
};