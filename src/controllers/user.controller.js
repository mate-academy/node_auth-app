import { v4 as uuidv4 } from 'uuid';
import services from '../services/index.service.js';
import utils from '../utils/index.utils.js';

const create = async (req, res) => {
  const user = await services.user.create(req.body);

  if (!user) {
    throw new Error('Erro na criação do usuário');
  }

  const mail = await services.mail.sendActivationEmail({
    to: user.email,
    token: uuidv4(),
  });

  await services.auth.create({
    userId: user.id,
    activate: mail.token,
  });

  res.status(201).send(user);
};

const find = async (req, res) => {
  const user = await services.user.find(req.params);

  res.send(utils.normalize(user.dataValues, utils.CONFIDENTIAL_FIELDS));
};

const list = async (req, res) => {
  const users = await services.user.list(req.query);

  res.send(users);
};

const updateInfo = async (req, res) => {
  await services.user.updateInfo(req.user.id, req.body);

  const user = await services.user.find({ id: req.user.id });
  const oldEmail = req.user.email;
  const newEmail = req.body.email;

  if (newEmail) {
    await services.mail.send({
      to: [oldEmail, newEmail],
      subject: 'Email change',
      text: `Hi. ${req.user.name} your ${oldEmail} is now ${newEmail}`,
    });
  }
  req.user = user.toJSON();

  res.send(utils.normalize(user.dataValues, utils.CONFIDENTIAL_FIELDS));
};

const updatePassword = async (req, res) => {
  const user = await services.user.updatePassword(req.user.id, req.body);

  req.user = await services.user.find({ id: req.user.id });

  res.send(user);
};

const remove = async (req, res) => {
  await services.user.remove(req.user.id);

  res.status(204).send();
};

const userController = {
  create,
  find,
  list,
  updateInfo,
  updatePassword,
  remove,
};

export default userController;
