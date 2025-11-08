export const enableRTL = () => {
    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "he");
    }
};
