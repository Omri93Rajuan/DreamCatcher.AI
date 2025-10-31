import React from "react";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  sortBy: string;
  order: "asc" | "desc";
  onSort: (s: string) => void;
  onOrder: (o: "asc" | "desc") => void;
  view: "grid" | "list";
  onView: (v: "grid" | "list") => void;
};

export default function FiltersBar({
  search,
  onSearch,
  sortBy,
  order,
  onSort,
  onOrder,
  view,
  onView,
}: Props) {
  return (
    <div className="sticky top-0 bg-black/40 backdrop-blur-lg z-20 py-3 border-b border-purple-800 mb-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center gap-3 text-white">
        {/* Search */}
        <input
          className="w-full md:w-72 px-3 py-2 rounded bg-purple-950 border border-purple-700"
          placeholder="חיפוש חלומות..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sort field */}
          <select
            className="px-3 py-2 rounded bg-purple-950 border border-purple-700"
            value={sortBy}
            onChange={(e) => onSort(e.target.value)}
          >
            <option value="createdAt">תאריך</option>
            <option value="title">כותרת</option>
          </select>

          {/* Sort order */}
          <select
            className="px-3 py-2 rounded bg-purple-950 border border-purple-700"
            value={order}
            onChange={(e) => onOrder(e.target.value as any)}
          >
            <option value="desc">חדש → ישן</option>
            <option value="asc">ישן → חדש</option>
          </select>

          {/* View mode */}
          <button
            className={`px-3 py-2 rounded ${
              view === "grid" ? "bg-purple-600" : "bg-purple-950"
            }`}
            onClick={() => onView("grid")}
          >
            רשת
          </button>

          <button
            className={`px-3 py-2 rounded ${
              view === "list" ? "bg-purple-600" : "bg-purple-950"
            }`}
            onClick={() => onView("list")}
          >
            רשימה
          </button>
        </div>
      </div>
    </div>
  );
}
