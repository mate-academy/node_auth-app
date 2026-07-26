const { services: messageService } = require('../models/messages.model');

const controller = {
  getAll: async (req, res) => {
    const messages = await messageService.getAll();

    res.send(messages);
  },
  getById: async (req, res) => {
    const message = await messageService.getById(req.params.id);

    res.send(message);
  },
  create: async (req, res) => {
    const message = await messageService.create(req.body);

    res.send(message);
  },
  delete: async (req, res) => {
    const message = await messageService.delete(req.params.id);

    res.send(message);
  },
  update: async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    await messageService.update(id, message);

    const updatedMessage = await messageService.getById(id);

    res.send(updatedMessage);
  },
  getAllByRoomId: async (req, res) => {
    const roomMessages = await messageService.getAllByRoomId(req.params.roomId);

    res.send(roomMessages);
  },
};

module.exports = { controller };
