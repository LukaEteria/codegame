import { useEffect, useState } from "react";
import io from "socket.io-client";
import Board from "./components/Board";
import Lobby from "./components/Lobby";
import Game from "./components/Game";

const socket = io("http://localhost:3001");

function App() {
  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    socket.on("room-data", (data) => {
      setRoom(data);
    });
  }, []);

  const handleCreate = () => {
    if (!nickname.trim()) return alert("შეიყვანე ნიკნეიმი");
    socket.emit("create-room", { nickname }, (id) => setRoomId(id));
  };

  const handleJoin = () => {
    const id = prompt("Enter room ID");
    if (!nickname.trim()) return alert("შეიყვანე ნიკნეიმი");
    socket.emit("join-room", { roomId: id, nickname }, (err) => {
      if (err) return alert(err);
      setRoomId(id);
    });
  };

  if (!roomId || !room) {
    return <Lobby {...{ nickname, setNickname, handleCreate, handleJoin }} />;
  }

  return <Game {...{ socket, room, nickname, roomId }} />;
}

export default App;
