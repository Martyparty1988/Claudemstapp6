/**
 * Projects Feature - ProjectsScreen - 2026 Glassmorphism Edition
 * 
 * Seznam projektů s moderním designem.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Screen,
  ScreenHeader,
  Card,
  Button,
  IconButton,
  GradientButton,
  LoadingScreen,
  EmptyState,
  Section,
  SearchInput,
  PullToRefresh,
  useSearch,
} from '../../shared';
import { useProjects, type ProjectListItemVM } from '../../application';

/**
 * Props
 */
export interface ProjectsScreenProps {
  /** Callback pro výběr projektu */
  onSelectProject?: (projectId: string) => void;
  /** Callback pro vytvoření projektu */
  onCreateProject?: () => void;
}

/**
 * ProjectsScreen Component
 */
export function ProjectsScreen({
  onSelectProject,
  onCreateProject,
}: ProjectsScreenProps) {
  const {
    projects,
    loadProjects,
    refresh,
  } = useProjects();

  const [showSearch, setShowSearch] = useState(false);

  // Load on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Search hook
  const {
    query,
    setQuery,
    filteredItems,
    clearSearch,
    hasQuery,
  } = useSearch<ProjectListItemVM>(
    [...(projects.data ?? [])],
    (project, q) =>
      project.name.toLowerCase().includes(q) ||
      (project.location?.toLowerCase().includes(q) ?? false),
    { debounceMs: 200 }
  );

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  // Loading
  if (projects.status === 'loading' && !projects.data) {
    return <LoadingScreen message="Načítám projekty..." />;
  }

  // Error
  if (projects.status === 'error' && !projects.data) {
    return (
      <Screen
        header={<ScreenHeader title="Projekty" largeTitle />}
      >
        <EmptyState
          icon={<ErrorIcon className="w-8 h-8" />}
          title="Nepodařilo se načíst"
          description={projects.error ?? 'Zkuste to prosím znovu'}
          action={<Button onClick={refresh}>Zkusit znovu</Button>}
          className="h-full"
        />
      </Screen>
    );
  }

  const projectList = hasQuery ? filteredItems : (projects.data ?? []);
  const activeProjects = projectList.filter(p => p.status === 'active');
  const otherProjects = projectList.filter(p => p.status !== 'active');

  return (
    <Screen
      header={
        <ScreenHeader
          title="Projekty"
          largeTitle
          rightAction={
            <div className="flex items-center gap-2">
              <IconButton
                icon={<SearchIcon className="w-5 h-5" />}
                label="Hledat"
                variant="ghost"
                onClick={() => setShowSearch(!showSearch)}
              />
              {onCreateProject && (
                <IconButton
                  icon={<PlusIcon className="w-5 h-5" />}
                  label="Nový projekt"
                  variant="glass"
                  onClick={onCreateProject}
                />
              )}
            </div>
          }
        />
      }
    >
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        {/* Search bar */}
        {showSearch && (
          <div className="px-4 pb-4 animate-slide-down">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClear={clearSearch}
              placeholder="Hledat projekt..."
              variant="solid"
              autoFocus
            />
          </div>
        )}

        {projectList.length === 0 ? (
          <EmptyState
            icon={hasQuery ? <SearchEmptyIcon className="w-8 h-8" /> : <FolderIcon className="w-8 h-8" />}
            title={hasQuery ? 'Nic nenalezeno' : 'Žádné projekty'}
            description={
              hasQuery
                ? `Žádné projekty neodpovídají "${query}"`
                : 'Vytvořte svůj první projekt pro sledování práce na solární elektrárně'
            }
            action={
              hasQuery ? (
                <Button variant="secondary" onClick={clearSearch}>
                  Zrušit hledání
                </Button>
              ) : onCreateProject ? (
                <GradientButton gradient="brand" onClick={onCreateProject}>
                  Vytvořit projekt
                </GradientButton>
              ) : undefined
            }
            className="py-16"
          />
        ) : (
          <div className="pb-8">
            {/* Active Projects */}
            {activeProjects.length > 0 && (
              <Section title={`Aktivní projekty${hasQuery ? ` (${activeProjects.length})` : ''}`}>
                <div className="space-y-3">
                  {activeProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPress={() => onSelectProject?.(project.id)}
                      featured
                      highlight={query}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Other Projects */}
            {otherProjects.length > 0 && (
              <Section 
                title={`Ostatní projekty${hasQuery ? ` (${otherProjects.length})` : ''}`} 
                className={activeProjects.length > 0 ? 'mt-6' : ''}
              >
                <div className="space-y-3">
                  {otherProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onPress={() => onSelectProject?.(project.id)}
                      highlight={query}
                    />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </PullToRefresh>
    </Screen>
  );
}

/**
 * Highlight text helper
 */
function highlightText(text: string, highlight: string): React.ReactNode {
  if (!highlight.trim()) return text;
  
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-warning-200 dark:bg-warning-900/50 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : part
  );
}

/**
 * Project card
 */
function ProjectCard({
  project,
  onPress,
  featured = false,
  highlight = '',
}: {
  project: ProjectListItemVM;
  onPress: () => void;
  featured?: boolean;
  highlight?: string;
}) {
  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    active: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
    completed: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
  };

  if (featured) {
    return (
      <div
        onClick={onPress}
        className="relative overflow-hidden rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
      >
        {/* Gradient border */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl" />
        
        {/* Content */}
        <div className="relative m-[1px] bg-white dark:bg-slate-900 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {highlightText(project.name, highlight)}
              </h3>
              {project.location && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  <LocationIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{highlightText(project.location, highlight)}</span>
                </div>
              )}
            </div>
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2
              ${statusColors[project.status]}
            `}>
              {project.statusLabel}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-500 dark:text-slate-400">Dokončeno</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {project.completionPercentage}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${project.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {project.completedTables}/{project.totalTables} stolů
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {project.totalKwp} kWp
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      variant="glass"
      padding="md"
      hover
      onClick={onPress}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
            {highlightText(project.name, highlight)}
          </h3>
          {project.location && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
              {highlightText(project.location, highlight)}
            </p>
          )}
        </div>
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ml-2
          ${statusColors[project.status]}
        `}>
          {project.statusLabel}
        </span>
      </div>

      {/* Mini progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full"
            style={{ width: `${project.completionPercentage}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {project.completionPercentage}%
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span>{project.completedTables}/{project.totalTables} stolů</span>
        <span>{project.totalKwp} kWp</span>
      </div>
    </Card>
  );
}

/**
 * Icons
 */
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function SearchEmptyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
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

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

export default ProjectsScreen;
