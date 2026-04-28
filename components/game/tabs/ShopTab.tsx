'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TabProps {
  shopItems: any[];
  money: number;
  currency: string;
  purchaseShopItem: (id: string) => void;
  sounds: { coinSpend: () => void };
}

const ShopTab = React.memo(function ShopTab({
  shopItems,
  money,
  currency,
  purchaseShopItem,
  sounds,
}: TabProps) {
  const items = shopItems || [];
  const categories = [...new Set(items.map((i: any) => i.category))];
  return (
    <div className="space-y-4">
      <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-4">
        <h3 className="text-sm font-bold text-[#ffcc00] mb-1">Tienda Escolar</h3>
        <p className="text-[10px] text-[#aaaaaa]">Compra mejoras permanentes para tu escuela.</p>
      </div>
      {categories.map((cat: string) => (
        <div key={cat}>
          <h4 className="text-[10px] text-[#555555] uppercase mb-2">{cat}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.filter((i: any) => i.category === cat).map((item: any) => (
              <div key={item.id} className={`bg-[#0d0d0d] border rounded-lg p-3 ${item.purchased ? 'border-[#00ff88]/30' : 'border-[#222222]'}`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-[#aaaaaa]">{item.description}</div>
                  </div>
                </div>
                <div className="mt-2">
                  {item.purchased ? (
                    <Badge className="text-[9px] bg-[#00ff88]/20 text-[#00ff88] border-0">Comprado</Badge>
                  ) : (
                    <Button size="sm" className="w-full text-[10px] h-7 bg-[#111111] border border-[#333] text-[#aaaaaa] hover:text-white hover:border-[#00ff88]"
                      onClick={() => { purchaseShopItem(item.id); sounds.coinSpend(); }}
                      disabled={money < item.price}
                    >{currency}{item.price.toLocaleString()}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ShopTab;
