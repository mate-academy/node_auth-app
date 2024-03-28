'use strict';

class AbstractRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data, options = {}) {
    return this.model.create(data, options);
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async update(id, data, options = {}) {
    return this.model.update(data, {
      where: { id }, ...options,
    });
  }

  async remove(id, options = {}) {
    return this.model.destroy({
      where: { id }, ...options,
    });
  }
}

module.exports = {
  AbstractRepository,
};
