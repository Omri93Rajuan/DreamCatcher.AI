export const setDocumentDirection = (language: string) => {
  if (typeof document === "undefined") return;
  const dir = language === "he" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", language);
  document.body?.setAttribute("dir", dir);
};
