import React from "react";
import { Search } from "lucide-react";

export default function IconLibraryModal({
  isOpen,
  onClose,
  iconLibrary,
  iconCategories,
  iconCategory,
  setIconCategory,
  iconSearch,
  setIconSearch,
  activeLibraryIcon,
  onSelectIcon,
}) {
  if (!isOpen) return null;

  const filteredIcons = iconLibrary.filter((item) => {
    const matchesCategory = iconCategory === "all" || item.category === iconCategory;
    const matchesSearch =
      !iconSearch || item.label.toLowerCase().includes(iconSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 w-80 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          Biblioteca de Iconos
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
          {filteredIcons.length} disponibles
        </span>
      </div>

      {/* Búsqueda */}
      <div className="relative mb-2.5">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar icono..."
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 dark:text-slate-200"
        />
      </div>

      {/* Categorías */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none mb-2">
        {iconCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setIconCategory(cat.id)}
            className={`btn-draw px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              iconCategory === cat.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Iconos */}
      <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-purple-500/20">
        {filteredIcons.map((item) => {
          const IconComponent = item.icon;
          const isSelected = activeLibraryIcon === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectIcon(item.id);
                onClose();
              }}
              title={item.label}
              className={`btn-draw flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "bg-white dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-105"
              }`}
            >
              <IconComponent size={22} />
              <span className="text-[9px] font-semibold mt-1 text-center truncate w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
