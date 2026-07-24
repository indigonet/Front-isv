import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  Info,
  Share2,
} from "lucide-react";
import iOneTechLogo from "../../assets/iOneTech.png";

export default function CanvasBottomBar({
  zoom,
  handleZoom,
  handleCenterView,
  elementsCount,
  setIsShareModalOpen,
  handleSVGExport,
  handlePNGExport,
  imageInputRef,
  handleImageImport,
}) {
  return (
    <>
      {/* Permanent iOne Tech Watermark in Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 px-3.5 py-2 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 pointer-events-none select-none opacity-90 transition-opacity hover:opacity-100">
        <img src={iOneTechLogo} alt="iOne Tech" className="h-6 w-auto object-contain drop-shadow-sm" />
      </div>

      {/* Floating Canvas Save, Share & Export Control Panel */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 p-2 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300">
        <button
          onClick={() => setIsShareModalOpen(true)}
          title="Compartir enlace de proyecto"
          className="btn-draw inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 transition-all cursor-pointer whitespace-nowrap shrink-0 min-w-max"
        >
          <Share2 size={15} />
          <span>Compartir</span>
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageImport}
          className="hidden"
        />

        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

        <button
          onClick={handleSVGExport}
          title="Exportar como SVG (vectorial)"
          className="btn-draw inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:scale-105 cursor-pointer whitespace-nowrap shrink-0 min-w-max"
        >
          <span>SVG</span>
        </button>

        <button
          onClick={handlePNGExport}
          title="Exportar como PNG (imagen)"
          className="btn-draw inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 transition-all cursor-pointer whitespace-nowrap shrink-0 min-w-max"
        >
          <span>PNG</span>
        </button>
      </div>

      {/* Floating Canvas Zoom and coordinates info indicators */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <div className="flex p-1.5 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 items-center gap-1.5">
          <button
            onClick={() => handleZoom("out")}
            title="Alejar"
            className="btn-draw p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-bold text-slate-500 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom("in")}
            title="Acercar"
            className="btn-draw p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => handleZoom("reset")}
            title="Resetear Zoom"
            className="btn-draw p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Center View / Fit All Content Button */}
        <button
          onClick={handleCenterView}
          title="Centrar lienzo en mi trabajo (Enfocar elementos)"
          className="btn-draw px-3 py-2 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5 shadow-xl"
        >
          <Target size={16} className="text-purple-600 dark:text-purple-400" />
          <span className="hidden sm:inline">Centrar Trabajo</span>
        </button>

        <div className="hidden md:flex px-3 py-2 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold text-slate-400 gap-3 items-center">
          <span className="flex items-center gap-1">
            <Info size={12} /> Elementos: {elementsCount}
          </span>
          <span>Atajos: [V] Select, [P] Pen, [R] Rect, [Doble Clic] Editar Texto</span>
        </div>
      </div>
    </>
  );
}
