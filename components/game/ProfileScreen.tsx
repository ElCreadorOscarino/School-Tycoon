'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { sounds } from '@/lib/sounds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SCREEN_ORDER, DIFFICULTY_CAPITAL } from '@/lib/game-types';
import type { Difficulty } from '@/lib/game-types';

const CURRENCIES = [
  { value: '$', label: '💵 USD Dolar', symbol: '$' },
  { value: '€', label: '💶 Euro', symbol: '€' },
  { value: 'MXN$', label: '💴 Peso MXN', symbol: 'MXN$' },
  { value: 'DOP$', label: '💴 Peso DOP', symbol: 'DOP$' },
  { value: 'custom', label: '✏️ Personalizado', symbol: '' },
];

const DIFFICULTY_OPTIONS: { key: Difficulty; emoji: string; label: string; capital: number }[] = [
  { key: 'easy', emoji: '💰', label: 'Facil', capital: DIFFICULTY_CAPITAL.easy },
  { key: 'normal', emoji: '⚖️', label: 'Normal', capital: DIFFICULTY_CAPITAL.normal },
  { key: 'hard', emoji: '🔥', label: 'Dificil', capital: DIFFICULTY_CAPITAL.hard },
  { key: 'custom', emoji: '✏️', label: 'Personalizado', capital: 0 },
];

export default function ProfileScreen() {
  const {
    schoolName, directorName, currency, difficulty, customCapital,
    setSchoolName, setDirectorName, setCurrency, setDifficulty, setCustomCapital,
    prevScreen, nextScreen,
  } = useGameStore();

  const [localName, setLocalName] = useState(schoolName || '');
  const [localDirector, setLocalDirector] = useState(directorName || '');
  const [localCurrency, setLocalCurrency] = useState(currency || '$');
  const [customCurrencySymbol, setCustomCurrencySymbol] = useState('');
  const [localDifficulty, setLocalDifficulty] = useState<Difficulty>(difficulty || 'normal');
  const [localCustomCapital, setLocalCustomCapital] = useState(customCapital || 300000);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  const stepIndex = SCREEN_ORDER.indexOf('profile');
  const totalSteps = SCREEN_ORDER.length;

  const isFormValid = localName.trim().length > 0 && localDirector.trim().length > 0;

  const handleSubmit = () => {
    if (!isFormValid) {
      sounds.error();
      return;
    }

    const finalCurrency = localCurrency === 'custom' ? customCurrencySymbol : localCurrency;
    setSchoolName(localName.trim());
    setDirectorName(localDirector.trim());
    setCurrency(finalCurrency || '$');

    if (localDifficulty === 'custom') {
      setCustomCapital(localCustomCapital);
    } else {
      setDifficulty(localDifficulty);
    }

    sounds.success();
    nextScreen();
  };

  const getCapitalDisplay = () => {
    if (localDifficulty === 'custom') {
      return localCustomCapital.toLocaleString();
    }
    return DIFFICULTY_CAPITAL[localDifficulty].toLocaleString();
  };

  const getCurrencySymbol = () => {
    if (localCurrency === 'custom') return customCurrencySymbol || '$';
    return localCurrency;
  };

  return (
    <div className="screen-enter min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Progress Bar */}
      <div className="w-full px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-[#aaaaaa] mb-1">
          <span>Paso {stepIndex + 1} de {totalSteps}</span>
          <span>{Math.round(((stepIndex + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-[#111111] rounded-full overflow-hidden border border-[#222222]">
          <div
            className="h-full bg-[#00ff88] transition-all duration-500 rounded-full"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-5xl mb-3">🏫</div>
            <h1 className="text-2xl font-bold text-[#00ff88] mb-1">Creacion de Perfil</h1>
            <p className="text-[#aaaaaa] text-sm">Configura los datos basicos de tu escuela</p>
          </div>

          {/* School Name */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <label className="block text-sm text-[#aaaaaa] mb-1.5">
              🏫 Nombre de la escuela <span className="text-[#ff4444]">*</span>
            </label>
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Ej: Academia San Juan Bautista"
              className="w-full bg-[#111111] border-[#333333] text-white placeholder-[#555555] font-mono h-11"
            />
          </div>

          {/* Director Name */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <label className="block text-sm text-[#aaaaaa] mb-1.5">
              👤 Nombre del director <span className="text-[#ff4444]">*</span>
            </label>
            <Input
              value={localDirector}
              onChange={(e) => setLocalDirector(e.target.value)}
              placeholder="Ej: Lic. Maria Rodriguez"
              className="w-full bg-[#111111] border-[#333333] text-white placeholder-[#555555] font-mono h-11"
            />
          </div>

          {/* Currency */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <label className="block text-sm text-[#aaaaaa] mb-1.5">💵 Moneda</label>
            <Select value={localCurrency} onValueChange={(v) => { sounds.click(); setLocalCurrency(v); }}>
              <SelectTrigger className="w-full bg-[#111111] border-[#333333] text-white font-mono h-11">
                <SelectValue placeholder="Selecciona moneda" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#333333]">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-white font-mono">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {localCurrency === 'custom' && (
              <Input
                value={customCurrencySymbol}
                onChange={(e) => setCustomCurrencySymbol(e.target.value)}
                placeholder="Ej: RD$, £, ¥"
                className="w-full mt-2 bg-[#111111] border-[#333333] text-white placeholder-[#555555] font-mono h-11"
              />
            )}
          </div>

          {/* Difficulty / Capital */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <label className="block text-sm text-[#aaaaaa] mb-3">💰 Capital inicial</label>
            <div className="grid grid-cols-2 gap-3">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    sounds.click();
                    setLocalDifficulty(opt.key);
                  }}
                  className={`relative p-4 rounded-lg border text-left transition-all ${
                    localDifficulty === opt.key
                      ? 'border-[#00ff88] bg-[#0a1a10] shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                      : 'border-[#333333] bg-[#111111] hover:border-[#555555]'
                  }`}
                >
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className="font-bold text-sm text-white">{opt.label}</div>
                  <div className="text-xs text-[#aaaaaa] mt-0.5">
                    {opt.key === 'custom' ? 'Tu eliges' : `${getCurrencySymbol()}${opt.capital.toLocaleString()}`}
                  </div>
                  {localDifficulty === opt.key && (
                    <div className="absolute top-2 right-2 text-[#00ff88] text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>

            {localDifficulty === 'custom' && (
              <div className="mt-3">
                <Input
                  type="number"
                  value={localCustomCapital}
                  onChange={(e) => setLocalCustomCapital(Number(e.target.value))}
                  placeholder="Cantidad de capital"
                  className="w-full bg-[#111111] border-[#333333] text-white placeholder-[#555555] font-mono h-11"
                  min={10000}
                  max={10000000}
                />
              </div>
            )}
          </div>

          {/* School Type */}
          <div className="bg-[#0d0d0d] border border-[#222222] rounded-lg p-5">
            <label className="block text-sm text-[#aaaaaa] mb-3">📌 Tipo de escuela</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => sounds.click()}
                className="p-4 rounded-lg border border-[#00ff88] bg-[#0a1a10] text-left transition-all shadow-[0_0_15px_rgba(0,255,136,0.1)]"
              >
                <div className="text-2xl mb-1">🏫</div>
                <div className="font-bold text-sm text-[#00ff88]">Privada</div>
                <div className="text-xs text-[#aaaaaa] mt-0.5">Seleccionada</div>
              </button>
              <button
                className="p-4 rounded-lg border border-[#333333] bg-[#0a0a0a] text-left opacity-50 cursor-not-allowed relative"
                title="Proximamente"
              >
                <div className="text-2xl mb-1 grayscale">🏛️</div>
                <div className="font-bold text-sm text-[#555555]">Publica</div>
                <div className="text-xs text-[#555555] mt-0.5">Proximamente</div>
                <div className="absolute top-1 right-2 text-[10px] bg-[#333333] text-[#aaaaaa] px-1.5 py-0.5 rounded">
                  🔒 Proximamente
                </div>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                sounds.click();
                prevScreen();
              }}
              className="flex-1 border border-[#333333] text-[#aaaaaa] hover:text-white hover:border-[#555555] h-12"
            >
              ← Anterior
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="flex-[2] bg-[#00ff88] text-black font-bold hover:bg-[#00cc6e] h-12 disabled:opacity-40 disabled:cursor-not-allowed px-8"
            >
              Continuar →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
