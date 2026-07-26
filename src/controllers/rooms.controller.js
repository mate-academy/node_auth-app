const { services: roomsService } = require('../models/rooms.model');

const controller = {
  getAll: async (req, res) => {
    const rooms = await roomsService.getAll();

    res.send(rooms);
  },
  getById: async (req, res) => {
    const room = await roomsService.getById(req.params.id);

    res.send(room);
  },
  create: async (req, res) => {
    const room = await roomsService.create(req.body);

    res.send(room);
  },
  delete: async (req, res) => {
    const room = await roomsService.delete(req.params.id);

    res.send(room);
  },
  update: async (req, res) => {
    const { id } = req.params;
    const { roomName } = req.body;

    await roomsService.update(id, roomName);

    const updatedRoom = await roomsService.getById(id);

    res.send(updatedRoom);
  },
};

module.exports = { controller };
