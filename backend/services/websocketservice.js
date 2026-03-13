let io;

exports.init = (server) => {
    const socketIo = require("socket.io");
    io = socketIo(server);

    io.on("connection", (socket) => {

        console.log("User connected");

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });

    });
};

exports.getIO = () => {
    return io;
};