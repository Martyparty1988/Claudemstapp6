/**
 * FieldMap - FieldMapScreen
 * 
 * Hlavní obrazovka FieldMap.
 * Kompozice všech komponent + useFieldMap hook.
 * 
 * FLOW:
 * 1. Načtení dat (useFieldMap)
 * 2. Zobrazení mřížky stolů
 * 3. Výběr stolů (pouze UI stav)
 * 4. Otevření bottom sheetu
 * 5. Potvrzení → zápis dat
 */

import React, { useCallback } from 'react';
import {
  Screen,
  ScreenHeader,
  ScreenContent,
  LoadingScreen,
  ErrorState,
  IconButton,
} from '../../shared';
import { useFieldMap } from '../../application';
import {
  TableGrid,
  SelectionBar,
  WorkConfirmationSheet,
  StatsHeader,
  QuickActions,
} from './components';

/**
 * Props
 */
export interface FieldMapScreenProps {
  /** ID projektu */
  projectId: string;
  /** Callback pro návrat */
  onBack?: () => void;
}

/**
 * FieldMapScreen Component
 */
export function FieldMapScreen({ projectId, onBack }: FieldMapScreenProps) {
  // Hook - veškerá logika
  const {
    fieldMap,
    selection,
    confirmationSheet,
    submitMutation,
    toggleTableSelection,
    clearSelection,
    selectAllPending,
    openConfirmationSheet,
    closeConfirmationSheet,
    setWorkType,
    setNotes,
    submitWork,
    refresh,
  } = useFieldMap(projectId);

  // Handlers
  const handleTablePress = useCallback(
    (tableId: string) => {
      toggleTableSelection(tableId);
    },
    [toggleTableSelection]
  );

  const handleConfirm = useCallback(() => {
    openConfirmationSheet();
  }, [openConfirmationSheet]);

  // Loading state
  if (fieldMap.status === 'loading' && !fieldMap.data) {
    return <LoadingScreen message="Načítám mapu..." />;
  }

  // Error state
  if (fieldMap.status === 'error' && !fieldMap.data) {
    return (
      <Screen>
        <ErrorState
          title="Nepodařilo se načíst"
          message={fieldMap.error ?? 'Zkuste to prosím znovu'}
          onRetry={refresh}
          className="h-full"
        />
      </Screen>
    );
  }

  // No data
  if (!fieldMap.data) {
    return (
      <Screen>
        <ErrorState
          title="Projekt nenalezen"
          message="Tento projekt neexistuje nebo byl smazán"
          className="h-full"
        />
      </Screen>
    );
  }

  const { projectName, columns, tables, statistics } = fieldMap.data;

  return (
    <Screen
      header={
        <ScreenHeader
          title="Práce"
          leftAction={
            onBack && (
              <IconButton
                icon={<BackIcon />}
                label="Zpět"
                onClick={onBack}
              />
            )
          }
          rightAction={
            <IconButton
              icon={<RefreshIcon />}
              label="Obnovit"
              onClick={refresh}
            />
          }
        />
      }
      footer={
        <SelectionBar
          selection={selection}
          onConfirm={handleConfirm}
          onClear={clearSelection}
          confirmDisabled={submitMutation.isLoading}
        />
      }
      // Přidáme padding bottom pokud je selection bar viditelný
      className={selection.selectedCount > 0 ? 'pb-32' : ''}
    >
      <ScreenContent>
        {/* Stats header */}
        <StatsHeader
          projectName={projectName}
          statistics={statistics}
          className="mb-4"
        />

        {/* Quick actions */}
        <QuickActions
          hasSelection={selection.selectedCount > 0}
          pendingCount={statistics.pendingTables}
          onSelectAllPending={selectAllPending}
          onClearSelection={clearSelection}
          onRefresh={refresh}
          className="mb-4"
        />

        {/* Table grid */}
        <TableGrid
          tables={tables}
          columns={columns}
          onTablePress={handleTablePress}
          showLegend
        />
      </ScreenContent>

      {/* Work confirmation sheet */}
      <WorkConfirmationSheet
        sheet={confirmationSheet}
        onClose={closeConfirmationSheet}
        onWorkTypeChange={setWorkType}
        onNotesChange={setNotes}
        onSubmit={submitWork}
        isSubmitting={submitMutation.isLoading}
        submitError={submitMutation.error}
      />
    </Screen>
  );
}

/**
 * Icons
 */
function BackIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

/**
 * Default export
 */
export default FieldMapScreen;
