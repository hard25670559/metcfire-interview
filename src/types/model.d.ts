type CreateUserModel = {
  name: string;
  age: number;
};

type UserModel = {
  id: string;
} & CreateUserModel;
