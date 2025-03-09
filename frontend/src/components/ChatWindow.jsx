import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { ToastContainer, toast } from 'react-toastify';

function ChatWindow({ currentRoom, username }) {
  const [roomMessages, setRoomMessages] = useState({});
  const [hasJoinedGeneral, setHasJoinedGeneral] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (currentRoom && username) {
      if (!roomMessages[currentRoom]) {
        setRoomMessages((prev) => ({
          ...prev,
          [currentRoom]: []
        }));
      }

      socket.emit('join', { username, room: currentRoom });
      console.log('Joined room:', currentRoom, 'as', username);

      if (currentRoom === 'general' && !hasJoinedGeneral) {
        const welcomeMessage = {
          username: 'System',
          message: `Welcome to the chat, ${username}! Here’s how to get started:
            1. Type your message in the input below and press Send.
            2. Switch rooms using the list on the left.
            3. See who’s online in the user list.
            Enjoy chatting!`,
          timestamp: new Date()
        };
        setRoomMessages((prev) => ({
          ...prev,
          [currentRoom]: [welcomeMessage]
        }));
        setHasJoinedGeneral(true);
      }

      socket.on('receive_message', (data) => {
        console.log('Received message:', data);
        setRoomMessages((prev) => ({
          ...prev,
          [currentRoom]: [...(prev[currentRoom] || []), data]
        }));
      });

      socket.on('system_notification', (data) => {
        toast(data.message);
      });
      

      return () => {
        socket.off('receive_message');
      };
    }
  }, [currentRoom, username, socket]);

  const getChatWindowStyle = (room) => {
    switch (room) {
      case 'general':
        return 'bg-white text-black';
      case 'room1':
        return 'bg-gradient-to-br from-blue-100 to-blue-300 text-black';
      case 'room2':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-white text-black';
    }
  };

  const getMessageBubbleStyle = (room, isSystem) => {
    if (isSystem) {
      return 'bg-gray-200 text-gray-700 rounded-full text-center shadow-md';
    }
    switch (room) {
      case 'general':
        return 'bg-blue-500 text-white rounded-lg shadow-md';
      case 'room1':
        return 'bg-green-500 text-white rounded-xl shadow-lg';
      case 'room2':
        return 'bg-purple-600 text-white rounded-md shadow-md';
      default:
        return 'bg-blue-500 text-white rounded-lg shadow-md';
    }
  };

  const currentMessages = roomMessages[currentRoom] || [];
 


  return (
    <div className={`flex-1 overflow-y-auto p-4 ${getChatWindowStyle(currentRoom)}`}>
      {currentMessages.map((msg, index) => (
        <div
          key={index}
          className={`mb-4 flex ${
            msg.username === 'System' ? 'justify-center' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[70%] p-3 relative ${getMessageBubbleStyle(
              currentRoom,
              msg.username === 'System'
            )}`}
          >
            {msg.username !== 'System' && (
              <span className="font-bold">{msg.username}: </span>
            )}
            <span>{msg.message}</span>
            <span
              className={`text-sm ml-2 block ${
                currentRoom === 'room2' ? 'text-gray-300' : 'text-gray-500'
              }`}
            >
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
      <ToastContainer />
    </div>
  );
}

export default ChatWindow;