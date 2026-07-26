import { Room } from '../types/Room';
import { httpClient as client } from '../http/httpClient';

export const getRooms = async () => {
  const data = await client.get<Room[]>('/rooms');

  return data;
};

export const getRoomById = async (id: string) => {
  const data = await client.get<Room>(`/rooms/${id}`);

  return data;
};

export const addRoom = async (roomName: string, userId: string) => {
  const data = await client.post<Room>('/rooms', {
    roomName,
    userId,
  });

  return data;
};

export const deleteRoom = async (id: string) => {
  const data = await client.delete(`/rooms/${id}`);

  return data;
};

export const updateRoomName = async (id: string, roomName: string) => {
  const data = await client.patch<Room>(`/rooms/${id}`, {
    roomName,
  });

  return data;
};
