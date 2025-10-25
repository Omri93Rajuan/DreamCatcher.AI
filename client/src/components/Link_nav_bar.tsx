// Link_nav_bar.tsx
import { Link, useLocation } from "react-router-dom";

export default function Link_nav_bar({
  to,
  innerText,
}: {
  to: string;
  innerText: string;
}) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  const base =
    "inline-block mx-1 px-6 py-2 font-[Tahoma] text-[13px] font-bold select-none " +
    "rounded-md focus:outline-none focus:ring-1 focus:ring-black transition-colors duration-150";

  const idle =
    "text-white bg-gradient-to-b from-[#3ba0f5] to-[#0a64ad] border border-[#083c74] " +
    "shadow-[inset_-1px_-1px_#66ccff,inset_1px_1px_#002d5c] " +
    "hover:from-[#66bfff] hover:to-[#0a64ad]";

  const active =
    "text-white bg-gradient-to-b from-[#0a64ad] to-[#3ba0f5] border border-[#083c74] cursor-default " +
    "shadow-[inset_1px_1px_#66ccff,inset_-1px_-1px_#002d5c]";

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={`${base} ${isActive ? active : idle}`}
    >
      {innerText}
    </Link>
  );
}
