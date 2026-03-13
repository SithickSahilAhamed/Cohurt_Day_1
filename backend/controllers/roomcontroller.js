const rooms = [];
const roomParticipants = [];

// Create Room
exports.createRoom = (req, res) => {

    const { tournamentId } = req.body;

    const newRoom = {
        id: Date.now(),
        tournamentId,
        createdBy: req.user.id
    };

    rooms.push(newRoom);

    res.json({
        message: "Room created successfully",
        room: newRoom
    });

};


// Join Room
exports.joinRoom = (req, res) => {

    const roomId = parseInt(req.params.id);
    const userId = req.user.id;

    const room = rooms.find(r => r.id === roomId);

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    roomParticipants.push({
        roomId,
        userId
    });

    res.json({
        message: "Joined room successfully"
    });

};


// Get Room Details
exports.getRoom = (req, res) => {

    const roomId = parseInt(req.params.id);

    const room = rooms.find(r => r.id === roomId);

    if (!room) {
        return res.status(404).json({
            message: "Room not found"
        });
    }

    const participants = roomParticipants.filter(p => p.roomId === roomId);

    res.json({
        room,
        participants
    });

};


// Leave Room
exports.leaveRoom = (req, res) => {

    const roomId = parseInt(req.params.id);
    const userId = req.user.id;

    const index = roomParticipants.findIndex(
        p => p.roomId === roomId && p.userId === userId
    );

    if (index === -1) {
        return res.status(404).json({
            message: "User not in room"
        });
    }

    roomParticipants.splice(index, 1);

    res.json({
        message: "Left room successfully"
    });

};