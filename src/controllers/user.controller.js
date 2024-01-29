'use strict';

const express = require('express');
const uuidv4 = require('uuid');

const { getAllUserActivated, normalize } = require('../services/user.service');


const getAllActivated = async (req, res) => {
  const users = await getAllUserActivated();

  res.send(users.map(normalize));
}



module.exports = {
  getAllActivated,
};
