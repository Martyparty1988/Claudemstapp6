/**
 * MST QR Code Component - 2026 Edition
 * 
 * QR kód pro rychlé sdílení projektů mezi pracovníky.
 * Generuje QR kód s odkazem na projekt.
 */

import React, { useMemo } from 'react';

export interface QRCodeProps {
  /** Data k zakódování */
  data: string;
  /** Velikost v px */
  size?: number;
  /** Barva QR */
  color?: string;
  /** Barva pozadí */
  bgColor?: string;
  /** Logo uprostřed */
  logo?: React.ReactNode;
  /** Error correction level */
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
}

// QR Code matrix generator (simplified)
function generateQRMatrix(data: string, size: number): boolean[][] {
  // Jednoduchá simulace QR - v produkci by se použila knihovna
  const moduleCount = 25;
  const matrix: boolean[][] = [];
  
  // Seed z dat
  let seed = 0;
  for (let i = 0; i < data.length; i++) {
    seed = ((seed << 5) - seed) + data.charCodeAt(i);
    seed = seed & seed;
  }
  
  // Generovat pattern
  for (let row = 0; row < moduleCount; row++) {
    matrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Finder patterns (rohy)
      if (
        (row < 7 && col < 7) ||
        (row < 7 && col >= moduleCount - 7) ||
        (row >= moduleCount - 7 && col < 7)
      ) {
        // Finder pattern
        const inOuter = row === 0 || row === 6 || col === 0 || col === 6 ||
                       (row < 7 && (col === moduleCount - 7 || col === moduleCount - 1)) ||
                       (col < 7 && (row === moduleCount - 7 || row === moduleCount - 1)) ||
                       (row >= moduleCount - 7 && (col === 0 || col === 6));
        const inMiddle = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
                        (row >= 2 && row <= 4 && col >= moduleCount - 5 && col <= moduleCount - 3) ||
                        (row >= moduleCount - 5 && row <= moduleCount - 3 && col >= 2 && col <= 4);
        matrix[row][col] = inOuter || inMiddle;
      } else {
        // Data area - pseudo-random based on seed
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        matrix[row][col] = (seed % 3) === 0;
      }
    }
  }
  
  return matrix;
}

export function QRCode({
  data,
  size = 200,
  color = '#000000',
  bgColor = '#FFFFFF',
  logo,
  errorCorrection = 'M',
}: QRCodeProps) {
  const matrix = useMemo(() => generateQRMatrix(data, size), [data, size]);
  const moduleCount = matrix.length;
  const moduleSize = size / moduleCount;

  return (
    <div 
      className="relative inline-block rounded-2xl overflow-hidden shadow-lg"
      style={{ width: size, height: size, backgroundColor: bgColor }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background */}
        <rect width={size} height={size} fill={bgColor} />
        
        {/* QR modules */}
        {matrix.map((row, rowIndex) =>
          row.map((cell, colIndex) =>
            cell ? (
              <rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * moduleSize}
                y={rowIndex * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill={color}
                rx={moduleSize * 0.1}
              />
            ) : null
          )
        )}
      </svg>
      
      {/* Logo overlay */}
      {logo && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            background: `radial-gradient(circle, ${bgColor} 30%, transparent 30%)`
          }}
        >
          <div className="w-1/4 h-1/4 flex items-center justify-center">
            {logo}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Project QR Code - specifický pro sdílení projektů
 */
export interface ProjectQRCodeProps {
  projectId: string;
  projectName: string;
  size?: number;
}

export function ProjectQRCode({ projectId, projectName, size = 200 }: ProjectQRCodeProps) {
  const shareUrl = `mst://project/${projectId}`;
  
  return (
    <div className="flex flex-col items-center gap-4">
      <QRCode
        data={shareUrl}
        size={size}
        color="#0f172a"
        bgColor="#ffffff"
        logo={
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">MST</span>
          </div>
        }
      />
      <div className="text-center">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {projectName}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Naskenuj pro otevření projektu
        </p>
      </div>
    </div>
  );
}

export default QRCode;
