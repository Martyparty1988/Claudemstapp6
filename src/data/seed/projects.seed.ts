/**
 * MST Seed Data - Projects
 * 
 * Demo projekty pro testování.
 * Používá domain typy Project.
 */

import type { Project, ProjectStatus } from '../../domain/types';

/**
 * Extended project type pro seed (s extra daty pro UI)
 */
export interface SeedProject extends Project {
  /** Klient (pro UI zobrazení) */
  client?: string;
  /** Rozšířená lokace */
  locationData?: {
    address: string;
    coordinates?: { latitude: number; longitude: number };
  };
  /** Pre-computed statistiky pro seed */
  statistics: {
    totalTables: number;
    completedTables: number;
    totalPanels: number;
    installedPanels: number;
    totalKWp: number;
    installedKWp: number;
  };
  /** Layout řádky/sloupce - kopie z gridConfig */
  tableLayout: {
    rows: number;
    columns: number;
  };
}

/**
 * Demo projekty
 */
export const SEED_PROJECTS: SeedProject[] = [
  {
    id: 'project-1',
    name: 'Solar Park Alpha',
    description: 'Velká solární elektrárna pro EnergyCo',
    location: 'Průmyslová 123, Brno',
    client: 'EnergyCo s.r.o.',
    locationData: {
      address: 'Průmyslová 123, Brno',
      coordinates: { latitude: 49.1951, longitude: 16.6068 },
    },
    status: 'active',
    gridConfig: { rows: 12, columns: 8 },
    tableLayout: { rows: 12, columns: 8 },
    statistics: {
      totalTables: 96,
      completedTables: 42,
      totalPanels: 2880,
      installedPanels: 1260,
      totalKWp: 576,
      installedKWp: 252,
    },
    createdAt: new Date('2025-01-02').getTime(),
    updatedAt: Date.now(),
  },
  {
    id: 'project-2',
    name: 'Rodinný dům Nováků',
    description: 'Střešní instalace pro rodinný dům',
    location: 'Lipová 45, Praha 4',
    client: 'Jan Novák',
    locationData: {
      address: 'Lipová 45, Praha 4',
      coordinates: { latitude: 50.0405, longitude: 14.4318 },
    },
    status: 'active',
    gridConfig: { rows: 3, columns: 4 },
    tableLayout: { rows: 3, columns: 4 },
    statistics: {
      totalTables: 12,
      completedTables: 8,
      totalPanels: 36,
      installedPanels: 24,
      totalKWp: 14.4,
      installedKWp: 9.6,
    },
    createdAt: new Date('2024-12-20').getTime(),
    updatedAt: Date.now(),
  },
  {
    id: 'project-3',
    name: 'Logistické centrum Beta',
    description: 'Velká střešní instalace na logistickém centru',
    location: 'Skladová 789, Ostrava',
    client: 'LogiTrans a.s.',
    locationData: {
      address: 'Skladová 789, Ostrava',
      coordinates: { latitude: 49.8209, longitude: 18.2625 },
    },
    status: 'draft',
    gridConfig: { rows: 20, columns: 15 },
    tableLayout: { rows: 20, columns: 15 },
    statistics: {
      totalTables: 300,
      completedTables: 0,
      totalPanels: 9000,
      installedPanels: 0,
      totalKWp: 1800,
      installedKWp: 0,
    },
    createdAt: new Date('2025-01-03').getTime(),
    updatedAt: Date.now(),
  },
  {
    id: 'project-4',
    name: 'Farma Slunečnice',
    description: 'Pozemní solární elektrárna',
    location: 'Polní 12, Znojmo',
    client: 'Agro Morava s.r.o.',
    locationData: {
      address: 'Polní 12, Znojmo',
      coordinates: { latitude: 48.8555, longitude: 16.0488 },
    },
    status: 'completed',
    gridConfig: { rows: 8, columns: 10 },
    tableLayout: { rows: 8, columns: 10 },
    statistics: {
      totalTables: 80,
      completedTables: 80,
      totalPanels: 2400,
      installedPanels: 2400,
      totalKWp: 480,
      installedKWp: 480,
    },
    createdAt: new Date('2024-10-15').getTime(),
    updatedAt: new Date('2024-12-12').getTime(),
  },
  {
    id: 'project-5',
    name: 'Škola Budoucnosti',
    description: 'Střešní instalace na školní budově',
    location: 'Školní 234, Pardubice',
    client: 'Město Pardubice',
    locationData: {
      address: 'Školní 234, Pardubice',
      coordinates: { latitude: 50.0343, longitude: 15.7812 },
    },
    status: 'draft', // on_hold -> draft (používáme domain status)
    gridConfig: { rows: 6, columns: 8 },
    tableLayout: { rows: 6, columns: 8 },
    statistics: {
      totalTables: 48,
      completedTables: 24,
      totalPanels: 1440,
      installedPanels: 720,
      totalKWp: 288,
      installedKWp: 144,
    },
    createdAt: new Date('2024-11-20').getTime(),
    updatedAt: new Date('2025-01-02').getTime(),
  },
];

/**
 * Získat projekt podle ID
 */
export function getSeedProjectById(id: string): SeedProject | undefined {
  return SEED_PROJECTS.find((p) => p.id === id);
}

/**
 * Získat aktivní projekty
 */
export function getActiveSeedProjects(): SeedProject[] {
  return SEED_PROJECTS.filter((p) => p.status === 'active');
}
