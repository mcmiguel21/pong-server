const io = require("socket.io")(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

let rooms = {}; // Guardaremos quién está en cada sala

io.on("connection", (socket) => {
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        // Si hay 2 jugadores, empezamos
        if (rooms[roomId].length === 2) {
            io.to(roomId).emit("startGame");
        }
    });

    // Cuando la pelota sale de una pantalla, llega aquí
    socket.on("transferBall", (data) => {
        // 'data' contiene y, dy, dx y roomId
        // Se la enviamos al OTRO jugador de la sala
        socket.to(data.roomId).emit("receiveBall", {
            y: data.y,
            dy: data.dy,
            dx: data.dx, // La velocidad X ya vendrá invertida desde el cliente
            power: data.power
        });
    });

    socket.on("disconnect", () => {
        // Limpieza de salas al desconectarse
    });
});

console.log("Servidor corriendo...");
