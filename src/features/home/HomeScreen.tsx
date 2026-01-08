/**
 * MST Home Screen - 2026 Glassmorphism Edition
 * 
 * Modern dashboard with glass effects and vibrant gradients.
 */

import React from 'react';
import {
  Screen,
  ScreenHeader,
  Card,
  Section,
} from '../../shared';

/**
 * Props
 */
export interface HomeScreenProps {
  /** Callback pro navigaci na projekty */
  onNavigateToProjects?: () => void;
  /** Callback pro navigaci na práci */
  onNavigateToWork?: () => void;
}

/**
 * HomeScreen Component
 */
export function HomeScreen({
  onNavigateToProjects,
  onNavigateToWork,
}: HomeScreenProps) {
  const greeting = getGreeting();

  return (
    <Screen
      header={
        <ScreenHeader
          title="MST"
          largeTitle
          rightAction={
            <button className="w-10 h-10 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur flex items-center justify-center tap-bounce hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
              <BellIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          }
        />
      }
    >
      {/* Hero Card with gradient */}
      <div className="relative mb-6 overflow-hidden rounded-3xl page-enter">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600" />
        
        {/* Animated decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-x-16 -translate-y-16 animate-float" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-400/20 rounded-full blur-2xl -translate-x-8 translate-y-8 animate-float-delayed" />
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-30" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">{greeting}</p>
              <h2 className="text-2xl font-bold text-gradient-gold drop-shadow-sm" style={{WebkitTextFillColor: 'white'}}>
                Marty Solar Tracker
              </h2>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-glow">
              <SunIcon className="w-8 h-8 animate-pulse" />
            </div>
          </div>
          
          <p className="text-white/80 text-sm mb-4">
            Sledování práce na solárních elektrárnách
          </p>
          
          {/* Quick stats in hero */}
          <div className="flex gap-4 stagger-enter">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors cursor-default">
              <p className="text-white/70 text-xs font-medium">Dnes</p>
              <p className="text-2xl font-bold count-up">0</p>
              <p className="text-white/60 text-xs">stolů</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors cursor-default">
              <p className="text-white/70 text-xs font-medium">Týden</p>
              <p className="text-2xl font-bold count-up">0</p>
              <p className="text-white/60 text-xs">stolů</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors cursor-default">
              <p className="text-white/70 text-xs font-medium">Celkem</p>
              <p className="text-2xl font-bold count-up">0</p>
              <p className="text-white/60 text-xs">projektů</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <Section title="Rychlé akce">
        <div className="space-y-3">
          {/* Continue work - primary action */}
          <button
            onClick={onNavigateToWork}
            className="w-full group"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-success-500 to-success-600 p-[1px]">
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 flex items-center gap-4 group-active:bg-slate-50 dark:group-active:bg-slate-800 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center text-white shadow-lg shadow-success-500/30">
                  <PlayIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Pokračovat v práci</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Otevřít FieldMap</p>
                </div>
                <ChevronIcon className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          {/* Projects */}
          <Card
            variant="glass"
            padding="md"
            hover
            onClick={onNavigateToProjects}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Projekty</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Zobrazit všechny projekty</p>
            </div>
            <ChevronIcon className="w-5 h-5 text-slate-400" />
          </Card>
        </div>
      </Section>

      {/* Recent Activity */}
      <Section title="Nedávná aktivita" className="mt-6">
        <Card variant="glass" padding="lg">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <ClockIcon className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-900 dark:text-white">Zatím žádná aktivita</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Začněte pracovat na projektu
            </p>
          </div>
        </Card>
      </Section>
    </Screen>
  );
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Dobré ráno';
  if (hour < 18) return 'Dobré odpoledne';
  return 'Dobrý večer';
}

/**
 * Icons
 */
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export default HomeScreen;
