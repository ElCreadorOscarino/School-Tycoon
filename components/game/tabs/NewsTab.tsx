'use client';
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TabProps {
  newsHistory: any[];
}

const NewsTab = React.memo(function NewsTab({ newsHistory }: TabProps) {
  const articles = newsHistory || [];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#aaaaaa] mb-1">Periodico Escolar</h3>
        <p className="text-[10px] text-[#555555]">Noticias generadas cada 4 semanas basadas en tu escuela.</p>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {articles.length === 0 ? (
          <p className="text-center text-[#aaaaaa] text-xs py-8">Sin noticias aun. Las noticias se generan cada 4 semanas.</p>
        ) : (
          articles.slice().reverse().slice(0, 20).map((a: any) => (
            <div key={a.id} className={`bg-[#0d0d0d] border rounded-lg p-3 ${a.impact === 'positive' ? 'border-[#00ff88]/20' : a.impact === 'negative' ? 'border-[#ff4444]/20' : 'border-[#222222]'}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{a.headline}</div>
                  <div className="text-[10px] text-[#aaaaaa] mt-1 line-clamp-2">{a.content}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] text-[#555555]">S{a.week}</span>
                    <Badge variant="outline" className="text-[9px] h-4 border-[#333] text-[#555555]">{a.category}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default NewsTab;
