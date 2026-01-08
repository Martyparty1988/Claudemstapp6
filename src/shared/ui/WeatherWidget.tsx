/**
 * MST Weather Widget - 2026 Edition
 * 
 * Widget pro zobrazení počasí na lokaci projektu.
 * Důležité pro plánování práce na solárních panelech.
 */

import React, { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
  uvIndex: number;
  sunrise: string;
  sunset: string;
  forecast?: {
    day: string;
    high: number;
    low: number;
    condition: WeatherData['condition'];
  }[];
}

export interface WeatherWidgetProps {
  /** Počasí data */
  weather?: WeatherData;
  /** Loading state */
  isLoading?: boolean;
  /** Lokace pro zobrazení */
  location?: string;
  /** Kompaktní verze */
  compact?: boolean;
  /** Callback pro refresh */
  onRefresh?: () => void;
}

const conditionIcons: Record<WeatherData['condition'], React.ReactNode> = {
  sunny: <SunnyIcon />,
  cloudy: <CloudyIcon />,
  'partly-cloudy': <PartlyCloudyIcon />,
  rainy: <RainyIcon />,
  stormy: <StormyIcon />,
  snowy: <SnowyIcon />,
  foggy: <FoggyIcon />,
};

const conditionLabels: Record<WeatherData['condition'], string> = {
  sunny: 'Jasno',
  cloudy: 'Zataženo',
  'partly-cloudy': 'Polojasno',
  rainy: 'Déšť',
  stormy: 'Bouřka',
  snowy: 'Sníh',
  foggy: 'Mlha',
};

const conditionGradients: Record<WeatherData['condition'], string> = {
  sunny: 'from-amber-400 via-orange-400 to-yellow-300',
  cloudy: 'from-slate-400 via-slate-500 to-slate-600',
  'partly-cloudy': 'from-blue-400 via-slate-300 to-amber-300',
  rainy: 'from-slate-500 via-blue-500 to-slate-600',
  stormy: 'from-slate-700 via-purple-600 to-slate-800',
  snowy: 'from-blue-100 via-white to-blue-200',
  foggy: 'from-slate-300 via-slate-400 to-slate-300',
};

export function WeatherWidget({
  weather,
  isLoading = false,
  location,
  compact = false,
  onRefresh,
}: WeatherWidgetProps) {
  // Mock data pro demo
  const mockWeather: WeatherData = weather || {
    temperature: 24,
    feelsLike: 26,
    humidity: 45,
    windSpeed: 12,
    windDirection: 'SV',
    condition: 'sunny',
    uvIndex: 7,
    sunrise: '05:42',
    sunset: '20:15',
    forecast: [
      { day: 'Zítra', high: 26, low: 14, condition: 'sunny' },
      { day: 'Po', high: 23, low: 12, condition: 'partly-cloudy' },
      { day: 'Út', high: 20, low: 11, condition: 'rainy' },
    ],
  };

  const data = weather || mockWeather;
  const gradient = conditionGradients[data.condition];

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-slate-200 dark:bg-slate-700 animate-pulse h-48" />
    );
  }

  if (compact) {
    return (
      <div className={`
        relative overflow-hidden rounded-2xl p-4
        bg-gradient-to-br ${gradient}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              {conditionIcons[data.condition]}
            </div>
            <div>
              <p className="text-3xl font-bold text-white drop-shadow">
                {data.temperature}°
              </p>
              <p className="text-sm text-white/80">
                {conditionLabels[data.condition]}
              </p>
            </div>
          </div>
          
          {/* Solar index - důležité pro solární panely */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-white/90">
              <SunIcon className="w-4 h-4" />
              <span className="text-sm font-medium">UV {data.uvIndex}</span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              {getSolarRating(data.uvIndex)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative overflow-hidden rounded-3xl
      bg-gradient-to-br ${gradient}
    `}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl translate-y-4 -translate-x-4" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {location && (
              <p className="text-sm text-white/70 mb-1 flex items-center gap-1">
                <LocationIcon className="w-4 h-4" />
                {location}
              </p>
            )}
            <div className="flex items-end gap-2">
              <span className="text-6xl font-bold text-white drop-shadow-lg">
                {data.temperature}°
              </span>
              <span className="text-xl text-white/80 mb-2">C</span>
            </div>
            <p className="text-white/80">
              {conditionLabels[data.condition]} · Pocitově {data.feelsLike}°
            </p>
          </div>
          
          <div className="w-20 h-20 flex items-center justify-center">
            {conditionIcons[data.condition]}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <WeatherStat icon={<WindIcon />} label="Vítr" value={`${data.windSpeed} km/h`} />
          <WeatherStat icon={<DropIcon />} label="Vlhkost" value={`${data.humidity}%`} />
          <WeatherStat icon={<SunIcon />} label="UV Index" value={data.uvIndex.toString()} />
          <WeatherStat icon={<CompassIcon />} label="Směr" value={data.windDirection} />
        </div>

        {/* Sun times */}
        <div className="flex items-center justify-between py-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <SunriseIcon className="w-5 h-5 text-white/70" />
            <span className="text-sm text-white/90">{data.sunrise}</span>
          </div>
          <div className="flex-1 mx-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full"
              style={{ width: `${getSunPosition(data.sunrise, data.sunset)}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/90">{data.sunset}</span>
            <SunsetIcon className="w-5 h-5 text-white/70" />
          </div>
        </div>

        {/* Solar production indicator */}
        <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-white">Solární produkce</span>
            </div>
            <span className="text-lg font-bold text-white">
              {getSolarProductionEstimate(data)}%
            </span>
          </div>
          <p className="text-xs text-white/70 mt-1">
            {getSolarProductionDescription(data)}
          </p>
        </div>

        {/* Forecast */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="mt-4 flex gap-2">
            {data.forecast.map((day, i) => (
              <div 
                key={i}
                className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center"
              >
                <p className="text-xs text-white/70">{day.day}</p>
                <div className="w-8 h-8 mx-auto my-1">
                  {conditionIcons[day.condition]}
                </div>
                <p className="text-sm font-medium text-white">{day.high}°</p>
                <p className="text-xs text-white/60">{day.low}°</p>
              </div>
            ))}
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <RefreshIcon className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

// Weather stat component
function WeatherStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="w-8 h-8 mx-auto mb-1 text-white/70">
        {icon}
      </div>
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

// Helper functions
function getSolarRating(uvIndex: number): string {
  if (uvIndex >= 8) return 'Výborné';
  if (uvIndex >= 6) return 'Velmi dobré';
  if (uvIndex >= 4) return 'Dobré';
  if (uvIndex >= 2) return 'Slabé';
  return 'Minimální';
}

function getSunPosition(sunrise: string, sunset: string): number {
  const now = new Date();
  const [sunriseH, sunriseM] = sunrise.split(':').map(Number);
  const [sunsetH, sunsetM] = sunset.split(':').map(Number);
  
  const sunriseMinutes = sunriseH * 60 + sunriseM;
  const sunsetMinutes = sunsetH * 60 + sunsetM;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  if (nowMinutes <= sunriseMinutes) return 0;
  if (nowMinutes >= sunsetMinutes) return 100;
  
  return ((nowMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes)) * 100;
}

function getSolarProductionEstimate(weather: WeatherData): number {
  let base = 100;
  
  // Snížení podle podmínek
  switch (weather.condition) {
    case 'sunny': base = 100; break;
    case 'partly-cloudy': base = 75; break;
    case 'cloudy': base = 40; break;
    case 'rainy': base = 20; break;
    case 'stormy': base = 10; break;
    case 'snowy': base = 15; break;
    case 'foggy': base = 30; break;
  }
  
  // Bonus za vysoký UV
  if (weather.uvIndex >= 7) base = Math.min(100, base + 10);
  
  return base;
}

function getSolarProductionDescription(weather: WeatherData): string {
  const production = getSolarProductionEstimate(weather);
  if (production >= 90) return 'Ideální podmínky pro práci na panelech';
  if (production >= 70) return 'Velmi dobré podmínky';
  if (production >= 50) return 'Průměrné podmínky';
  if (production >= 30) return 'Snížená produkce';
  return 'Nepříznivé podmínky';
}

// Icons
function SunnyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="32" cy="32" r="12" fill="#FFD93D" />
      <g stroke="#FFD93D" strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="8" x2="32" y2="16" />
        <line x1="32" y1="48" x2="32" y2="56" />
        <line x1="8" y1="32" x2="16" y2="32" />
        <line x1="48" y1="32" x2="56" y2="32" />
        <line x1="15" y1="15" x2="20" y2="20" />
        <line x1="44" y1="44" x2="49" y2="49" />
        <line x1="15" y1="49" x2="20" y2="44" />
        <line x1="44" y1="20" x2="49" y2="15" />
      </g>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M48 36c6 0 10-4 10-10s-4-10-10-10c-1 0-2 0-3 .5C43 12 38 8 32 8c-8 0-14 6-14 14 0 1 0 2 .5 3C12 26 8 31 8 38c0 8 6 14 14 14h26c6 0 10-4 10-10 0-3-1-5-3-7" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

function PartlyCloudyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <circle cx="24" cy="24" r="10" fill="#FFD93D" />
      <g stroke="#FFD93D" strokeWidth="2" strokeLinecap="round">
        <line x1="24" y1="6" x2="24" y2="10" />
        <line x1="24" y1="38" x2="24" y2="42" />
        <line x1="6" y1="24" x2="10" y2="24" />
        <line x1="10" y1="10" x2="13" y2="13" />
      </g>
      <path d="M52 40c4 0 8-3 8-8s-4-8-8-8c-1 0-2 0-2 .5C48 20 44 16 38 16c-6 0-11 5-11 11 0 1 0 1 .5 2C22 30 18 34 18 40c0 6 5 11 11 11h23c4 0 8-3 8-8" fill="white" fillOpacity="0.95" />
    </svg>
  );
}

function RainyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M48 28c6 0 10-4 10-10s-4-10-10-10c-1 0-2 0-3 .5C43 4 38 0 32 0c-8 0-14 6-14 14 0 1 0 2 .5 3C12 18 8 23 8 30c0 8 6 14 14 14h26c6 0 10-4 10-10" fill="white" fillOpacity="0.9" />
      <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
        <line x1="20" y1="48" x2="16" y2="58" />
        <line x1="32" y1="48" x2="28" y2="58" />
        <line x1="44" y1="48" x2="40" y2="58" />
      </g>
    </svg>
  );
}

function StormyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M48 24c6 0 10-4 10-10s-4-10-10-10c-1 0-2 0-3 .5C43 0 38-4 32-4c-8 0-14 6-14 14 0 1 0 2 .5 3C12 14 8 19 8 26c0 8 6 14 14 14h26c6 0 10-4 10-10" fill="#64748B" />
      <polygon points="36,32 28,48 34,48 30,60 42,44 36,44 40,32" fill="#FBBF24" />
    </svg>
  );
}

function SnowyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <path d="M48 28c6 0 10-4 10-10s-4-10-10-10c-1 0-2 0-3 .5C43 4 38 0 32 0c-8 0-14 6-14 14 0 1 0 2 .5 3C12 18 8 23 8 30c0 8 6 14 14 14h26c6 0 10-4 10-10" fill="white" fillOpacity="0.9" />
      <g fill="#93C5FD">
        <circle cx="20" cy="52" r="3" />
        <circle cx="32" cy="56" r="3" />
        <circle cx="44" cy="52" r="3" />
      </g>
    </svg>
  );
}

function FoggyIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <g stroke="white" strokeOpacity="0.8" strokeWidth="4" strokeLinecap="round">
        <line x1="8" y1="20" x2="56" y2="20" />
        <line x1="12" y1="32" x2="52" y2="32" />
        <line x1="8" y1="44" x2="56" y2="44" />
      </g>
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function WindIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" /></svg>; }
function DropIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-3.5 0-6-2.5-6-6 0-4 6-11 6-11s6 7 6 11c0 3.5-2.5 6-6 6z" /></svg>; }
function CompassIcon() { return <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="currentColor" /></svg>; }
function LocationIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function SunriseIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M16 12a4 4 0 11-8 0" /></svg>; }
function SunsetIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" d="M4 19h16" /></svg>; }
function BoltIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; }
function RefreshIcon({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>; }

export default WeatherWidget;
