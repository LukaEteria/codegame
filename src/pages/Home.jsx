import { useState } from "react";

export default function Home({ socket, setRoomId, setNickname, nickname }) {
  const [joinRoomId, setJoinRoomId] = useState("");

  const createRoom = () => {
    if (!nickname.trim()) return alert("Enter nickname");
    socket.emit("create-room", { nickname: nickname.trim() }, (id) => {
      setRoomId(id);
    });
  };

  const joinRoom = () => {
    if (!nickname.trim() || !joinRoomId.trim()) return alert("Fill all fields");
    socket.emit("join-room", { roomId: joinRoomId.trim(), nickname: nickname.trim() }, (err) => {
      if (err) alert(err);
      else setRoomId(joinRoomId.trim());
    });
  };

  return (
    <div className="p-4">
      <input
        placeholder="Nickname"
        value={nickname}
        onChange={e => {
          setNickname(e.target.value);
        }}
        className="border p-2 mr-2"
      />
      <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2">Create Room</button>
      <hr className="my-4" />
      <input
        placeholder="Room ID"
        value={joinRoomId}
        onChange={e => setJoinRoomId(e.target.value)}
        className="border p-2 mr-2"
      />
      <button onClick={joinRoom} className="bg-green-500 text-white px-4 py-2">Join Room</button>
    </div>
  );
}