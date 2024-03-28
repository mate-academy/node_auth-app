'use strict';

class UserController {
  constructor(userAccessService) {
    this.userAccessService = userAccessService;
  }

  async getAll(req, res) {
    const usersData = await this.userAccessService.getAll();

    res.send(usersData);
  }

  async getById(req, res) {
    const { id } = req.params;

    const userData = await this.userAccessService.getById(id);

    res.send(userData);
  }

  async create(req, res) {
    const { body } = req;

    const userData = await this.userAccessService.create(body);

    res.status(201).send(userData);
  }

  async remove(req, res) {
    const { id } = req.params;

    await this.userAccessService.remove(id);

    res.sendStatus(204);
  }

  async update(req, res) {
    const { body } = req;
    const { id } = req.params;

    const userData = await this.userAccessService.update(id, body);

    res.send(userData);
  }
}

module.exports = {
  UserController,
};
