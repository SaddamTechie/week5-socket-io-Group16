import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';


function MessageInput({ currentRoom }) {
  const [message, setMessage] = useState('');
  const socket = useSocket();

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentRoom) {
      console.log('Sending message:', message, 'to room:', currentRoom); // Debug log
      socket.emit('send_message', message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={sendMessage} className="p-4 bg-gray-200">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded border"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default MessageInput;