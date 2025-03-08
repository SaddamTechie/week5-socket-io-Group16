import { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socket = io('http://localhost:5000');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id); // Debug log
    });
    socket.on('connect_error', (err) => {
      console.error('Connection error:', err); // Debug log
    });
    return () => socket.disconnect();
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);