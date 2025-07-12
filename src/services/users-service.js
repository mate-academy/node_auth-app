import { User } from "../models/user.js";
import {v4} from 'uuid'

export const generateActivationToken = () => {
    return v4();
}

export const findUserByActivationToken = (activationToken) => {
    return User.findOne({
        where: {activationToken},
        attributes: ['id', 'email', 'name']
    })
}

export const consumeActivationToken = async (user) => {
    user.activationToken = null;
    await user.save()

    return user;
}

export const findActivatedUserByEmail = async (email) => {
    return await User.findOne({
    where: {email, activationToken: null},

  })
}
