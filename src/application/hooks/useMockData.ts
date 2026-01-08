/**
 * MST Mock Hooks - Development Only
 * 
 * Tyto hooky používají seed data místo databáze.
 * Použij je pro rychlé testování UI bez backend napojení.
 * 
 * POZNÁMKA: Tyto hooky jsou alternativou k produkčním hookům.
 * Pro chat používáme přímo useChat hook se seed daty.
 */

import { useState, useCallback } from 'react';
import { SEED_PROJECTS } from '../../data/seed';
import type { ProjectListItemVM } from '../view-models';
import type { AsyncState } from '../types';
import {
  loadingState,
  successState,
  idleState,
} from '../types';

// ============ PROJECTS ============

/**
 * Mock useProjects hook
 */
export function useMockProjects() {
  const [projects, setProjects] = useState<AsyncState<ProjectListItemVM[]>>(idleState());

  const loadProjects = useCallback(async () => {
    setProjects(loadingState());
    
    // Simulace network delay
    await new Promise((r) => setTimeout(r, 500));

    const mapped: ProjectListItemVM[] = SEED_PROJECTS.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location ?? null,
      status: p.status,
      statusLabel: getStatusLabel(p.status),
      completionPercentage: Math.round((p.statistics.completedTables / p.statistics.totalTables) * 100),
      totalTables: p.statistics.totalTables,
      completedTables: p.statistics.completedTables,
      totalKwp: `${p.statistics.totalKWp} kWp`,
      updatedAt: new Date(p.updatedAt).toLocaleDateString('cs-CZ'),
      isActive: p.status === 'active',
    }));

    setProjects(successState(mapped));
  }, []);

  const refresh = useCallback(() => loadProjects(), [loadProjects]);

  return { projects, loadProjects, refresh };
}

// ============ HELPERS ============

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planning: 'Plánování',
    in_progress: 'Probíhá',
    completed: 'Dokončeno',
    on_hold: 'Pozastaveno',
    draft: 'Koncept',
    active: 'Aktivní',
    archived: 'Archivováno',
  };
  return labels[status] ?? status;
}
