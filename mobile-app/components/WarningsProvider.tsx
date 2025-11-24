import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { WarningNotification } from './ui/WarningNotification';
import { onWarning } from '../utils/notifications';
import { View } from 'react-native';

export type Warning = { id: string; message: string };

const WarningsContext = createContext<{
  warnings: Warning[];
  addWarning: (message: string) => void;
  clearWarning: (id: string) => void;
}>({ warnings: [], addWarning: () => {}, clearWarning: () => {} });

export function useWarnings() {
  return useContext(WarningsContext);
}

export const WarningsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const addWarning = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setWarnings(prev => [{ id, message }, ...prev].slice(0, 3));
  };

  const clearWarning = (id: string) => setWarnings(prev => prev.filter(w => w.id !== id));

  const value = useMemo(() => ({ warnings, addWarning, clearWarning }), [warnings]);

  return (
    <WarningsContext.Provider value={value}>
      {/* Listen for global warning emits */}
      <WarningsListener onMessage={addWarning} />
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 1000 }}>
        {warnings.map(w => (
          <WarningNotification key={w.id} message={w.message} />
        ))}
      </View>
      {children}
    </WarningsContext.Provider>
  );
};

const WarningsListener = ({ onMessage }: { onMessage: (m: string) => void }) => {
  useEffect(() => {
    const unsub = onWarning(onMessage);
    return () => { unsub(); };
  }, [onMessage]);
  return null;
};
