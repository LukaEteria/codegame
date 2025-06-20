import { useState } from "react";
import Board from "./Board";

function Game({ socket, room, nickname, roomId }) {
  const me = room.players.find((p) => p.nickname === nickname);
  const [clue, setClue] = useState("");
  const [number, setNumber] = useState(0);

  const isSpymaster = me?.role === "spymaster";
  const isTurn = me?.team === room.turn;

  const submitClue = () => {
    if (clue && number > 0) {
      socket.emit("set-clue", { roomId, clue, number });
      setClue("");
      setNumber(0);
    }
  };

  const endTurn = () => socket.emit("end-turn", { roomId });

  const chooseRole = (team, role) => {
    socket.emit("set-role", { roomId, team, role });
  };

  return (
    <div className="game">
      <div className="sidebar">
        <div className="team-panel red">
          <h2>🔴 წითელი გუნდი</h2>
          {room.players.filter(p => p.team === "red").map(p =>
            <div key={p.id}>{p.nickname} ({p.role || "??"})</div>
          )}
          <button onClick={() => chooseRole("red", "spymaster")}>სპაიმასტერი</button>
          <button onClick={() => chooseRole("red", "operative")}>ოპერატივი</button>
        </div>
        <div className="team-panel blue">
          <h2>🔵 ლურჯი გუნდი</h2>
          {room.players.filter(p => p.team === "blue").map(p =>
            <div key={p.id}>{p.nickname} ({p.role || "??"})</div>
          )}
          <button onClick={() => chooseRole("blue", "spymaster")}>სპაიმასტერი</button>
          <button onClick={() => chooseRole("blue", "operative")}>ოპერატივი</button>
        </div>
      </div>

      <div className="center">
        <Board
          board={room.board}
          isSpymaster={isSpymaster}
          revealWord={(word) => socket.emit("reveal-word", { roomId, word })}
        />

        {room.winner ? (
          <div className="winner">
            🏆 მოიგო {room.winner === "red" ? "🔴 წითელმა" : "🔵 ლურჯმა"} გუნდმა!
          </div>
        ) : isSpymaster && isTurn && !room.clue ? (
          <div className="clue-box">
            <input placeholder="მინიშნება" value={clue} onChange={e => setClue(e.target.value)} />
            <input type="number" value={number} onChange={e => setNumber(+e.target.value)} />
            <button onClick={submitClue}>დადასტურება</button>
          </div>
        ) : !isSpymaster && isTurn && room.clue ? (
          <div className="turn-box">
            <strong>მინიშნება:</strong> {room.clue.clue} ({room.clue.number})
            <button onClick={endTurn}>ტურის დასრულება</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Game;
