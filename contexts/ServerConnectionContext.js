import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { serverConnectionService } from '../services/serverConnectionService';

const ServerConnectionContext = createContext(null);

export function ServerConnectionProvider({ children }) {
  const [connectionState, setConnectionState] = useState(serverConnectionService.getServerConnectionState());

  useEffect(() => {
    const unsubscribe = serverConnectionService.subscribeServerConnection(setConnectionState);
    serverConnectionService.checkServerConnection();
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      ...connectionState,
      refresh: serverConnectionService.checkServerConnection,
    }),
    [connectionState]
  );

  return <ServerConnectionContext.Provider value={value}>{children}</ServerConnectionContext.Provider>;
}

export function useServerConnection() {
  const context = useContext(ServerConnectionContext);
  if (!context) {
    throw new Error('useServerConnection must be used inside ServerConnectionProvider.');
  }
  return context;
}
