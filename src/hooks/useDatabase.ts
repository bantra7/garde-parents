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
}

interface GrandParent {
  id: number;
  nom: string;
  lieu: string;
  telephone?: string;
  role: 'grand-mere' | 'grand-pere';
}

export const useDatabase = () => {
  const [connection, setConnection] = useState<DatabaseConnection>({
    db: null,
    isReady: false,
    error: null
  });

  const initializeDatabase = async () => {
    try {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        console.log('SQLite only available on native platforms');
        return;
      }

      const sqlite = new SQLiteConnection(CapacitorSQLite);
      
      // Create database
      const db = await sqlite.createConnection('gardeparents', false, 'no-encryption', 1, false);
      await db.open();
      
      // Create tables
      await createTables(db);
      
      // Insert example data
      await insertExampleData(db);
      
      // Query and display results
      await queryGardesWithJoin(db);
      
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
        photo_url TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS grands_parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        lieu TEXT NOT NULL,
        telephone TEXT,
        role TEXT NOT NULL CHECK (role IN ('grand-mere', 'grand-pere'))
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

  const insertExampleData = async (db: SQLiteDBConnection) => {
    try {
      // Check if data already exists
      const existingData = await db.query('SELECT COUNT(*) as count FROM enfants');
      if (existingData.values && existingData.values[0].count > 0) {
        console.log('Example data already exists');
        return;
      }

      // Insert example data
      await db.run('INSERT INTO enfants (nom, age, photo_url) VALUES (?, ?, ?)', ['Marie', 4, '/src/assets/leo-avatar.png']);
      await db.run('INSERT INTO grands_parents (nom, lieu, telephone, role) VALUES (?, ?, ?, ?)', ['Jean', 'Paris', '06 12 34 56 78', 'grand-pere']);
      await db.run('INSERT INTO grands_parents (nom, lieu, telephone, role) VALUES (?, ?, ?, ?)', ['Marie', 'Lyon', '06 87 65 43 21', 'grand-mere']);
      await db.run('INSERT INTO gardes (enfant_id, grand_parent_id, date) VALUES (?, ?, ?)', [1, 1, '2025-07-16']);
      
      console.log('Example data inserted successfully');
    } catch (error) {
      console.error('Error inserting example data:', error);
    }
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

  const getEnfants = async (): Promise<Enfant[]> => {
    if (!connection.db) return [];
    
    try {
      const result = await connection.db.query('SELECT * FROM enfants ORDER BY nom');
      return result.values as Enfant[] || [];
    } catch (error) {
      console.error('Error fetching enfants:', error);
      return [];
    }
  };

  const getGrandsParents = async (): Promise<GrandParent[]> => {
    if (!connection.db) return [];
    
    try {
      const result = await connection.db.query('SELECT * FROM grands_parents ORDER BY nom');
      return result.values as GrandParent[] || [];
    } catch (error) {
      console.error('Error fetching grands parents:', error);
      return [];
    }
  };

  const addEnfant = async (nom: string, age: number, photo_url?: string): Promise<void> => {
    if (!connection.db) return;
    
    try {
      await connection.db.run('INSERT INTO enfants (nom, age, photo_url) VALUES (?, ?, ?)', [nom, age, photo_url || null]);
    } catch (error) {
      console.error('Error adding enfant:', error);
    }
  };

  const addGrandParent = async (nom: string, lieu: string, telephone?: string, role?: 'grand-mere' | 'grand-pere'): Promise<void> => {
    if (!connection.db) return;
    
    try {
      await connection.db.run('INSERT INTO grands_parents (nom, lieu, telephone, role) VALUES (?, ?, ?, ?)', [nom, lieu, telephone || null, role || 'grand-pere']);
    } catch (error) {
      console.error('Error adding grand parent:', error);
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  return {
    ...connection,
    initializeDatabase,
    queryGardesWithJoin: () => connection.db ? queryGardesWithJoin(connection.db) : null,
    getEnfants,
    getGrandsParents,
    addEnfant,
    addGrandParent
  };
};