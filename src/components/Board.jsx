import "../App.css"

function Board({ board, isSpymaster, revealWord }) {
  return (
    <div className="board">
      {board.map((card, index) => (
        <div
          key={index}
          className={`card ${card.revealed ? card.role : ""} ${isSpymaster ? "spymaster" : ""}`}
          onClick={() => !isSpymaster && !card.revealed && revealWord(card.word)}
        >
          <div className="word">{card.word}</div>
          {isSpymaster && !card.revealed && <div className={`role-mark ${card.role}`} />}
        </div>
      ))}
    </div>
  );
}

export default Board;