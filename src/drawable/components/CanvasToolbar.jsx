import React, { useState } from "react";
import {
  MousePointer,
  Hand,
  Square,
  Diamond,
  Circle,
  Triangle,
  ArrowUpRight,
  Minus,
  Pencil,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Image as ImageIcon,
  Cloud,
  ChevronDown,
  Shapes,
} from "lucide-react";

export default function CanvasToolbar({
  tool,
  setTool,
  setSelectedIds,
  setIsSidebarOpen,
  activeIconObj,
  isLibraryDropdownOpen,
  setIsLibraryDropdownOpen,
  isShapeDropdownOpen,
  setIsShapeDropdownOpen,
  imageInputRef,
  undo,
  redo,
  canUndo,
  canRedo,
  clearCanvas,
  resetDefaultStyles,
}) {
  const ActiveIconComp = activeIconObj?.icon || Cloud;

  const shapeTools = [
    { id: "rectangle", icon: Square, label: "Rectángulo (R)" },
    { id: "ellipse", icon: Circle, label: "Círculo (O)" },
    { id: "triangle", icon: Triangle, label: "Triángulo" },
    { id: "diamond", icon: Diamond, label: "Rombo (D)" },
  ];

  const activeShapeObj = shapeTools.find((s) => s.id === tool) || shapeTools[0];
  const ActiveShapeIcon = activeShapeObj.icon;
  const isShapeActive = ["rectangle", "ellipse", "triangle", "diamond"].includes(tool);

  const handleToolSelect = (toolId) => {
    setTool(toolId);
    setSelectedIds([]);
    if (resetDefaultStyles) resetDefaultStyles();
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-2 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none flex-nowrap transition-all duration-300">
      {/* Seleccionar */}
      <button
        onClick={() => handleToolSelect("select")}
        title="Seleccionar (V)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "select"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/30"
            : "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
        }`}
      >
        <MousePointer size={19} />
      </button>

      {/* Mano / Lienzo */}
      <button
        onClick={() => handleToolSelect("hand")}
        title="Lienzo / Mano (H)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "hand"
            ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105 border border-amber-400/30"
            : "hover:bg-amber-50 dark:hover:bg-amber-950/30 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
        }`}
      >
        <Hand size={19} />
      </button>

      {/* Dropdown Desplegable Unificado de Formas Geométricas */}
      <button
        onClick={() => {
          setIsShapeDropdownOpen(!isShapeDropdownOpen);
          setIsLibraryDropdownOpen(false);
          if (!isShapeActive) {
            handleToolSelect(activeShapeObj.id);
          }
        }}
        title="Formas Geométricas (Rectángulo, Círculo, Triángulo, Rombo)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          isShapeActive
            ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 scale-105 border border-emerald-400/30"
            : "hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
        }`}
      >
        <ActiveShapeIcon size={19} />
        <ChevronDown
          size={11}
          className={`absolute bottom-0.5 right-0.5 transition-transform duration-200 ${
            isShapeDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Biblioteca de Iconos Custom */}
      <button
        onClick={() => {
          handleToolSelect("custom-icon");
          setIsLibraryDropdownOpen(!isLibraryDropdownOpen);
          setIsShapeDropdownOpen(false);
        }}
        title={`Biblioteca de Iconos (${activeIconObj?.label || "Iconos"})`}
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "custom-icon"
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 scale-105 border border-violet-400/30"
            : "hover:bg-violet-50 dark:hover:bg-violet-950/30 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400"
        }`}
      >
        <ActiveIconComp size={19} />
        <ChevronDown
          size={11}
          className={`absolute bottom-0.5 right-0.5 transition-transform duration-200 ${
            isLibraryDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Flecha */}
      <button
        onClick={() => handleToolSelect("arrow")}
        title="Flecha (A)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "arrow"
            ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 scale-105 border border-sky-400/30"
            : "hover:bg-sky-50 dark:hover:bg-sky-950/30 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
        }`}
      >
        <ArrowUpRight size={19} />
      </button>

      {/* Línea */}
      <button
        onClick={() => handleToolSelect("line")}
        title="Línea (L)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "line"
            ? "bg-gradient-to-r from-slate-600 to-zinc-700 text-white shadow-lg shadow-slate-500/30 scale-105 border border-slate-400/30"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
        }`}
      >
        <Minus size={19} />
      </button>

      {/* Dibujo Libre */}
      <button
        onClick={() => handleToolSelect("freedraw")}
        title="Dibujo Libre (P)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "freedraw"
            ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 scale-105 border border-teal-400/30"
            : "hover:bg-teal-50 dark:hover:bg-teal-950/30 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
        }`}
      >
        <Pencil size={19} />
      </button>

      {/* Texto */}
      <button
        onClick={() => handleToolSelect("text")}
        title="Texto (T)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "text"
            ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-yellow-500/30 scale-105 border border-yellow-400/30"
            : "hover:bg-yellow-50 dark:hover:bg-yellow-950/30 text-slate-600 dark:text-slate-300 hover:text-yellow-600 dark:hover:text-yellow-400"
        }`}
      >
        <Type size={19} />
      </button>

      {/* Importar Imagen */}
      <button
        onClick={() => imageInputRef.current?.click()}
        title="Importar Imagen"
        className="btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950/30 text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400"
      >
        <ImageIcon size={19} />
      </button>

      {/* Borrador */}
      <button
        onClick={() => handleToolSelect("eraser")}
        title="Borrador (E)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "eraser"
            ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 scale-105 border border-red-400/30"
            : "hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
        }`}
      >
        <Eraser size={19} />
      </button>

      <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

      {/* Undo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Deshacer (Ctrl+Z)"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Undo2 size={19} />
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rehacer (Ctrl+Y)"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-40 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Redo2 size={19} />
      </button>

      {/* Clear Canvas */}
      <button
        onClick={clearCanvas}
        title="Limpiar Lienzo"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Trash2 size={19} />
      </button>
    </div>
  );
}
