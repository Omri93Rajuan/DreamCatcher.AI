import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

export default function PageHeader({
  title,
  subtitle,
  align = "center",
}: PageHeaderProps) {
  const alignment =
    align === "left"
      ? "text-left"
      : align === "right"
      ? "text-right"
      : "text-center";

  return (
    <header className={`mb-8 ${alignment}`}>
      <h1 className="text-4xl font-extrabold tracking-tight text-customBlue-600 drop-shadow-lg">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-lg text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="mt-4 h-1 w-20 bg-gradient-to-r from-red-600 to-red-400 rounded-full mx-auto" />
    </header>
  );
}
