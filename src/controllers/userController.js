import { userService } from '../services/userService.js';

export const userController = { getAll };

// @ts-check
/* eslint no-unused-vars: "warn" */
/** @typedef {import("../utils/types").TyFuncController} TyUserController */

/** @type {TyUserController} */
async function getAll(req, res) {
  const users = await userService.getAllActive();

  res.send(
    users.map(userService.normalize)
  );
}
