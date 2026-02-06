interface DBUser {
  id: string;
  name: string;
  email: string;
  password: string;
  activated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type DTOUser = Pick<DBUser, 'id' | 'name' | 'email'>;

type PatchUser = Omit<DBUser, 'id' | 'createdAt' | 'updatedAt'>;

type CreateUser = Pick<DBUser, 'name' | 'email' | 'password'>;

export type { DBUser, DTOUser, PatchUser, CreateUser };
