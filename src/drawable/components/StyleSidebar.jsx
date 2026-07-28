import React from "react";
import {
  ChevronLeft,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
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
  Cloud,
  RotateCw,
  Lock,
  Group,
  Target,
  Sparkles,
  Copy,
  Scissors,
  Clipboard,
  CopyPlus,
} from "lucide-react";

const COLORS = {
  black: "#1e293b",
  grey: "#64748b",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#f59e0b",
  green: "#10b981",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const TOOL_CONFIG = {
  select: { title: "Inspector de Selección", icon: MousePointer, color: "from-blue-600 to-indigo-600" },
  hand: { title: "Lienzo / Navegación", icon: Hand, color: "from-amber-500 to-orange-600" },
  rectangle: { title: "Estilo Rectángulo", icon: Square, color: "from-emerald-500 to-teal-600" },
  diamond: { title: "Estilo Rombo", icon: Diamond, color: "from-cyan-500 to-blue-600" },
  ellipse: { title: "Estilo Círculo", icon: Circle, color: "from-purple-600 to-indigo-600" },
  triangle: { title: "Estilo Triángulo", icon: Triangle, color: "from-rose-500 to-pink-600" },
  "custom-icon": { title: "Estilo de Icono", icon: Cloud, color: "from-violet-600 to-fuchsia-600" },
  arrow: { title: "Estilo Flecha", icon: ArrowUpRight, color: "from-sky-500 to-indigo-600" },
  line: { title: "Estilo Línea", icon: Minus, color: "from-slate-600 to-zinc-700" },
  freedraw: { title: "Pincel / Dibujo Libre", icon: Pencil, color: "from-teal-500 to-emerald-600" },
  text: { title: "Estilo de Texto", icon: Type, color: "from-amber-600 to-yellow-500" },
  image: { title: "Ajustes de Imagen", icon: ImageIcon, color: "from-fuchsia-500 to-purple-600" },
  eraser: { title: "Herramienta Borrador", icon: Eraser, color: "from-red-500 to-rose-600" },
};

export default function StyleSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  tool,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  fillStyle,
  setFillStyle,
  strokeWidth,
  setStrokeWidth,
  strokeStyle,
  setStrokeStyle,
  arrowHeadSize = "medium",
  setArrowHeadSize,
  arrowType = "straight",
  setArrowType,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  roughness,
  setRoughness,
  updateSelectedStyle,
  bringToFront,
  sendToBack,
  hasSelection,
  selectedElementType,
  imageInputRef,
  activeIconObj,
  setIsLibraryDropdownOpen,
  handleRotateSelection,
  handleGroupToggle,
  handleToggleFreeMove,
  handleCenterView,
  handleCopySelection,
  handleCutSelection,
  handlePasteSelection,
  handleDuplicateSelection,
  selectedCount = 0,
  isGrouped = false,
  handleGroupSelection,
  handleUngroupSelection,
}) {
  if (!isSidebarOpen) return null;

  const toolMeta = TOOL_CONFIG[tool] || { title: "Estilos del Elemento", icon: Square, color: "from-purple-600 to-indigo-600" };
  const ActiveIcon = tool === "custom-icon" && activeIconObj?.icon ? activeIconObj.icon : toolMeta.icon;
  const isTextMode = tool === "text" || selectedElementType === "text";
  const isShapeTool = ["rectangle", "diamond", "ellipse", "triangle", "custom-icon"].includes(tool);
  const isConnectorTool = ["line", "arrow"].includes(tool);

  return (
    <div className="absolute top-18 sm:top-20 left-4 z-30 w-[calc(100vw-2rem)] sm:w-76 backdrop-blur-xl bg-white/85 rounded-2xl shadow-2xl border border-slate-200/80 p-4 transition-all duration-300 max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 animate-fade-in">
      {/* Dynamic Header per Tool Page */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl bg-gradient-to-r ${toolMeta.color} text-white shadow-md shadow-purple-500/20`}>
            <ActiveIcon size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              {hasSelection && tool === "select" ? "Inspector de Selección" : toolMeta.title}
            </h3>
            <p className="text-[10px] font-medium text-slate-500">
              {hasSelection ? "Modificando elemento seleccionado" : `Ajustes para modo ${tool}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Ocultar panel"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Selection Tools Page Actions */}
        {(hasSelection || tool === "select") && (
          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-200/70 space-y-2">
            <span className="text-[11px] font-bold text-purple-700 block uppercase tracking-wide">
              Acciones de Selección
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {bringToFront && (
                <button
                  onClick={bringToFront}
                  disabled={!hasSelection}
                  title="Traer elementos al Frente"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <BringToFront size={14} className="text-purple-600" />
                  <span>Al Frente</span>
                </button>
              )}
              {sendToBack && (
                <button
                  onClick={sendToBack}
                  disabled={!hasSelection}
                  title="Enviar elementos al Fondo"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <SendToBack size={14} className="text-purple-600" />
                  <span>Al Fondo</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {handleToggleFreeMove && (
                <button
                  onClick={handleToggleFreeMove}
                  disabled={!hasSelection}
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Lock size={13} className="text-amber-500" />
                  <span>Bloquear</span>
                </button>
              )}
              {isGrouped ? (
                <button
                  onClick={handleUngroupSelection}
                  title="Desagrupar elementos seleccionados"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 cursor-pointer"
                >
                  <Group size={13} className="text-purple-600" />
                  <span>Desagrupar</span>
                </button>
              ) : (
                <button
                  onClick={handleGroupSelection}
                  disabled={!hasSelection || (selectedCount !== undefined && selectedCount < 2)}
                  title="Agrupar 2 o más elementos seleccionados"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Group size={13} className="text-purple-600" />
                  <span>Agrupar</span>
                </button>
              )}
              {handleCopySelection && (
                <button
                  onClick={handleCopySelection}
                  disabled={!hasSelection}
                  title="Copiar elementos seleccionados (Ctrl+C)"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Copy size={13} className="text-blue-500" />
                  <span>Copiar</span>
                </button>
              )}
              {handleCutSelection && (
                <button
                  onClick={handleCutSelection}
                  disabled={!hasSelection}
                  title="Cortar elementos seleccionados (Ctrl+X)"
                  className="btn-draw p-2 rounded-lg bg-white hover:bg-purple-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm border border-slate-200/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Scissors size={13} className="text-rose-500" />
                  <span>Cortar</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Image Import Button on Image tool */}
        {tool === "image" && (
          <button
            onClick={() => imageInputRef?.current?.click()}
            className="btn-draw w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100 text-purple-700 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <ImageIcon size={16} />
            <span>Importar Imagen (PNG / JPG)</span>
          </button>
        )}

        {/* Hand / Pan Canvas Page Controls */}
        {tool === "hand" && !hasSelection && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Modo Mano activo. Haz clic y arrastra sobre el lienzo para navegar libremente sin seleccionar elementos.
            </p>
            {handleCenterView && (
              <button
                onClick={handleCenterView}
                className="btn-draw w-full p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Target size={16} />
                <span>Centrar Trabajo en Pantalla</span>
              </button>
            )}
          </div>
        )}

        {/* Eraser Info Box */}
        {tool === "eraser" && !hasSelection && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            <p>🧹 Haz clic o arrastra sobre cualquier forma o trazo para eliminarlo al instante.</p>
          </div>
        )}

        {/* Stroke / Border Color Picker (for drawing and shapes) */}
        {tool !== "hand" && tool !== "eraser" && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
              {tool === "text" ? "Color de Texto" : "Color de Borde / Trazo"}
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => {
                    setStrokeColor(name);
                    updateSelectedStyle("strokeColor", name);
                  }}
                  className={`w-7 h-7 rounded-xl transition-all duration-150 cursor-pointer relative ${
                    strokeColor === name ? "ring-2 ring-purple-600 ring-offset-2 scale-110 shadow-md" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: hex }}
                  title={name}
                />
              ))}
            </div>
            {/* Custom Color Input */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer shrink-0">
                <input
                  type="color"
                  value={strokeColor.startsWith("#") ? strokeColor : COLORS[strokeColor] || "#1e293b"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStrokeColor(val);
                    updateSelectedStyle("strokeColor", val);
                  }}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none p-0 bg-transparent"
                  title="Color Personalizado"
                />
              </div>
              <input
                type="text"
                value={strokeColor.startsWith("#") ? strokeColor : COLORS[strokeColor] || "#1e293b"}
                onChange={(e) => {
                  const val = e.target.value;
                  setStrokeColor(val);
                  updateSelectedStyle("strokeColor", val);
                }}
                placeholder="#HEX..."
                className="flex-1 px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Arrow Type & Routing Controls (Recta, Esquina 90°, Curva) */}
        {(tool === "arrow" || selectedElementType === "arrow") && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
              Tipo / Trazado de Flecha
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 mb-3">
              {[
                { id: "straight", name: "Directa" },
                { id: "elbow", name: "Esquina (90°)" },
                { id: "curved", name: "Curva" },
              ].map((typeObj) => (
                <button
                  key={typeObj.id}
                  onClick={() => {
                    if (setArrowType) setArrowType(typeObj.id);
                    updateSelectedStyle("arrowType", typeObj.id);
                  }}
                  className={`btn-draw py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    (arrowType || "straight") === typeObj.id
                      ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {typeObj.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Arrowhead Size Controls (Pequeña, Mediana, Grande) */}
        {(tool === "arrow" || selectedElementType === "arrow") && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
              Tamaño de Punta (Cabezal)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
              {[
                { id: "small", name: "Pequeña" },
                { id: "medium", name: "Mediana" },
                { id: "large", name: "Grande" },
              ].map((sizeObj) => (
                <button
                  key={sizeObj.id}
                  onClick={() => {
                    if (setArrowHeadSize) setArrowHeadSize(sizeObj.id);
                    updateSelectedStyle("arrowHeadSize", sizeObj.id);
                  }}
                  className={`btn-draw py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    (arrowHeadSize || "medium") === sizeObj.id
                      ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {sizeObj.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fill Style & Color Picker (for shapes like rect, circle, diamond, triangle, text box) */}
        {(isShapeTool || (hasSelection && !isConnectorTool)) && (
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
              Estilo de Relleno
            </label>

            <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 mb-2">
              {[
                { id: "none", name: "Transparente" },
                { id: "solid", name: "Sólido" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setFillStyle(style.id);
                    updateSelectedStyle("fillStyle", style.id);
                  }}
                  className={`btn-draw flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    fillStyle === style.id
                      ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>

            {fillStyle !== "none" && (
              <>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(COLORS).map(([name, hex]) => (
                    <button
                      key={name}
                      onClick={() => {
                        setFillColor(name);
                        updateSelectedStyle("fillColor", name);
                      }}
                      className={`w-7 h-7 rounded-xl transition-all duration-150 cursor-pointer ${
                        fillColor === name ? "ring-2 ring-purple-600 ring-offset-2 scale-110 shadow-md" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex }}
                      title={name}
                    />
                  ))}
                </div>
                {/* Custom Fill Color Input */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={fillColor.startsWith("#") ? fillColor : COLORS[fillColor] || "#8b5cf6"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFillColor(val);
                        updateSelectedStyle("fillColor", val);
                      }}
                      className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none p-0 bg-transparent"
                      title="Color de Relleno Personalizado"
                    />
                  </div>
                  <input
                    type="text"
                    value={fillColor.startsWith("#") ? fillColor : COLORS[fillColor] || "#8b5cf6"}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFillColor(val);
                      updateSelectedStyle("fillColor", val);
                    }}
                    placeholder="#HEX..."
                    className="flex-1 px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Text Customization Controls */}
        {isTextMode && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                Fuente del Texto
              </label>
              <div className="grid grid-cols-4 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                {[
                  { id: "arial", name: "Arial" },
                  { id: "hand", name: "Boceto" },
                  { id: "mono", name: "Mono" },
                  { id: "serif", name: "Serif" },
                ].map((font) => (
                  <button
                    key={font.id}
                    onClick={() => {
                      setFontFamily(font.id);
                      updateSelectedStyle("fontFamily", font.id);
                    }}
                    className={`btn-draw py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      fontFamily === font.id
                        ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">
                  Tamaño de Letra (px)
                </label>
                <input
                  type="number"
                  min="10"
                  max="140"
                  value={fontSize}
                  onChange={(e) => {
                    const val = Math.max(10, Math.min(140, Number(e.target.value) || 24));
                    setFontSize(val);
                    updateSelectedStyle("fontSize", val);
                  }}
                  className="w-12 text-center text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg py-0.5 text-purple-700 focus:outline-none"
                />
              </div>

              <input
                type="range"
                min="12"
                max="96"
                step="2"
                value={fontSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFontSize(val);
                  updateSelectedStyle("fontSize", val);
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-2"
              />

              <div className="grid grid-cols-5 gap-1">
                {[14, 18, 24, 32, 48].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setFontSize(size);
                      updateSelectedStyle("fontSize", size);
                    }}
                    className={`btn-draw py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      fontSize === size
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                Alineación del Texto
              </label>
              <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                {[
                  { id: "left", icon: AlignLeft, label: "Izquierda" },
                  { id: "center", icon: AlignCenter, label: "Centro" },
                  { id: "right", icon: AlignRight, label: "Derecha" },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSel = textAlign === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTextAlign(item.id);
                        updateSelectedStyle("textAlign", item.id);
                      }}
                      title={item.label}
                      className={`btn-draw flex-1 text-center py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                        isSel
                          ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      <IconComp size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Stroke Width & Line Style Controls */}
        {tool !== "hand" && tool !== "eraser" && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                Grosor del Trazo
              </label>
              <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                {[
                  { val: 2, name: "Fino" },
                  { val: 4, name: "Medio" },
                  { val: 7, name: "Grueso" },
                ].map((thick) => (
                  <button
                    key={thick.val}
                    onClick={() => {
                      setStrokeWidth(thick.val);
                      updateSelectedStyle("strokeWidth", thick.val);
                    }}
                    className={`btn-draw flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      strokeWidth === thick.val
                        ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {thick.name}
                  </button>
                ))}
              </div>
            </div>

            {tool !== "freedraw" && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">
                  Tipo de Línea
                </label>
                <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
                  {[
                    { id: "solid", name: "Sólido" },
                    { id: "dashed", name: "Guiones" },
                    { id: "dotted", name: "Puntos" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setStrokeStyle(style.id);
                        updateSelectedStyle("strokeStyle", style.id);
                      }}
                      className={`btn-draw flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        strokeStyle === style.id
                          ? "bg-white text-purple-700 shadow-sm font-bold border border-purple-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                Imprecisión (Boceto)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.5"
                  value={roughness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setRoughness(val);
                    updateSelectedStyle("roughness", val);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="text-xs font-bold text-slate-500 w-6 text-right">{roughness}x</span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
