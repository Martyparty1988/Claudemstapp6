/**
 * MST Seed Data - Tables
 * 
 * Demo stoly pro projekty.
 * Používá domain typy Table.
 */

import type { Table, TablePosition } from '../../domain/types';
import type { TableSize } from '../../domain/constants';
import { SEED_PROJECTS, type SeedProject } from './projects.seed';

/**
 * Generátor label stolu
 */
function tableLabel(row: number, col: number): string {
  const rowLetter = String.fromCharCode(65 + row); // A, B, C, ...
  return `${rowLetter}${col + 1}`;
}

/**
 * Náhodná velikost stolu
 */
function randomSize(): TableSize {
  const sizes: TableSize[] = ['small', 'medium', 'large'];
  const weights = [0.2, 0.5, 0.3]; // 20% small, 50% medium, 30% large
  const random = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) return sizes[i];
  }
  return 'medium';
}

/**
 * Generovat stoly pro projekt
 */
export function generateTablesForProject(
  projectId: string,
  rows: number,
  cols: number
): Table[] {
  const tables: Table[] = [];
  const now = Date.now();

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const position: TablePosition = { row, column: col };
      const label = tableLabel(row, col);
      const size = randomSize();

      const table: Table = {
        id: `${projectId}-table-${label}`,
        projectId,
        position,
        size,
        label,
        createdAt: now,
        updatedAt: now,
      };

      tables.push(table);
    }
  }

  return tables;
}

/**
 * Seed tabulky pro všechny projekty
 */
export function generateAllSeedTables(): Map<string, Table[]> {
  const result = new Map<string, Table[]>();

  for (const project of SEED_PROJECTS) {
    const tables = generateTablesForProject(
      project.id,
      project.tableLayout.rows,
      project.tableLayout.columns
    );
    result.set(project.id, tables);
  }

  return result;
}

/**
 * Získat seed tabulky pro konkrétní projekt
 */
export function getSeedTablesForProject(projectId: string): Table[] {
  const project = SEED_PROJECTS.find((p) => p.id === projectId);
  if (!project) return [];

  return generateTablesForProject(
    project.id,
    project.tableLayout.rows,
    project.tableLayout.columns
  );
}

/**
 * Pre-generované tabulky pro rychlý přístup
 */
export const SEED_TABLES = generateAllSeedTables();
