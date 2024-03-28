'use strict';

const { Op } = require('sequelize');
const { AbstractRepository } = require('../../libs/db/abstract.repository.js');
const { User } = require('../../models/user.model.js');

class ExpenseRepository extends AbstractRepository {
  async getExpenses({ userId, categoriesArray: categories, from, to }) {
    const whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (categories.length > 0) {
      whereClause.category = {
        [Op.in]: categories,
      };
    }

    if (from) {
      whereClause.spentAt = {
        [Op.gte]: from,
      };
    }

    if (to) {
      whereClause.spentAt = {
        ...whereClause.spentAt,
        [Op.lte]: to,
      };
    }

    return this.model.findAll({
      where: whereClause,
      order: ['spentAt'],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });
  }

  async getExpense(id) {
    return this.model.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });
  }
}

module.exports = {
  ExpenseRepository,
};
