export interface UserRow {
  id: string;
  username: string;
  fullname: string;
  password: string;
  email: string;
  locale: string;
  created_at: string;
  last_login: string;
  updated_at: string;
}

export interface UserInfos {
  username: string;
  fullname: string;
  email: string;
  locale: string;
}
export interface MyProfileInfos extends UserInfos {
  createdAt: string;
  lastLogin: string;
}
