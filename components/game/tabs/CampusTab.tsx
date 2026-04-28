'use client';
import React from 'react';
import type { Classroom, Teacher } from '@/lib/game-types';

interface TabProps {
  buildingSize: string;
  classrooms: Classroom[];
  cafeteriaBuilt: boolean;
  libraryEnabled: boolean;
  computerLabEnabled: boolean;
  sportsAreaEnabled: boolean;
  cameraCount: number;
  internetType: string;
  schoolName: string;
  activeStudents: number;
  teachers: Teacher[];
  reputation: number;
  money: number;
  currency: string;
  weather: { current: string };
}

const CampusTab = React.memo(function CampusTab({
  buildingSize,
  classrooms,
  cafeteriaBuilt,
  libraryEnabled,
  computerLabEnabled,
  sportsAreaEnabled,
  cameraCount,
  internetType,
  schoolName,
  activeStudents,
  teachers,
  reputation,
  money,
  currency,
  weather,
}: TabProps) {
  const hiredTeachers = teachers.filter(t => t.hired).length;
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#00ff88] mb-1">🏫 Vista del Campus</h3>
        <p className="text-[10px] text-[#555555]">Estado actual de las instalaciones de tu escuela.</p>
      </div>
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-4 font-mono text-xs text-[#00ff88] leading-relaxed whitespace-pre">
{`
       ╔══════════════════════════════════╗
       ║     🏫 ${schoolName}            ║
       ╠══════════════════════════════════╣
       ║  Edificio: ${buildingSize === 'small' ? '🏠 Pequeno' : buildingSize === 'medium' ? '🏫 Mediano' : buildingSize === 'large' ? '🏢 Grande' : '🏰 Mega'}${' '.repeat(Math.max(0, 22 - (buildingSize === 'small' ? '🏠 Pequeno' : buildingSize === 'medium' ? '🏫 Mediano' : buildingSize === 'large' ? '🏢 Grande' : '🏰 Mega').length))}  ║
       ║  Aulas: ${String(classrooms.length).padEnd(24)}║
       ║  Alumnos: ${String(activeStudents).padEnd(22)}║
       ║  Profesores: ${String(hiredTeachers).padEnd(19)}║
       ╠══════════════════════════════════╣
       ║  ${cafeteriaBuilt ? '🍽️' : '❌'} Cafetería${' '.repeat(22)}║
       ║  ${libraryEnabled ? '📚' : '❌'} Biblioteca${' '.repeat(22)}║
       ║  ${sportsAreaEnabled ? '⚽' : '❌'} Cancha${' '.repeat(24)}║
       ║  ${computerLabEnabled ? '💻' : '❌'} Lab. Computación${' '.repeat(16)}║
       ║  📹 Cámaras: ${cameraCount}${' '.repeat(22 - String(cameraCount).length)}║
       ╠══════════════════════════════════╣
       ║  ⭐ Reputación: ${String(Math.round(reputation) + '%').padEnd(20)}║
       ║  💰 Fondos: ${currency}${money.toLocaleString().padEnd(18)}║
       ║  🌤️ Clima: ${String((weather?.current || 'sunny').charAt(0).toUpperCase() + (weather?.current || 'sunny').slice(1)).padEnd(22)}║
       ╚══════════════════════════════════╝
`}
      </div>
    </div>
  );
});

export default CampusTab;
