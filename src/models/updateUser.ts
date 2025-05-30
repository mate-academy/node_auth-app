export interface UpdateProfileInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  newEmail?: string;
}

export interface UpdateProfileResult {
  updated: boolean;
  emailChanged: boolean;
}
