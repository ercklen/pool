import React, { useState } from 'react';
import { Lock, KeyRound } from 'lucide-react';

export default function PasswordModal({ title = "PROTECTED ACCESS", expectedPin = "102030", onSuccess, onCancel }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === expectedPin) {
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyPress = (num) => {
    if (pin.length < 10) {
      setError(false);
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setError(false);
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
          <Lock size={32} />
        </div>

        <h2 className="text-xl font-black text-white tracking-wide uppercase text-center mb-1">
          {title}
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6">
          Enter PIN password to proceed
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          {/* Display masked dots or password input */}
          <div className="relative w-full mb-6">
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              maxLength={10}
              value={pin}
              onChange={(e) => { setError(false); setPin(e.target.value); }}
              placeholder="••••••"
              className={`w-full bg-slate-950 border-2 ${error ? 'border-red-500 animate-shake' : 'border-slate-700 focus:border-emerald-500'} rounded-2xl py-3.5 px-4 text-center text-3xl font-mono tracking-widest text-white outline-none transition`}
            />
            {error && (
              <div className="text-red-400 text-xs font-bold text-center mt-2 animate-bounce">
                Incorrect PIN. Please try again.
              </div>
            )}
          </div>

          {/* Quick numeric keypad for mobile/tablets */}
          <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num.toString())}
                className="h-14 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold text-2xl rounded-xl transition flex items-center justify-center border border-slate-700/50 shadow-sm"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 bg-slate-800/40 hover:bg-slate-700 text-slate-400 font-semibold text-xs rounded-xl transition flex items-center justify-center border border-slate-700/50 uppercase"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-14 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-white font-bold text-2xl rounded-xl transition flex items-center justify-center border border-slate-700/50 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="h-14 bg-slate-800/40 hover:bg-slate-700 text-slate-400 font-semibold text-lg rounded-xl transition flex items-center justify-center border border-slate-700/50"
            >
              ⌫
            </button>
          </div>

          <div className="flex gap-3 w-full">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              <KeyRound size={16} /> Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
