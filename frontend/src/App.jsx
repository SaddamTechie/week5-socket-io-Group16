import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import { SocketProvider } from './contexts/SocketContext';

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [username, setUsername] = useState('');

  const handleJoin = (selectedUsername, room) => {
    setUsername(selectedUsername);
    setCurrentRoom(room);
  };

  if (!currentRoom || !username) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Join Chat</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={() => handleJoin(username, 'general')} // Default room
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={!username.trim()}
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-screen bg-gray-100">
        <UserList currentRoom={currentRoom} setCurrentRoom={setCurrentRoom} />
        <div className="flex-1 flex flex-col">
          <ChatWindow currentRoom={currentRoom} username={username} />
          <MessageInput currentRoom={currentRoom} />
        </div>
      </div>
    </SocketProvider>
  );
}

export default App;