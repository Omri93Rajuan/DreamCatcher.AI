import { api } from "./apiClient";

export type AvatarUploadRequest = {
  contentType: string;
  contentLength?: number;
};

export type AvatarUploadResponse = {
  uploadUrl: string;
  publicUrl: string;
  proxyUrl?: string;
  expiresIn: number;
  maxBytes: number;
  key: string;
};

export const UploadsApi = {
  getAvatarUploadUrl: (body: AvatarUploadRequest) =>
    api
      .post<AvatarUploadResponse>("/uploads/avatar-url", body)
      .then((r) => r.data),
};
