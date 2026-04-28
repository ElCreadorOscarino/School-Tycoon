'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TabProps {
  aiMessages: { role: 'user' | 'ai'; text: string }[];
  aiInput: string;
  aiLoading: boolean;
  setAiInput: (v: string) => void;
  handleAiSend: () => void;
}

const AiAdvisorTab = React.memo(function AiAdvisorTab({
  aiMessages,
  aiInput,
  aiLoading,
  setAiInput,
  handleAiSend,
}: TabProps) {
  const suggestedQuestions = [
    '¿Como mejorar mi reputacion?',
    '¿Estoy gastando demasiado?',
    '¿Deberia pedir un prestamo?',
    '¿Como atraer mas estudiantes?',
    '¿Que expandir primero?',
    '¿Como mejorar el rendimiento?',
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm text-[#4488ff] font-bold mb-2">🤖 Asesor IA - Z.ai</h3>
        <p className="text-[10px] text-[#aaaaaa]">Pregunta sobre la gestion de tu escuela. Recibiras consejos basados en tu situacion actual.</p>
      </div>

      {/* Chat messages */}
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4 flex-1 min-h-[200px] max-h-[400px] overflow-y-auto">
        {aiMessages.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">🤖</div>
            <p className="text-[#aaaaaa] text-xs mb-4">Pregunta algo sobre tu escuela</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => { setAiInput(q); }}
                  className="text-[10px] bg-[#111111] border border-[#333333] rounded-full px-3 py-1.5 text-[#aaaaaa] hover:text-white hover:border-[#4488ff] transition-all"
                >{q}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === 'user'
                    ? 'bg-[#1a2a4a] text-white border border-[#4488ff]/30'
                    : 'bg-[#111111] text-[#cccccc] border border-[#222222]'
                }`}>
                  {msg.role === 'ai' && <div className="text-[#4488ff] font-bold text-[10px] mb-1">🤖 Asesor IA</div>}
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 text-xs text-[#aaaaaa] animate-pulse">
                  🤖 Pensando...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
          placeholder="Escribe tu pregunta..."
          className="bg-[#111111] border-[#333333] text-white text-xs h-10"
          disabled={aiLoading}
        />
        <Button
          onClick={handleAiSend}
          disabled={aiLoading || !aiInput.trim()}
          size="sm"
          className="bg-[#4488ff] hover:bg-[#5599ff] text-white h-10 px-4"
        >Enviar</Button>
      </div>
    </div>
  );
});

export default AiAdvisorTab;
