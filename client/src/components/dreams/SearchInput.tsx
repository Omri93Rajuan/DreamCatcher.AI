import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = { value: string; onChange: (v: string) => void };

export default function SearchInput({ value, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto mb-16">
      <div className="relative">
        <Search className="absolute right-4 top-3 w-5 h-5 text-purple-400" />
        <Input
          placeholder="חפש/י חלום..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
      </div>
    </div>
  );
}
