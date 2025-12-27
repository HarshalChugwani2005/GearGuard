import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    500: "#3b82f6",
                    600: "#2563eb", // Brand main
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                success: {
                    500: "#10b981",
                },
                warning: {
                    500: "#f59e0b",
                },
                danger: {
                    500: "#ef4444",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    safelist: [
        "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-gray-500", // For dynamic status badges
        "text-red-500", "text-yellow-500", "text-green-500",
        "border-red-500", "border-l-4", "border-l-red-500",
    ],
    plugins: [],
} as any;
export default config;
