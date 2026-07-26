const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { ApiError } = require('../exceptions/api.error');

const Room = sequelize.define(
  'Room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    roomName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      foreignKey: true,
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    createdAt: false,
    updatedAt: false,
  },
);

const services = {
  getAll: async () => {
    const rooms = await Room.findAll();

    return rooms;
  },
  getById: async (id) => {
    const room = await Room.findByPk(id);

    if (!room) {
      throw ApiError.notFound({ room: 'Not Found' });
    }

    return room;
  },
  create: async (roomName) => {
    const room = await Room.create(roomName);

    return room;
  },
  delete: async (id) => {
    const room = await Room.findByPk(id);

    await room.destroy();

    return room;
  },
  update: async (id, roomName) => {
    await Room.update({ roomName }, { where: { id } });
  },
};

module.exports = { services, Room };
