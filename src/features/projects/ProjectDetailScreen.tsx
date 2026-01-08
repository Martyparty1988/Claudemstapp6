/**
 * MST Project Detail Screen - 2026 Glassmorphism Edition
 * 
 * Detail projektu se statistikami a akcemi.
 */

import React, { useEffect, useState } from 'react';
import {
  Screen,
  ScreenHeader,
  ScreenFooter,
  BackButton,
  Card,
  Section,
  Button,
  GradientButton,
  LoadingScreen,
  ErrorState,
  EmptyState,
  AlertModal,
} from '../../shared';
import { useProjects, type ProjectDetailVM } from '../../application';

/**
 * Props
 */
export interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
  onStartWork: (projectId: string) => void;
  onEdit?: (projectId: string) => void;
}

/**
 * ProjectDetailScreen Component
 */
export function ProjectDetailScreen({
  projectId,
  onBack,
  onStartWork,
  onEdit,
}: ProjectDetailScreenProps) {
  const {
    activeProject,
    loadProjectDetail,
    deleteProject,
    deleteMutation,
  } = useProjects();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load project on mount
  useEffect(() => {
    loadProjectDetail(projectId);
  }, [projectId, loadProjectDetail]);

  // Loading state
  if (activeProject.status === 'loading' && !activeProject.data) {
    return <LoadingScreen message="Načítám projekt..." />;
  }

  // Error state
  if (activeProject.status === 'error' && !activeProject.data) {
    return (
      <Screen
        header={
          <ScreenHeader
            title="Projekt"
            leftAction={<BackButton onClick={onBack} />}
          />
        }
      >
        <ErrorState
          title="Nepodařilo se načíst"
          message={activeProject.error ?? 'Projekt nebyl nalezen'}
          onRetry={() => loadProjectDetail(projectId)}
          className="h-full"
        />
      </Screen>
    );
  }

  const project = activeProject.data;

  if (!project) {
    return (
      <Screen
        header={
          <ScreenHeader
            title="Projekt"
            leftAction={<BackButton onClick={onBack} />}
          />
        }
      >
        <EmptyState
          title="Projekt nenalezen"
          description="Tento projekt neexistuje nebo byl smazán"
          action={<Button onClick={onBack}>Zpět na projekty</Button>}
        />
      </Screen>
    );
  }

  const handleDelete = async () => {
    await deleteProject(projectId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        onBack();
      },
    });
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title={project.name}
          leftAction={<BackButton onClick={onBack} label="Zpět" />}
          rightAction={
            onEdit && (
              <button
                onClick={() => onEdit(projectId)}
                className="text-brand-600 dark:text-brand-400 font-medium"
              >
                Upravit
              </button>
            )
          }
        />
      }
      footer={
        <ScreenFooter>
          <GradientButton
            gradient="success"
            fullWidth
            size="lg"
            onClick={() => onStartWork(projectId)}
            leftIcon={<PlayIcon className="w-5 h-5" />}
          >
            Začít práci
          </GradientButton>
        </ScreenFooter>
      }
    >
      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        <StatusBadge status={project.status} />
        {project.location && (
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <LocationIcon className="w-4 h-4" />
            {project.location}
          </div>
        )}
      </div>

      {/* Progress Hero Card */}
      <ProgressHeroCard project={project} />

      {/* Statistics Grid */}
      <Section title="Statistiky" className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Celkem stolů"
            value={project.statistics.totalTables}
            icon={<GridIcon className="w-5 h-5" />}
            color="brand"
          />
          <StatCard
            label="Dokončeno"
            value={project.statistics.completedTables}
            icon={<CheckIcon className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            label="Rozpracováno"
            value={project.statistics.inProgressTables}
            icon={<ClockIcon className="w-5 h-5" />}
            color="warning"
          />
          <StatCard
            label="Přeskočeno"
            value={project.statistics.skippedTables}
            icon={<SkipIcon className="w-5 h-5" />}
            color="muted"
          />
        </div>
      </Section>

      {/* Technical Details */}
      <Section title="Technické údaje" className="mt-6">
        <Card variant="glass" padding="none">
          <DetailRow
            label="Stringy"
            value={project.statistics.totalStrings.toLocaleString()}
            isFirst
          />
          <DetailRow
            label="Panely"
            value={project.statistics.totalPanels.toLocaleString()}
          />
          <DetailRow
            label="Výkon"
            value={`${project.statistics.totalKwp} kWp`}
            highlight
          />
          <DetailRow
            label="Grid"
            value={`${project.gridRows} × ${project.gridColumns}`}
            isLast
          />
        </Card>
      </Section>

      {/* Description */}
      {project.description && (
        <Section title="Popis" className="mt-6">
          <Card variant="glass">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {project.description}
            </p>
          </Card>
        </Section>
      )}

      {/* Metadata */}
      <Section title="Informace" className="mt-6">
        <Card variant="glass" padding="none">
          <DetailRow
            label="Vytvořeno"
            value={project.createdAt}
            isFirst
          />
          <DetailRow
            label="Aktualizováno"
            value={project.updatedAt}
            isLast
          />
        </Card>
      </Section>

      {/* Danger Zone */}
      <Section title="Nebezpečná zóna" className="mt-6 mb-8">
        <Card variant="outline" className="border-error-200 dark:border-error-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Smazat projekt</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tato akce je nevratná
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              Smazat
            </Button>
          </div>
        </Card>
      </Section>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Smazat projekt?"
        message={`Opravdu chcete smazat projekt "${project.name}"? Všechna data včetně záznamů práce budou trvale odstraněna.`}
        confirmText={deleteMutation.isLoading ? 'Mažu...' : 'Smazat'}
        cancelText="Zrušit"
        variant="danger"
      />
    </Screen>
  );
}

/**
 * Progress Hero Card
 */
function ProgressHeroCard({ project }: { project: ProjectDetailVM }) {
  const { statistics } = project;
  const percentage = statistics.completionPercentage;

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600" />
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-400/20 rounded-full blur-2xl -translate-x-6 translate-y-6" />

      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Postup</p>
            <p className="text-4xl font-bold">{percentage}%</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CircularProgress percentage={percentage} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-white/80 text-sm mt-3">
          {statistics.completedTables} z {statistics.totalTables} stolů dokončeno
        </p>
      </div>
    </div>
  );
}

/**
 * Circular Progress
 */
function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 48 48">
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="4"
      />
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-500"
      />
    </svg>
  );
}

/**
 * Stat Card
 */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'brand' | 'success' | 'warning' | 'muted';
}) {
  const colors = {
    brand: {
      bg: 'bg-brand-100 dark:bg-brand-900/30',
      text: 'text-brand-600 dark:text-brand-400',
    },
    success: {
      bg: 'bg-success-100 dark:bg-success-900/30',
      text: 'text-success-600 dark:text-success-400',
    },
    warning: {
      bg: 'bg-warning-100 dark:bg-warning-900/30',
      text: 'text-warning-600 dark:text-warning-400',
    },
    muted: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-400',
    },
  };

  const styles = colors[color];

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold ${styles.text}`}>{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Detail Row
 */
function DetailRow({
  label,
  value,
  highlight,
  isFirst,
  isLast,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div
      className={`
        flex items-center justify-between px-4 py-3
        ${!isLast ? 'border-b border-slate-200/50 dark:border-slate-700/50' : ''}
      `}
    >
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-medium ${highlight ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * Status Badge
 */
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    draft: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      label: 'Koncept',
    },
    active: {
      bg: 'bg-brand-100 dark:bg-brand-900/30',
      text: 'text-brand-600 dark:text-brand-400',
      label: 'Aktivní',
    },
    completed: {
      bg: 'bg-success-100 dark:bg-success-900/30',
      text: 'text-success-600 dark:text-success-400',
      label: 'Dokončeno',
    },
    archived: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-500 dark:text-slate-500',
      label: 'Archivováno',
    },
  };

  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

/**
 * Icons
 */
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SkipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
    </svg>
  );
}

export default ProjectDetailScreen;
