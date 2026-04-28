'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import type { Teacher } from '@/lib/game-types';

interface TabProps {
  teachers: Teacher[];
  currency: string;
  onFireTeacher: (teacherId: string) => void;
}

const TeachersTab = React.memo(function TeachersTab({
  teachers,
  currency,
  onFireTeacher,
}: TabProps) {
  const hiredTeachers = teachers.filter(t => t.hired);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#aaaaaa]">Profesores contratados</span>
        <span className="text-sm font-bold text-[#00ff88]">{hiredTeachers.length}</span>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {hiredTeachers.length === 0 ? (
          <p className="text-center text-[#aaaaaa] text-sm py-8">No hay profesores contratados</p>
        ) : (
          hiredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{teacher.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#111111] border border-[#333333] text-[#aaaaaa]">{teacher.subject}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-[#aaaaaa]">
                    <span>📊 Calidad: <span className={teacher.quality >= 7 ? 'text-[#00ff88]' : teacher.quality >= 4 ? 'text-[#ffcc00]' : 'text-[#ff4444]'}>{teacher.quality}/10</span></span>
                    <span>💼 Salario: <span className="text-[#ffcc00]">{currency}{teacher.salary.toLocaleString()}/mes</span></span>
                    <span>📅 Exp: {teacher.experience} anos</span>
                  </div>
                  {teacher.redFlags.length > 0 && (
                    <div className="mt-1 text-xs text-[#ff4444]">🚩 {teacher.redFlags.join(', ')}</div>
                  )}
                </div>
                <Button variant="ghost" size="sm"
                  onClick={() => onFireTeacher(teacher.id)}
                  className="text-[#ff4444] hover:text-[#ff6666] hover:bg-[#1a0a0a] text-xs h-8 px-2"
                >🔥 Despedir</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default TeachersTab;
