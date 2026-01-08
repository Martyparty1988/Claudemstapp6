/**
 * FieldMap - WorkConfirmationSheet Component
 * 
 * iOS-style bottom sheet pro potvrzení práce.
 * KLÍČOVÁ KOMPONENTA - jediné místo kde se spouští zápis dat.
 * 
 * PRAVIDLA:
 * - Žádná business logika
 * - Žádné přímé ukládání dat
 * - Pouze UI + volání onSubmit
 */

import React from 'react';
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetContent,
  BottomSheetFooter,
  Button,
  TextButton,
  TextArea,
  ChipGroup,
  SuccessBanner,
  ErrorBanner,
  hapticFeedback,
  type ChipOption,
} from '../../../shared';
import type { WorkConfirmationSheetVM } from '../../../application';
import { WORK_TYPE_LABELS } from '../../../application';
import type { WorkType } from '../../../domain';

/**
 * Props
 */
export interface WorkConfirmationSheetProps {
  /** Sheet state */
  sheet: WorkConfirmationSheetVM;
  /** Zavření sheetu */
  onClose: () => void;
  /** Změna work type */
  onWorkTypeChange: (workType: WorkType) => void;
  /** Změna poznámek */
  onNotesChange: (notes: string) => void;
  /** Potvrzení - SPOUŠTÍ ZÁPIS */
  onSubmit: () => void;
  /** Je submit loading */
  isSubmitting?: boolean;
  /** Submit error */
  submitError?: string | null;
  /** Submit success */
  submitSuccess?: boolean;
}

/**
 * Work type options pro ChipGroup
 */
const WORK_TYPE_OPTIONS: readonly ChipOption[] = [
  { value: 'installation', label: WORK_TYPE_LABELS.installation },
  { value: 'inspection', label: WORK_TYPE_LABELS.inspection },
  { value: 'maintenance', label: WORK_TYPE_LABELS.maintenance },
  { value: 'repair', label: WORK_TYPE_LABELS.repair },
];

/**
 * WorkConfirmationSheet Component
 */
export function WorkConfirmationSheet({
  sheet,
  onClose,
  onWorkTypeChange,
  onNotesChange,
  onSubmit,
  isSubmitting = false,
  submitError = null,
  submitSuccess = false,
}: WorkConfirmationSheetProps) {
  
  const handleSubmit = () => {
    hapticFeedback('medium');
    onSubmit();
  };

  const handleClose = () => {
    hapticFeedback('light');
    onClose();
  };

  return (
    <BottomSheet
      isOpen={sheet.isOpen}
      onClose={handleClose}
      height="auto"
      showHandle
      disableSwipe={isSubmitting}
    >
      {/* Header */}
      <BottomSheetHeader
        title="Potvrdit práci"
        leftAction={
          <TextButton 
            color="brand" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Zrušit
          </TextButton>
        }
        rightAction={null}
      />

      {/* Content */}
      <BottomSheetContent>
        {/* Success message */}
        {submitSuccess && (
          <SuccessBanner
            message="Práce byla úspěšně uložena!"
            className="mb-4"
          />
        )}

        {/* Summary */}
        <div className="bg-ios-gray-6 rounded-ios-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <SummaryItem
              label="Stolů"
              value={sheet.summary.tableCount.toString()}
            />
            <SummaryItem
              label="Stringů"
              value={sheet.summary.totalStrings.toString()}
            />
            <SummaryItem
              label="Panelů"
              value={sheet.summary.totalPanels.toString()}
            />
            <SummaryItem
              label="kWp"
              value={sheet.summary.totalKwp}
            />
          </div>
        </div>

        {/* Work type selection */}
        <div className="mb-4">
          <label className="block text-ios-subhead text-gray-700 mb-2">
            Typ práce
          </label>
          <ChipGroup
            options={WORK_TYPE_OPTIONS}
            value={sheet.workType}
            onChange={(value) => onWorkTypeChange(value as WorkType)}
          />
        </div>

        {/* Notes */}
        <TextArea
          label="Poznámky (volitelné)"
          placeholder="Přidejte poznámku k práci..."
          value={sheet.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          disabled={isSubmitting}
        />

        {/* Error */}
        {submitError && (
          <ErrorBanner
            message={submitError}
            className="mt-4"
          />
        )}
      </BottomSheetContent>

      {/* Footer */}
      <BottomSheetFooter>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!sheet.canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Ukládám...' : 'Potvrdit a uložit'}
        </Button>
      </BottomSheetFooter>
    </BottomSheet>
  );
}

/**
 * Summary item helper - čistá prezentační komponenta
 */
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-ios-caption1 text-ios-gray">{label}</p>
      <p className="text-ios-title3 font-semibold text-gray-900">{value}</p>
    </div>
  );
}
