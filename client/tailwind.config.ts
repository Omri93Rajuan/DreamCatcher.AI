import type { Config } from "tailwindcss";
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Assistant", "ui-sans-serif", "system-ui"],
            },
        },
    },
    plugins: [],
} satisfies Config;
