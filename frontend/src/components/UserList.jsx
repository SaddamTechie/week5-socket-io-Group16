import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';


function UserList({ currentRoom, setCurrentRoom }) {
  const [rooms] = useState(['general', 'room1', 'room2']);
  const [users, setUsers] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    socket.on('user_update', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      socket.off('user_update');
    };
  }, [socket]);

  const handleRoomChange = (room) => {
    setCurrentRoom(room);
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Rooms</h2>
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li key={room}>
              <button
                onClick={() => handleRoomChange(room)}
                className={`w-full text-left p-2 rounded transition-colors ${
                  currentRoom === room ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                # {room}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1">
  <h2 className="text-lg font-bold mb-2">Online Users</h2>
  <div className="max-h-64 overflow-y-auto">
    <ul className="space-y-2">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>{user.username}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
    </div>
  );
}

export default UserList;