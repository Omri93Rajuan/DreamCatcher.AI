import type { TFunction } from "i18next";

type FriendlyErrorContext =
  | "generic"
  | "interpret"
  | "dreams"
  | "myDreams"
  | "dreamDetails"
  | "deleteDream"
  | "journal"
  | "popular"
  | "stats"
  | "profileSave"
  | "profileUpload"
  | "signupAvatar"
  | "contact"
  | "google";

type ErrorLike = {
  message?: unknown;
  code?: unknown;
  response?: {
    status?: number;
    data?: any;
  };
};

const AI_UNAVAILABLE_CODES = new Set([
  "ai_not_configured",
  "ai_provider_error",
]);

function asObject(error: unknown): ErrorLike {
  return error && typeof error === "object" ? (error as ErrorLike) : {};
}

function responseData(error: ErrorLike) {
  return error.response?.data || {};
}

function responseCode(error: ErrorLike) {
  const data = responseData(error);
  const code =
    data?.code ||
    data?.error?.code ||
    data?.error ||
    error.code;
  return typeof code === "string" ? code : "";
}

function responseStatus(error: ErrorLike) {
  return error.response?.status;
}

function errorMessage(error: ErrorLike) {
  const data = responseData(error);
  const message =
    data?.message ||
    data?.error?.message ||
    data?.error ||
    error.message;
  return typeof message === "string" ? message : "";
}

function contextFallbackKey(context: FriendlyErrorContext) {
  return `errors.context.${context}`;
}

export function getFriendlyErrorMessage(
  error: unknown,
  t: TFunction,
  context: FriendlyErrorContext = "generic"
) {
  const err = asObject(error);
  const status = responseStatus(err);
  const code = responseCode(err);
  const message = errorMessage(err);

  if (code === "ai_timeout" || status === 504) {
    return t("errors.aiTimeout");
  }

  if (AI_UNAVAILABLE_CODES.has(code) || message.startsWith("OpenRouter error:")) {
    return t("errors.aiUnavailable");
  }

  if (
    message === "Network Error" ||
    message.toLowerCase().includes("network error") ||
    code === "ERR_NETWORK"
  ) {
    return t("errors.network");
  }

  if (code === "ECONNABORTED" || message.toLowerCase().includes("timeout")) {
    return t("errors.timeout");
  }

  if (status === 401) return t("errors.unauthorized");
  if (status === 403) return t("errors.forbidden");
  if (status === 404) return t("errors.notFound");
  if (status === 413) return t("errors.fileTooLarge");
  if (status === 429) return t("errors.rateLimited");
  if (status && status >= 500) return t("errors.server");

  return t(contextFallbackKey(context));
}
