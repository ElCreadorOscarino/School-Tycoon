'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Student } from '@/lib/game-types';

interface TabProps {
  students: Student[];
  activeStudents: number;
  maxStudents: number;
  studentSatisfaction: number;
  onExpelStudent: (studentId: string) => void;
}

const StudentsTab = React.memo(function StudentsTab({
  students,
  activeStudents,
  maxStudents,
  studentSatisfaction,
  onExpelStudent,
}: TabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Estudiantes activos</div>
          <div className="text-lg font-bold text-white">{activeStudents}/{maxStudents}</div>
          <Progress value={Math.min(100, (activeStudents / Math.max(1, maxStudents)) * 100)}
            className="mt-1 h-1.5 [&>div]:bg-[#00ff88]" />
        </div>
        <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
          <div className="text-xs text-[#aaaaaa]">Satisfaccion promedio</div>
          <div className={`text-lg font-bold ${studentSatisfaction >= 70 ? 'text-[#00ff88]' : studentSatisfaction >= 40 ? 'text-[#ffcc00]' : 'text-[#ff4444]'}`}>
            {Math.round(studentSatisfaction)}%
          </div>
        </div>
      </div>
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#aaaaaa] mb-3 font-bold">Lista de estudiantes</h3>
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-center text-[#aaaaaa] text-sm py-4">No hay estudiantes inscritos</p>
          ) : (
            students.map((student) => (
              <div key={student.id} className="bg-[#111111] border border-[#222222] rounded px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white">{student.name}</span>
                  <span className="text-[#555555]">{student.age}anos</span>
                  <span className={`px-1 rounded text-[10px] ${
                    student.level === 'kinder' ? 'bg-[#ffcc00]/20 text-[#ffcc00]' :
                    student.level === 'primary' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                    'bg-[#4488ff]/20 text-[#4488ff]'
                  }`}>
                    {student.level === 'kinder' ? 'Kinder' : student.level === 'primary' ? 'Primaria' : 'Secundaria'}
                  </span>
                  <span className="text-[#aaaaaa]">{student.grade}</span>
                </div>
                <Button variant="ghost" size="sm"
                  onClick={() => onExpelStudent(student.id)}
                  className="text-[#ff4444] hover:text-[#ff6666] hover:bg-[#1a0a0a] text-[10px] h-6 px-1.5"
                >Expulsar</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

export default StudentsTab;
