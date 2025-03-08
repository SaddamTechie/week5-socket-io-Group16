import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';


function ChatWindow({ currentRoom, username }) {
  const [messages, setMessages] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (currentRoom && username) {
      socket.emit('join', { username, room: currentRoom });
      console.log('Joined room:', currentRoom, 'as', username);

      socket.on('receive_message', (data) => {
        console.log('Received message:', data);
        setMessages((prev) => [...prev, data]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [currentRoom, username, socket]);

  return (
  <div className="flex-1 overflow-y-auto p-4 bg-white">
    {messages.map((msg, index) => (
      <div
        key={index}
        className={`mb-4 flex ${
          msg.username === 'System'
            ? 'justify-center'
            : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[70%] p-3 relative ${
            msg.username === 'System'
              ? 'bg-gray-200 text-gray-700 rounded-full text-center shadow-md'
              : 'bg-blue-500 text-white rounded-lg shadow-md user-message'
          }`}
        >
          <span className="font-bold">{msg.username}: </span>
          <span>{msg.message}</span>
          <span className="text-gray-300 text-sm ml-2 block">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    ))}
  </div>
);
}

export default ChatWindow;