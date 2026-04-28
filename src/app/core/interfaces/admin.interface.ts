export interface LocalAdmin {
  businessName: string;
  adminName: string;
  username: string;
  passwordHash: string;
  secretKey: string;
  createdAt: string;
}

export interface RegisterAdminPayload {
  businessName: string;
  adminName: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}
