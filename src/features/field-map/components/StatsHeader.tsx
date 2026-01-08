/**
 * FieldMap - StatsHeader Component
 * 
 * Horní část FieldMap se statistikami projektu.
 */

import React from 'react';
import { ProgressBadge } from '../../../shared';
import type { FieldMapStatisticsVM } from '../../../application';

/**
 * Props
 */
export interface StatsHeaderProps {
  /** Název projektu */
  projectName: string;
  /** Statistiky */
  statistics: FieldMapStatisticsVM;
  /** Custom className */
  className?: string;
}

/**
 * StatsHeader Component
 */
export function StatsHeader({
  projectName,
  statistics,
  className = '',
}: StatsHeaderProps) {
  return (
    <div className={`bg-white rounded-ios-lg shadow-ios p-4 ${className}`}>
      {/* Project name */}
      <h2 className="text-ios-headline text-gray-900 mb-3">{projectName}</h2>

      {/* Progress */}
      <ProgressBadge
        value={statistics.completionPercentage}
        label="Postup"
        size="md"
        className="mb-4"
      />

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatItem
          value={statistics.totalTables}
          label="Celkem"
        />
        <StatItem
          value={statistics.completedTables}
          label="Hotovo"
          color="text-ios-green"
        />
        <StatItem
          value={statistics.pendingTables}
          label="Čeká"
          color="text-ios-gray"
        />
        <StatItem
          value={statistics.todayCompleted}
          label="Dnes"
          color="text-ios-blue"
        />
      </div>
    </div>
  );
}

/**
 * Stat item helper
 */
function StatItem({
  value,
  label,
  color = 'text-gray-900',
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-ios-title3 font-semibold ${color}`}>{value}</p>
      <p className="text-ios-caption2 text-ios-gray">{label}</p>
    </div>
  );
}

/**
 * StatsHeaderCompact - kompaktní verze
 */
export function StatsHeaderCompact({
  projectName,
  statistics,
  className = '',
}: StatsHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        <h2 className="text-ios-headline text-gray-900">{projectName}</h2>
        <p className="text-ios-caption1 text-ios-gray">
          {statistics.completedTables}/{statistics.totalTables} stolů · {statistics.completionPercentage}%
        </p>
      </div>

      <div className="text-right">
        <p className="text-ios-title3 font-semibold text-ios-blue">
          {statistics.todayCompleted}
        </p>
        <p className="text-ios-caption2 text-ios-gray">dnes</p>
      </div>
    </div>
  );
}
