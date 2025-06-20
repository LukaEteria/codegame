function Lobby({ nickname, setNickname, handleCreate, handleJoin }) {
  return (
    <div className="lobby">
      <h1 className="title">Codenames</h1>
      <input
        placeholder="შეიყვანე ნიკნეიმი"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <div className="buttons">
        <button onClick={handleCreate}>ოთახის შექმნა</button>
        <button onClick={handleJoin}>ოთახში შესვლა</button>
      </div>
    </div>
  );
}

export default Lobby;