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
  isArrowDropdownOpen,
  setIsArrowDropdownOpen,
  imageInputRef,
  undo,
  redo,
  canUndo,
  canRedo,
  clearCanvas,
  resetDefaultStyles,
  connectedCount = 1,
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-2 backdrop-blur-xl bg-white/85 rounded-2xl shadow-xl border border-slate-200/80 max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none flex-nowrap transition-all duration-300">
      {/* Seleccionar */}
      <button
        onClick={() => handleToolSelect("select")}
        title="Seleccionar (V)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "select"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/30"
            : "hover:bg-blue-50 text-slate-600 hover:text-blue-600"
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
            : "hover:bg-amber-50 text-slate-600 hover:text-amber-600"
        }`}
      >
        <Hand size={19} />
      </button>

      {/* Dropdown Desplegable Unificado de Formas Geométricas */}
      <button
        onClick={() => {
          setIsShapeDropdownOpen(!isShapeDropdownOpen);
          if (setIsLibraryDropdownOpen) setIsLibraryDropdownOpen(false);
          if (setIsArrowDropdownOpen) setIsArrowDropdownOpen(false);
        }}
        title="Formas Geométricas (Rectángulo, Círculo, Triángulo, Rombo)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          isShapeActive
            ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30 scale-105 border border-emerald-400/30"
            : "hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
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
          setIsLibraryDropdownOpen(!isLibraryDropdownOpen);
          if (setIsShapeDropdownOpen) setIsShapeDropdownOpen(false);
          if (setIsArrowDropdownOpen) setIsArrowDropdownOpen(false);
        }}
        title={`Biblioteca de Iconos (${activeIconObj?.label || "Iconos"})`}
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "custom-icon"
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 scale-105 border border-violet-400/30"
            : "hover:bg-violet-50 text-slate-600 hover:text-violet-600"
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
        onClick={() => {
          if (setIsArrowDropdownOpen) setIsArrowDropdownOpen(!isArrowDropdownOpen);
          if (setIsShapeDropdownOpen) setIsShapeDropdownOpen(false);
          if (setIsLibraryDropdownOpen) setIsLibraryDropdownOpen(false);
        }}
        title="Herramienta Flecha (Flecha Recta, Esquina a 90°, Curva)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "arrow"
            ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 scale-105 border border-sky-400/30"
            : "hover:bg-sky-50 text-slate-600 hover:text-sky-600"
        }`}
      >
        <ArrowUpRight size={19} />
        <ChevronDown
          size={11}
          className={`absolute bottom-0.5 right-0.5 transition-transform duration-200 ${
            isArrowDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Línea */}
      <button
        onClick={() => handleToolSelect("line")}
        title="Línea (L)"
        className={`btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 ${
          tool === "line"
            ? "bg-gradient-to-r from-slate-600 to-zinc-700 text-white shadow-lg shadow-slate-500/30 scale-105 border border-slate-400/30"
            : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
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
            : "hover:bg-teal-50 text-slate-600 hover:text-teal-600"
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
            : "hover:bg-yellow-50 text-slate-600 hover:text-yellow-600"
        }`}
      >
        <Type size={19} />
      </button>

      {/* Importar Imagen */}
      <button
        onClick={() => imageInputRef.current?.click()}
        title="Importar Imagen"
        className="btn-draw relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center shrink-0 hover:bg-fuchsia-50 text-slate-600 hover:text-fuchsia-600"
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
            : "hover:bg-red-50 text-slate-600 hover:text-red-600"
        }`}
      >
        <Eraser size={19} />
      </button>

      <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />

      {/* Undo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Deshacer (Ctrl+Z)"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-40 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Undo2 size={19} />
      </button>

      {/* Redo */}
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Rehacer (Ctrl+Y)"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-40 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Redo2 size={19} />
      </button>

      {/* Clear Canvas */}
      <button
        onClick={clearCanvas}
        title="Limpiar Lienzo"
        className="btn-draw w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-red-500 hover:bg-red-50 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center shrink-0"
      >
        <Trash2 size={19} />
      </button>

      {/* Live P2P Collaborators Indicator */}
      {connectedCount > 1 && (
        <>
          <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0" />
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-xs font-extrabold animate-fade-in shrink-0"
            title="Colaboradores conectados en tiempo real mediante WebRTC"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{connectedCount} en línea</span>
          </div>
        </>
      )}
    </div>
  );
}
