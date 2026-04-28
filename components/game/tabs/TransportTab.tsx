'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

interface TabProps {
  transportRoutes: any[];
  money: number;
  currency: string;
  addTransportRoute: (route: any) => void;
  toggleTransportRoute: (id: string) => void;
  sounds: { click: () => void; buildComplete: () => void };
}

const TransportTab = React.memo(function TransportTab({
  transportRoutes,
  money,
  currency,
  addTransportRoute,
  toggleTransportRoute,
  sounds,
}: TabProps) {
  const routes = transportRoutes || [];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#aaaaaa] mb-1">Transporte Escolar</h3>
        <p className="text-[10px] text-[#555555]">Rutas de autobus para atraer estudiantes de zonas lejanas.</p>
      </div>
      {routes.length === 0 ? (
        <p className="text-center text-[#aaaaaa] text-xs py-8">Sin rutas de transporte. Agrega rutas para atraer mas estudiantes.</p>
      ) : (
        <div className="space-y-2">
          {routes.map((r: any) => (
            <div key={r.id} className={`bg-[#0d0d0d] border rounded-lg p-3 ${r.active ? 'border-[#00ff88]/30' : 'border-[#222222]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{r.zone}</div>
                  <div className="text-[10px] text-[#aaaaaa]">{r.studentsServed}/{r.capacity} alumnos | Costo: {currency}{r.cost.toLocaleString()}/mes</div>
                </div>
                <Button size="sm" variant="outline" className={`text-[10px] h-7 ${r.active ? 'border-[#00ff88] text-[#00ff88]' : 'border-[#333] text-[#555555]'}`}
                  onClick={() => { toggleTransportRoute(r.id); sounds.click(); }}>
                  {r.active ? 'Activa' : 'Inactiva'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Button className="w-full text-xs h-8 bg-[#111111] border border-[#333] text-[#aaaaaa] hover:text-white hover:border-[#00ff88]"
        onClick={() => {
          const zones = ['Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste', 'Centro', 'Periferia'];
          const zone = zones[routes.length % zones.length];
          addTransportRoute({ id: `route-${Date.now()}`, zone, cost: 3000 + routes.length * 1000, capacity: 30, studentsServed: 0, active: true });
          sounds.buildComplete();
        }}>
        + Agregar Ruta ({currency}{(3000 + routes.length * 1000).toLocaleString()})
      </Button>
    </div>
  );
});

export default TransportTab;
