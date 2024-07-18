import { api } from 'boot/axios';

const API_URL = 'api/CRUDTest';

export default class UserRepository {
  // crud
  // create
  async create(user: CreateUserModel) {
    const { data } = await api.post(API_URL, user);

    return data;
  }

  // read
  async list() {
    const { data } = await api.get(`${API_URL}/a`);

    return data;
  }

  async delete(id: UserModel['id']) {
    const { data } = await api.delete(`${API_URL}/${id}`);

    return data;
  }

  async update(user: UserModel) {
    const { data } = await api.patch(API_URL, user);

    return data;
  }
}
