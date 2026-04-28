'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

interface TabProps {
  directorSkills: any[];
  money: number;
  currency: string;
  upgradeSkill: (id: string) => void;
  sounds: { coinSpend: () => void };
}

const SkillsTab = React.memo(function SkillsTab({
  directorSkills,
  money,
  currency,
  upgradeSkill,
  sounds,
}: TabProps) {
  const skills = directorSkills || [];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#ffcc00] mb-1">Habilidades del Director</h3>
        <p className="text-[10px] text-[#aaaaaa]">Mejora las habilidades de tu director para obtener bonificaciones.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((sk: any) => (
          <div key={sk.id} className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{sk.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white">{sk.name}</div>
                <div className="text-[10px] text-[#aaaaaa]">{sk.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: sk.maxLevel || 5 }).map((_, i) => (
                <div key={i} className={`w-4 h-1.5 rounded-full ${i < (sk.currentLevel || 0) ? 'bg-[#00ff88]' : 'bg-[#222222]'}`} />
              ))}
              <span className="text-[10px] text-[#aaaaaa] ml-1">Lv.{sk.currentLevel || 0}/{sk.maxLevel || 5}</span>
            </div>
            {(sk.currentLevel || 0) < (sk.maxLevel || 5) && (
              <Button
                size="sm"
                className="w-full text-[10px] h-7 bg-[#111111] border border-[#333] text-[#aaaaaa] hover:text-white hover:border-[#00ff88]"
                onClick={() => { upgradeSkill(sk.id); sounds.coinSpend(); }}
                disabled={money < (sk.costPerLevel || 5000)}
              >
                Mejorar - {currency}{(sk.costPerLevel || 5000).toLocaleString()}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SkillsTab;
