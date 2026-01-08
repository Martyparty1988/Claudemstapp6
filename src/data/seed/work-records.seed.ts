/**
 * MST Seed Data - Work Records
 * 
 * Demo záznamy práce.
 * Používá domain typy WorkRecord.
 */

import type { WorkRecord, WorkType } from '../../domain/types';
import { SEED_PROJECTS } from './projects.seed';
import { SEED_USERS } from './users.seed';

/**
 * Generovat work records pro projekt
 */
export function generateWorkRecordsForProject(projectId: string): WorkRecord[] {
  const project = SEED_PROJECTS.find((p) => p.id === projectId);
  if (!project) return [];

  const records: WorkRecord[] = [];
  const completedCount = project.statistics.completedTables;
  
  // Rozdělíme dokončené stoly do několika work records (jako by byly dělány postupně)
  const recordsCount = Math.ceil(completedCount / 8); // Průměrně 8 stolů na záznam
  let tablesAssigned = 0;

  for (let i = 0; i < recordsCount; i++) {
    const tablesInRecord = Math.min(
      Math.floor(Math.random() * 6) + 5, // 5-10 stolů
      completedCount - tablesAssigned
    );
    
    if (tablesInRecord <= 0) break;

    const tableIds: string[] = [];
    for (let t = 0; t < tablesInRecord; t++) {
      const row = Math.floor(tablesAssigned / project.tableLayout.columns);
      const col = tablesAssigned % project.tableLayout.columns;
      const label = `${String.fromCharCode(65 + row)}${col + 1}`;
      tableIds.push(`${projectId}-table-${label}`);
      tablesAssigned++;
    }

    // Náhodný typ práce
    const workTypes: WorkType[] = ['installation', 'inspection', 'maintenance'];
    const workType = workTypes[Math.floor(Math.random() * workTypes.length)];

    // Náhodný pracovník
    const worker = SEED_USERS[Math.floor(Math.random() * SEED_USERS.length)];

    // Datum - postupně zpět v čase
    const daysAgo = recordsCount - i;
    const recordTime = Date.now() - daysAgo * 86400000;
    const startTime = recordTime - 3600000; // O hodinu dříve

    const record: WorkRecord = {
      id: `wr-${projectId}-${i}`,
      projectId,
      tableIds,
      workType,
      workerName: worker.name,
      status: 'completed',
      startedAt: startTime,
      completedAt: recordTime,
      notes: generateRandomNote(workType, tablesInRecord),
      createdAt: recordTime,
      updatedAt: recordTime,
    };

    records.push(record);
  }

  return records;
}

/**
 * Generovat náhodnou poznámku
 */
function generateRandomNote(workType: WorkType, tableCount: number): string | undefined {
  const notes = [
    `Dokončeno ${tableCount} stolů bez problémů.`,
    'Vše OK.',
    `${workType === 'installation' ? 'Instalace' : workType === 'inspection' ? 'Inspekce' : 'Údržba'} proběhla úspěšně.`,
    'Drobné znečištění odstraněno.',
    undefined,
    undefined, // 33% bez poznámky
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Seed work records pro všechny projekty
 */
export function generateAllSeedWorkRecords(): WorkRecord[] {
  const allRecords: WorkRecord[] = [];

  for (const project of SEED_PROJECTS) {
    const records = generateWorkRecordsForProject(project.id);
    allRecords.push(...records);
  }

  // Seřadit podle data
  return allRecords.sort((a, b) => 
    (b.completedAt ?? 0) - (a.completedAt ?? 0)
  );
}

/**
 * Pre-generované work records
 */
export const SEED_WORK_RECORDS = generateAllSeedWorkRecords();

/**
 * Získat work records pro projekt
 */
export function getSeedWorkRecordsForProject(projectId: string): WorkRecord[] {
  return SEED_WORK_RECORDS.filter((r) => r.projectId === projectId);
}

/**
 * Získat nedávné work records
 */
export function getRecentSeedWorkRecords(limit: number = 10): WorkRecord[] {
  return SEED_WORK_RECORDS.slice(0, limit);
}
