/**
 * MST Voice Notes Component - 2026 Edition
 * 
 * Hlasové poznámky pro rychlé záznamy v terénu.
 * Pracovník může nahrát hlasovou poznámku místo psaní.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceNoteProps {
  /** Callback s nahraným audio blob */
  onRecorded: (blob: Blob, duration: number) => void;
  /** Max délka nahrávky v sekundách */
  maxDuration?: number;
  /** Disabled */
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'processing';

export function VoiceNote({
  onRecorded,
  maxDuration = 120,
  disabled = false,
}: VoiceNoteProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Audio level visualization
  const updateAudioLevel = useCallback(() => {
    if (!analyser.current) return;
    
    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    analyser.current.getByteFrequencyData(dataArray);
    
    // Průměrná hlasitost
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    if (state === 'recording') {
      animationFrame.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Audio analyser pro vizualizaci
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.current = audioContext.createAnalyser();
      analyser.current.fftSize = 256;
      source.connect(analyser.current);
      
      // Media recorder
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        onRecorded(blob, duration);
        setState('idle');
        setDuration(0);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setState('recording');
      
      // Timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(d => {
          if (d >= maxDuration) {
            stopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
      
      // Start visualization
      updateAudioLevel();
      
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Přístup k mikrofonu byl zamítnut');
    }
  }, [maxDuration, onRecorded, duration, updateAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && state === 'recording') {
      mediaRecorder.current.stop();
      setState('processing');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    }
  }, [state]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorder.current) {
      mediaRecorder.current.ondataavailable = null;
      mediaRecorder.current.onstop = null;
      mediaRecorder.current.stop();
    }
    
    setState('idle');
    setDuration(0);
    setAudioLevel(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Waveform visualization */}
      <div className="relative w-full h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
        {state === 'recording' && (
          <>
            {/* Audio bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 px-4">
              {Array.from({ length: 20 }).map((_, i) => {
                const height = Math.random() * audioLevel * 100;
                return (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-brand-500 to-accent-500 rounded-full transition-all duration-75"
                    style={{ 
                      height: `${Math.max(8, height)}%`,
                    }}
                  />
                );
              })}
            </div>
            
            {/* Recording indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-error-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {formatTime(duration)}
              </span>
            </div>
            
            {/* Max duration indicator */}
            <div className="absolute top-2 right-2">
              <span className="text-xs text-slate-400">
                max {formatTime(maxDuration)}
              </span>
            </div>
          </>
        )}
        
        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-slate-400">
              Klepni pro nahrání hlasové poznámky
            </span>
          </div>
        )}
        
        {state === 'processing' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className={`
              w-16 h-16 rounded-full
              bg-gradient-to-br from-brand-500 to-accent-500
              flex items-center justify-center
              shadow-lg shadow-brand-500/30
              active:scale-95 transition-transform
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <MicIcon className="w-7 h-7 text-white" />
          </button>
        )}
        
        {state === 'recording' && (
          <>
            <button
              onClick={cancelRecording}
              className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center active:scale-95 transition-transform"
            >
              <XIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-error-500 to-error-600 flex items-center justify-center shadow-lg shadow-error-500/30 active:scale-95 transition-transform"
            >
              <StopIcon className="w-7 h-7 text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Voice Note Player - přehrávání nahraných poznámek
 */
export interface VoiceNotePlayerProps {
  /** Audio URL nebo blob */
  src: string | Blob;
  /** Délka v sekundách */
  duration: number;
  /** Callback při smazání */
  onDelete?: () => void;
}

export function VoiceNotePlayer({ src, duration, onDelete }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');

  useEffect(() => {
    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(src);
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0"
      >
        {isPlaying ? (
          <PauseIcon className="w-5 h-5 text-white" />
        ) : (
          <PlayIcon className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>
      
      {/* Progress bar */}
      <div className="flex-1">
        <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">{formatTime(currentTime)}</span>
          <span className="text-xs text-slate-500">{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center"
        >
          <TrashIcon className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  );
}

// Icons
function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default VoiceNote;
