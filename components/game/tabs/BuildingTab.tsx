'use client';
import React from 'react';
import type { Classroom, Quality } from '@/lib/game-types';

interface TabProps {
  classrooms: Classroom[];
  cafeteriaBuilt: boolean;
  cafeteriaSize: Quality;
  libraryEnabled: boolean;
  computerLabEnabled: boolean;
  meetingRoomEnabled: boolean;
  sportsAreaEnabled: boolean;
  buildingSize: string;
  cameraCount: number;
  internetType: string;
  bathroomCount: number;
  bathroomQuality: string;
  activeStudents: number;
  maxStudents: number;
}

const BuildingTab = React.memo(function BuildingTab({
  classrooms,
  cafeteriaBuilt,
  cafeteriaSize,
  libraryEnabled,
  computerLabEnabled,
  meetingRoomEnabled,
  sportsAreaEnabled,
  buildingSize,
  cameraCount,
  internetType,
  bathroomCount,
  bathroomQuality,
  activeStudents,
  maxStudents,
}: TabProps) {
  const sizeLabel = buildingSize === 'small' ? 'Pequeno' : buildingSize === 'medium' ? 'Mediano' : buildingSize === 'large' ? 'Grande' : 'Mega';
  const floors = [...new Set(classrooms.map(c => c.floor))].sort();

  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Informacion del edificio</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-[#aaaaaa]">Tamano:</span> <span className="text-white font-bold">{sizeLabel}</span></div>
          <div><span className="text-[#aaaaaa]">Aulas:</span> <span className="text-[#ffcc00] font-bold">{classrooms.length}</span></div>
          <div><span className="text-[#aaaaaa]">Capacidad max:</span> <span className="text-[#00ff88] font-bold">{maxStudents}</span></div>
          <div><span className="text-[#aaaaaa]">Ocupacion:</span> <span className={`font-bold ${activeStudents / maxStudents > 0.9 ? 'text-[#ff4444]' : 'text-[#00ff88]'}`}>{Math.round((activeStudents / Math.max(1, maxStudents)) * 100)}%</span></div>
        </div>
      </div>

      {/* Minimap - CSS Grid Floor Plan */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">🗺️ Plano del edificio</h3>
        {floors.length > 0 ? (
          <div className="space-y-3">
            {floors.map(floor => {
              const floorRooms = classrooms.filter(c => c.floor === floor);
              const cols = Math.max(3, Math.ceil(Math.sqrt(floorRooms.length)));
              const levelColor = (level: string) => level === 'kinder' ? '#ffcc00' : level === 'primary' ? '#00ff88' : '#4488ff';
              return (
                <div key={floor}>
                  <div className="text-[10px] text-[#555555] mb-1">PISO {floor}</div>
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {floorRooms.map(c => (
                      <div
                        key={c.id}
                        className="rounded border px-1.5 py-1 text-[8px] text-center transition-all hover:scale-105 cursor-default"
                        style={{
                          borderColor: levelColor(c.level) + '60',
                          backgroundColor: levelColor(c.level) + '15',
                          color: levelColor(c.level),
                        }}
                        title={`${c.name} | ${c.students}/${c.capacity}`}
                      >
                        <div className="font-bold truncate">{c.name}</div>
                        <div className="text-[#aaaaaa]">{c.students}/{c.capacity}</div>
                      </div>
                    ))}
                    {/* Service rooms */}
                    {floor === 1 && (
                      <>
                        {cafeteriaBuilt && <div className="rounded border border-[#ff8844]/40 bg-[#ff8844]/10 px-1.5 py-1 text-[8px] text-center text-[#ff8844]">🍽️ Cafeteria</div>}
                        {libraryEnabled && <div className="rounded border border-[#aa88ff]/40 bg-[#aa88ff]/10 px-1.5 py-1 text-[8px] text-center text-[#aa88ff]">📚 Biblioteca</div>}
                      </>
                    )}
                    {computerLabEnabled && floor === floors[0] && <div className="rounded border border-[#00ccff]/40 bg-[#00ccff]/10 px-1.5 py-1 text-[8px] text-center text-[#00ccff]">💻 Lab</div>}
                    {meetingRoomEnabled && floor === floors[0] && <div className="rounded border border-[#88aaff]/40 bg-[#88aaff]/10 px-1.5 py-1 text-[8px] text-center text-[#88aaff]">🤝 Reunion</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-[#aaaaaa] text-sm py-6">No hay aulas configuradas</div>
        )}
      </div>

      {/* Services Map */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Servicios</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: '🍽️ Cafeteria', active: cafeteriaBuilt, required: true },
            { name: '📚 Biblioteca', active: libraryEnabled, required: true },
            { name: '⚽ Area deportiva', active: sportsAreaEnabled },
            { name: '💻 Lab. computacion', active: computerLabEnabled },
            { name: '🤝 Sala de reuniones', active: meetingRoomEnabled },
          ].map(s => (
            <span key={s.name} className={`px-2 py-1 rounded text-xs ${
              s.active ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' :
              s.required ? 'bg-[#1a0a0a] text-[#ff4444] border border-[#ff4444]/30' :
              'bg-[#111111] text-[#aaaaaa] border border-[#333333]'
            }`}>{s.name}</span>
          ))}
          <span className="px-2 py-1 rounded text-xs bg-[#0a0a1a] text-[#4488ff] border border-[#4488ff]/30">📹 {cameraCount} camaras</span>
          <span className={`px-2 py-1 rounded text-xs ${internetType !== 'none' ? 'bg-[#0a1a10] text-[#00ff88] border border-[#00ff88]/30' : 'bg-[#1a0a0a] text-[#ff4444] border border-[#ff4444]/30'}`}>
            🌐 {internetType === 'fiber' ? 'Fibra' : internetType === 'open' ? 'Abierto' : internetType === 'password' ? 'Con clave' : 'Sin internet'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default BuildingTab;
