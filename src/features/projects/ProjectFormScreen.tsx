/**
 * MST Project Form Screen - 2026 Glassmorphism Edition
 * 
 * Formulář pro vytvoření a editaci projektu.
 */

import React, { useState, useEffect } from 'react';
import {
  Screen,
  ScreenHeader,
  ScreenFooter,
  BackButton,
  Card,
  Section,
  Input,
  TextArea,
  Button,
  GradientButton,
  LoadingScreen,
} from '../../shared';
import { useProjects, type ProjectDetailVM, DEFAULT_CREATE_PROJECT_FORM } from '../../application';
import type { CreateProjectDto, UpdateProjectDto } from '../../domain';

/**
 * Props
 */
export interface ProjectFormScreenProps {
  /** ID projektu pro editaci (undefined = nový projekt) */
  projectId?: string;
  onBack: () => void;
  onSuccess: (project: ProjectDetailVM) => void;
}

/**
 * Form state
 */
interface FormState {
  name: string;
  description: string;
  location: string;
  gridRows: number;
  gridColumns: number;
}

/**
 * Form errors
 */
interface FormErrors {
  name?: string;
  gridRows?: string;
  gridColumns?: string;
}

/**
 * ProjectFormScreen Component
 */
export function ProjectFormScreen({
  projectId,
  onBack,
  onSuccess,
}: ProjectFormScreenProps) {
  const {
    activeProject,
    loadProjectDetail,
    createProject,
    updateProject,
    createMutation,
    updateMutation,
  } = useProjects();

  const isEditing = !!projectId;

  // Form state
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    location: '',
    gridRows: 10,
    gridColumns: 10,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Load existing project for editing
  useEffect(() => {
    if (projectId) {
      loadProjectDetail(projectId);
    }
  }, [projectId, loadProjectDetail]);

  // Populate form when project loads
  useEffect(() => {
    if (isEditing && activeProject.data) {
      const p = activeProject.data;
      setForm({
        name: p.name,
        description: p.description ?? '',
        location: p.location ?? '',
        gridRows: p.gridRows,
        gridColumns: p.gridColumns,
      });
    }
  }, [isEditing, activeProject.data]);

  // Loading state for edit mode
  if (isEditing && activeProject.status === 'loading' && !activeProject.data) {
    return <LoadingScreen message="Načítám projekt..." />;
  }

  /**
   * Validate form
   */
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Název je povinný';
    } else if (form.name.length < 3) {
      newErrors.name = 'Název musí mít alespoň 3 znaky';
    }

    if (form.gridRows < 1 || form.gridRows > 100) {
      newErrors.gridRows = 'Počet řádků musí být 1-100';
    }

    if (form.gridColumns < 1 || form.gridColumns > 100) {
      newErrors.gridColumns = 'Počet sloupců musí být 1-100';
    }

    return newErrors;
  };

  /**
   * Handle field change
   */
  const handleChange = (field: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handle field blur
   */
  const handleBlur = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
    
    // Validate on blur
    const newErrors = validate();
    setErrors(newErrors);
  };

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    // Mark all as touched
    setTouched(new Set(['name', 'gridRows', 'gridColumns']));
    
    // Validate
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    if (isEditing && projectId) {
      // Update
      const dto: UpdateProjectDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
      };

      await updateProject(projectId, dto, {
        onSuccess: (project) => {
          onSuccess(project);
        },
      });
    } else {
      // Create
      const dto: CreateProjectDto = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        gridConfig: {
          rows: form.gridRows,
          columns: form.gridColumns,
        },
      };

      await createProject(dto, {
        onSuccess: (project) => {
          onSuccess(project);
        },
      });
    }
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;
  const mutationError = createMutation.error || updateMutation.error;
  const totalTables = form.gridRows * form.gridColumns;

  return (
    <Screen
      header={
        <ScreenHeader
          title={isEditing ? 'Upravit projekt' : 'Nový projekt'}
          leftAction={<BackButton onClick={onBack} label="Zrušit" />}
        />
      }
      footer={
        <ScreenFooter>
          <GradientButton
            gradient="brand"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={isLoading}
          >
            {isEditing ? 'Uložit změny' : 'Vytvořit projekt'}
          </GradientButton>
        </ScreenFooter>
      }
    >
      {/* Error Banner */}
      {mutationError && (
        <div className="mb-4 p-4 rounded-xl bg-error-100 dark:bg-error-900/30 border border-error-200 dark:border-error-800">
          <p className="text-sm text-error-700 dark:text-error-300">{mutationError}</p>
        </div>
      )}

      {/* Basic Info */}
      <Section title="Základní informace">
        <Card variant="glass" padding="lg" className="space-y-4">
          <Input
            label="Název projektu *"
            placeholder="např. Solární elektrárna Brno"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.has('name') ? errors.name : undefined}
            variant="solid"
          />

          <Input
            label="Lokalita"
            placeholder="např. Brno, Česká republika"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            variant="solid"
            leftIcon={<LocationIcon className="w-5 h-5" />}
          />

          <TextArea
            label="Popis"
            placeholder="Volitelný popis projektu..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            variant="solid"
            rows={3}
          />
        </Card>
      </Section>

      {/* Grid Configuration */}
      {!isEditing && (
        <Section title="Konfigurace gridu" className="mt-6">
          <Card variant="glass" padding="lg" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Počet řádků *"
                type="number"
                min={1}
                max={100}
                value={form.gridRows}
                onChange={(e) => handleChange('gridRows', parseInt(e.target.value) || 1)}
                onBlur={() => handleBlur('gridRows')}
                error={touched.has('gridRows') ? errors.gridRows : undefined}
                variant="solid"
              />

              <Input
                label="Počet sloupců *"
                type="number"
                min={1}
                max={100}
                value={form.gridColumns}
                onChange={(e) => handleChange('gridColumns', parseInt(e.target.value) || 1)}
                onBlur={() => handleBlur('gridColumns')}
                error={touched.has('gridColumns') ? errors.gridColumns : undefined}
                variant="solid"
              />
            </div>

            {/* Grid Preview */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">Náhled gridu</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {totalTables} stolů
                </span>
              </div>
              
              <GridPreview rows={Math.min(form.gridRows, 10)} columns={Math.min(form.gridColumns, 10)} />
              
              {(form.gridRows > 10 || form.gridColumns > 10) && (
                <p className="text-xs text-slate-400 mt-2">
                  Zobrazeno max. 10×10 (skutečná velikost: {form.gridRows}×{form.gridColumns})
                </p>
              )}
            </div>
          </Card>
        </Section>
      )}

      {/* Info for edit mode */}
      {isEditing && (
        <Section title="Konfigurace gridu" className="mt-6">
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <InfoIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Velikost gridu nelze měnit po vytvoření projektu.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Aktuální: {activeProject.data?.gridRows} × {activeProject.data?.gridColumns} stolů
                </p>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {/* Summary */}
      {!isEditing && totalTables > 0 && (
        <Section title="Souhrn" className="mt-6 mb-8">
          <Card variant="gradient" padding="lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTables}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stolů</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalTables * 4}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Stringů</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {(totalTables * 4 * 36 * 0.5 / 1000).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">kWp</p>
              </div>
            </div>
          </Card>
        </Section>
      )}
    </Screen>
  );
}

/**
 * Grid Preview Component
 */
function GridPreview({ rows, columns }: { rows: number; columns: number }) {
  const cellSize = Math.min(24, Math.floor(280 / Math.max(rows, columns)));
  const gap = 2;

  return (
    <div
      className="flex flex-wrap justify-center"
      style={{
        width: columns * (cellSize + gap),
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: rows * columns }).map((_, index) => (
        <div
          key={index}
          className="rounded bg-brand-200 dark:bg-brand-800/50"
          style={{
            width: cellSize,
            height: cellSize,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Icons
 */
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

export default ProjectFormScreen;
