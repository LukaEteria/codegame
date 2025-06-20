import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import words from "../worlds/sityva.js"; // ქართული სიტყვების სია

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

function generateBoard(wordList) {
  const shuffledWords = [...wordList].sort(() => 0.5 - Math.random()).slice(0, 25);
  const roles = [
    "assassin",
    ...Array(8).fill("red"),
    ...Array(8).fill("blue"),
    ...Array(8).fill("neutral"),
  ].sort(() => 0.5 - Math.random()); // როლებიც ვურევთ

  return shuffledWords.map((word, i) => ({
    word,
    role: roles[i],
    revealed: false,
  }));
}

io.on("connection", (socket) => {
  socket.on("create-room", ({ nickname }, callback) => {
    if (!nickname || !nickname.trim()) return;
    const roomId = Math.random().toString(36).substring(2, 8);
    rooms[roomId] = {
      players: [{ id: socket.id, nickname, role: null, team: null }],
      board: generateBoard(words),
      started: false,
      turn: "red",
      clue: null,
      guessesLeft: 0,
      scores: { red: 8, blue: 8 },
      winner: null
    };
    socket.join(roomId);
    callback(roomId);
    io.to(roomId).emit("room-data", rooms[roomId]);
  });

  socket.on("join-room", ({ roomId, nickname }, callback) => {
    if (!rooms[roomId]) return callback("Room not found");
    if (!nickname || !nickname.trim()) return callback("Invalid nickname");
    rooms[roomId].players.push({ id: socket.id, nickname, role: null, team: null });
    socket.join(roomId);
    callback(null);
    io.to(roomId).emit("room-data", rooms[roomId]);
  });

  socket.on("set-role", ({ roomId, role, team }) => {
    const player = rooms[roomId]?.players.find(p => p.id === socket.id);
    if (player) {
      player.role = role;
      player.team = team;
      io.to(roomId).emit("room-data", rooms[roomId]);
    }
  });

  socket.on("set-clue", ({ roomId, clue, number }) => {
    const room = rooms[roomId];
    if (!room || room.clue || room.winner) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== "spymaster" || player.team !== room.turn) return;
    room.clue = { clue, number };
    room.guessesLeft = number + 1;
    io.to(roomId).emit("room-data", room);
  });

  socket.on("reveal-word", ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room || room.guessesLeft <= 0) return;
    const wordObj = room.board.find(w => w.word === word);
    if (wordObj && !wordObj.revealed) {
      wordObj.revealed = true;

      if (wordObj.role === "assassin") {
        room.winner = room.turn === "red" ? "blue" : "red";
      } else if (wordObj.role === room.turn) {
        room.scores[room.turn]--;
        room.guessesLeft--;
        if (room.scores[room.turn] === 0) room.winner = room.turn;
      } else {
        room.guessesLeft = 0;
        room.turn = room.turn === "red" ? "blue" : "red";
      }

      io.to(roomId).emit("room-data", room);
    }
  });

  socket.on("end-turn", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.turn = room.turn === "red" ? "blue" : "red";
    room.clue = null;
    room.guessesLeft = 0;
    io.to(roomId).emit("room-data", room);
  });

  socket.on("new-game", ({ roomId }) => {
    if (!rooms[roomId]) return;
    rooms[roomId].board = generateBoard(words);
    rooms[roomId].started = false;
    rooms[roomId].turn = "red";
    rooms[roomId].clue = null;
    rooms[roomId].guessesLeft = 0;
    rooms[roomId].scores = { red: 8, blue: 8 };
    rooms[roomId].winner = null;
    io.to(roomId).emit("room-data", rooms[roomId]);
  });


  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
        io.to(roomId).emit("room-data", rooms[roomId]);
      }
    }
  });
});

server.listen(3001, () => console.log("✅ Server running on http://localhost:3001"));
