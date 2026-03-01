import { prisma } from "../db.ts"
import type { NormalizedUser } from "../types/index.js"
import * as jws from '../service/jws.service.ts';

const getByToken = (token: string) => {
  return prisma.refreshToken.findFirst({
    where: {
      token
    }
  })
}

const getByUserId = (userId: string) => {
  return prisma.refreshToken.findFirst({
    where: {
      userId
    }
  })
}

const create = (normalizedUser: NormalizedUser) => {
  return prisma.refreshToken.create({
    data: {
      userId: normalizedUser.id,
      token: jws.generateRefreshToken(normalizedUser),
    }
  })
}

const upsert = (normalizedUser: NormalizedUser) => {
  return prisma.refreshToken.upsert({
    where: {
      userId: normalizedUser.id
    },
    update: {
      token: jws.generateRefreshToken(normalizedUser)
    },
    create: {
      userId: normalizedUser.id,
      token: jws.generateRefreshToken(normalizedUser)
    }
  })
}

const update = (normalizedUser: NormalizedUser) => {
  return prisma.refreshToken.update({
    where: {
      userId: normalizedUser.id,
    },
    data: {
      token: jws.generateRefreshToken(normalizedUser)
    },
  })
}

const deleteToken = (token: string) => {
  return prisma.refreshToken.delete({
    where: {
      token,
    }
  })
}

export {
  getByToken,
  getByUserId,
  create,
  update,
  deleteToken,
  upsert,
}
