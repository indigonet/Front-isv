import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import iOneTechLogo from "../assets/iOneTech.png";
import CanvasToolbar from "./components/CanvasToolbar";
import StyleSidebar from "./components/StyleSidebar";
import { ICON_LIBRARY, ICON_CATEGORIES } from "./constants/iconLibrary";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Upload,
  Share2,
  Check,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  BringToFront,
  SendToBack,
  Shapes,
  Square,
  Circle,
  Triangle,
  Diamond,
  Sparkles,
  X,
  Search,
  CheckCircle2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Group,
  Ungroup,
  RotateCw,
  Move,
  Target,
  Eye,
  EyeOff,
} from "lucide-react";

// Helper to accurately compute text bounding box dimensions based on font size and lines
const computeTextDimensions = (text, fontSize, fontFamily) => {
  const lines = (text || "").split("\n");
  const maxChars = Math.max(...lines.map((l) => l.length), 1);
  const multiplier = fontFamily === "mono" ? 0.6 : fontFamily === "sans" ? 0.55 : fontFamily === "serif" ? 0.54 : 0.52;
  const width = Math.max(40, Math.round(maxChars * (fontSize * multiplier) + 16));
  const height = Math.max(Math.round(fontSize * 1.3), Math.round(lines.length * (fontSize * 1.35)));
  return { width, height };
};

// Helper to compute exact bounding box for any element (rectangle, circle, line, freedraw, text, custom icon, triangle)
const getElementBounds = (el) => {
  if (!el) return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };

  if (el.type === "freedraw" && el.points && el.points.length > 0) {
    const xs = el.points.map((p) => p.x);
    const ys = el.points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { minX, maxX, minY, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }

  if (el.type === "line" || el.type === "arrow") {
    const minX = Math.min(el.x, el.x + el.width);
    const maxX = Math.max(el.x, el.x + el.width);
    const minY = Math.min(el.y, el.y + el.height);
    const maxY = Math.max(el.y, el.y + el.height);
    return { minX, maxX, minY, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }

  if (el.type === "custom-icon") {
    const rawW = Math.max(16, Math.abs(el.width || 64));
    const rawH = Math.max(16, Math.abs(el.height || 64));
    const size = Math.min(rawW, rawH);
    const offsetX = (rawW - size) / 2;
    const offsetY = (rawH - size) / 2;
    const minX = el.x + offsetX;
    const minY = el.y + offsetY;
    return { minX, maxX: minX + size, minY, maxY: minY + size, width: size, height: size };
  }

  const w = el.width || 0;
  const h = el.height || 0;
  const minX = Math.min(el.x, el.x + w);
  const maxX = Math.max(el.x, el.x + w);
  const minY = Math.min(el.y, el.y + h);
  const maxY = Math.max(el.y, el.y + h);
  return { minX, maxX, minY, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

// Helper to compute overall bounding box for a group of elements
const getGroupBounds = (elementsList) => {
  if (!elementsList || elementsList.length === 0) return null;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  elementsList.forEach((el) => {
    const b = getElementBounds(el);
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxY > maxY) maxY = b.maxY;
  });

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(10, maxX - minX),
    height: Math.max(10, maxY - minY),
  };
};

// --- SKETCHY MATH FUNCTIONS (Rough.js emulation) ---

const getOffset = (roughness, amount = 1.5) => {
  return (Math.random() - 0.5) * amount * roughness;
};

// Generates a sketchy line path string
const sketchLine = (x1, y1, x2, y2, roughness = 1) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 3) return `M ${x1} ${y1} L ${x2} ${y2}`;

  const dx = (x2 - x1) / len;
  const dy = (y2 - y1) / len;
  const overshoot = 0;

  const mx1 = (x1 + x2) / 2 + getOffset(roughness, 2) - dy * getOffset(roughness, 2);
  const my1 = (y1 + y2) / 2 + getOffset(roughness, 2) + dx * getOffset(roughness, 2);

  const mx2 = (x1 + x2) / 2 + getOffset(roughness, 2) + dy * getOffset(roughness, 2);
  const my2 = (y1 + y2) / 2 + getOffset(roughness, 2) - dx * getOffset(roughness, 2);

  const x1_1 = x1 - dx * overshoot + getOffset(roughness, 1.5);
  const y1_1 = y1 - dy * overshoot + getOffset(roughness, 1.5);
  const x2_1 = x2 + dx * overshoot + getOffset(roughness, 1.5);
  const y2_1 = y2 + dy * overshoot + getOffset(roughness, 1.5);

  const x1_2 = x1 - dx * overshoot + getOffset(roughness, 1.5);
  const y1_2 = y1 - dy * overshoot + getOffset(roughness, 1.5);
  const x2_2 = x2 + dx * overshoot + getOffset(roughness, 1.5);
  const y2_2 = y2 + dy * overshoot + getOffset(roughness, 1.5);

  return `M ${x1_1} ${y1_1} Q ${mx1} ${my1} ${x2_1} ${y2_1} M ${x1_2} ${y1_2} Q ${mx2} ${my2} ${x2_2} ${y2_2}`;
};

// Generates a sketchy rectangle path string
const sketchRect = (x, y, w, h, roughness = 1) => {
  return `${sketchLine(x, y, x + w, y, roughness)} ` +
         `${sketchLine(x + w, y, x + w, y + h, roughness)} ` +
         `${sketchLine(x + w, y + h, x, y + h, roughness)} ` +
         `${sketchLine(x, y + h, x, y, roughness)}`;
};

// Generates a sketchy diamond path string
const sketchDiamond = (x, y, w, h, roughness = 1) => {
  const top = { x: x + w / 2, y: y };
  const right = { x: x + w, y: y + h / 2 };
  const bottom = { x: x + w / 2, y: y + h };
  const left = { x: x, y: y + h / 2 };

  return `${sketchLine(top.x, top.y, right.x, right.y, roughness)} ` +
         `${sketchLine(right.x, right.y, bottom.x, bottom.y, roughness)} ` +
         `${sketchLine(bottom.x, bottom.y, left.x, left.y, roughness)} ` +
         `${sketchLine(left.x, left.y, top.x, top.y, roughness)}`;
};

// Generates a sketchy triangle path string
const sketchTriangle = (x, y, w, h, roughness = 1) => {
  const top = { x: x + w / 2, y: y };
  const right = { x: x + w, y: y + h };
  const left = { x: x, y: y + h };

  return `${sketchLine(top.x, top.y, right.x, right.y, roughness)} ` +
         `${sketchLine(right.x, right.y, left.x, left.y, roughness)} ` +
         `${sketchLine(left.x, left.y, top.x, top.y, roughness)}`;
};


// Generates a sketchy ellipse path string
const sketchEllipse = (x, y, w, h, roughness = 1) => {
  const rx = w / 2;
  const ry = h / 2;
  const cx = x + rx;
  const cy = y + ry;
  const numPoints = 64;

  const generatePath = (angleOffset = 0) => {
    let path = "";
    for (let i = 0; i <= numPoints + 1; i++) {
      const angle = (i / numPoints) * Math.PI * 2 + angleOffset;
      const rOffsetLimit = Math.min(1.5, rx * 0.15);
      const rOffset = (Math.random() - 0.5) * rOffsetLimit * roughness;
      const currRx = rx + rOffset;
      const currRy = ry + (Math.random() - 0.5) * Math.min(1.5, ry * 0.15) * roughness;
      
      const px = cx + Math.cos(angle) * currRx;
      const py = cy + Math.sin(angle) * currRy;

      if (i === 0) {
        path += `M ${px} ${py}`;
      } else {
        path += ` L ${px} ${py}`;
      }
    }
    return path;
  };

  return `${generatePath(0)} ${generatePath(0.1)}`;
};

// Generates a sketchy partial arc path string
const sketchArc = (x, y, w, h, startAngle, endAngle, roughness = 1) => {
  const rx = w / 2;
  const ry = h / 2;
  const cx = x + rx;
  const cy = y + ry;
  const numPoints = 32;

  const generatePath = (angleOffset = 0) => {
    let path = "";
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const angle = startAngle + t * (endAngle - startAngle) + angleOffset;
      const rOffsetLimit = Math.min(1.5, rx * 0.15);
      const rOffset = (Math.random() - 0.5) * rOffsetLimit * roughness;
      const currRx = rx + rOffset;
      const currRy = ry + (Math.random() - 0.5) * Math.min(1.5, ry * 0.15) * roughness;

      const px = cx + Math.cos(angle) * currRx;
      const py = cy + Math.sin(angle) * currRy;

      if (i === 0) {
        path += `M ${px} ${py}`;
      } else {
        path += ` L ${px} ${py}`;
      }
    }
    return path;
  };

  return `${generatePath(0)} ${generatePath(0.1)}`;
};

// Generates sketchy custom icons (20 icons)
const sketchCustomIcon = (x, y, w, h, iconName, roughness = 1) => {
  if (iconName === "database") {
    const topLid = sketchEllipse(x, y, w, h * 0.25, roughness);
    const midLid = sketchArc(x, y + h * 0.35, w, h * 0.25, 0, Math.PI, roughness);
    const bottomLid = sketchArc(x, y + h * 0.7, w, h * 0.25, 0, Math.PI, roughness);
    const leftWall = sketchLine(x, y + h * 0.125, x, y + h * 0.825, roughness);
    const rightWall = sketchLine(x + w, y + h * 0.125, x + w, y + h * 0.825, roughness);
    return `${topLid} ${midLid} ${bottomLid} ${leftWall} ${rightWall}`;
  }
  
  if (iconName === "server") {
    const box1 = sketchRect(x, y, w, h * 0.25, roughness);
    const btn1 = sketchEllipse(x + w * 0.12, y + h * 0.085, w * 0.08, h * 0.08, roughness);
    const line1_1 = sketchLine(x + w * 0.28, y + h * 0.085, x + w * 0.85, y + h * 0.085, roughness);
    const line1_2 = sketchLine(x + w * 0.28, y + h * 0.165, x + w * 0.85, y + h * 0.165, roughness);
    
    const box2 = sketchRect(x, y + h * 0.35, w, h * 0.25, roughness);
    const btn2 = sketchEllipse(x + w * 0.12, y + h * 0.435, w * 0.08, h * 0.08, roughness);
    const line2_1 = sketchLine(x + w * 0.28, y + h * 0.435, x + w * 0.85, y + h * 0.435, roughness);
    const line2_2 = sketchLine(x + w * 0.28, y + h * 0.515, x + w * 0.85, y + h * 0.515, roughness);
    
    const box3 = sketchRect(x, y + h * 0.7, w, h * 0.25, roughness);
    const btn3 = sketchEllipse(x + w * 0.12, y + h * 0.785, w * 0.08, h * 0.08, roughness);
    const line3_1 = sketchLine(x + w * 0.28, y + h * 0.785, x + w * 0.85, y + h * 0.785, roughness);
    const line3_2 = sketchLine(x + w * 0.28, y + h * 0.865, x + w * 0.85, y + h * 0.865, roughness);
    
    return `${box1} ${btn1} ${line1_1} ${line1_2} ${box2} ${btn2} ${line2_1} ${line2_2} ${box3} ${btn3} ${line3_1} ${line3_2}`;
  }
  
  if (iconName === "cloud") {
    const generateCloud = (offset = 0) => {
      const o = offset;
      return `M ${x + w * 0.25 + o} ${y + h * 0.68 + o} ` +
             `C ${x + w * 0.05 + o} ${y + h * 0.62 + o}, ${x + w * 0.05 + o} ${y + h * 0.32 + o}, ${x + w * 0.3 + o} ${y + h * 0.35 + o} ` +
             `C ${x + w * 0.3 + o} ${y + h * 0.12 + o}, ${x + w * 0.7 + o} ${y + h * 0.12 + o}, ${x + w * 0.7 + o} ${y + h * 0.35 + o} ` +
             `C ${x + w * 0.95 + o} ${y + h * 0.32 + o}, ${x + w * 0.95 + o} ${y + h * 0.62 + o}, ${x + w * 0.75 + o} ${y + h * 0.68 + o} ` +
             `C ${x + w * 0.65 + o} ${y + h * 0.76 + o}, ${x + w * 0.35 + o} ${y + h * 0.76 + o}, ${x + w * 0.25 + o} ${y + h * 0.68 + o} Z`;
    };
    return `${generateCloud(0)} ${generateCloud(1 * roughness)}`;
  }
  
  if (iconName === "user") {
    const head = sketchEllipse(x + w * 0.3, y, w * 0.4, h * 0.4, roughness);
    const neck1 = sketchLine(x + w * 0.45, y + h * 0.4, x + w * 0.45, y + h * 0.55, roughness);
    const neck2 = sketchLine(x + w * 0.55, y + h * 0.4, x + w * 0.55, y + h * 0.55, roughness);
    const generateShoulders = (offset = 0) => {
      const o = offset;
      return `M ${x + w * 0.15 + o} ${y + h + o} ` +
             `C ${x + w * 0.15 + o} ${y + h * 0.55 + o}, ${x + w * 0.85 + o} ${y + h * 0.55 + o}, ${x + w * 0.85 + o} ${y + h + o}`;
    };
    const shoulders = `${generateShoulders(0)} ${generateShoulders(0.8 * roughness)}`;
    return `${head} ${neck1} ${neck2} ${shoulders}`;
  }

  if (iconName === "users") {
    const user1 = sketchCustomIcon(x, y + h * 0.1, w * 0.65, h * 0.85, "user", roughness);
    const user2 = sketchCustomIcon(x + w * 0.35, y, w * 0.65, h * 0.85, "user", roughness);
    return `${user1} ${user2}`;
  }
  
  if (iconName === "laptop") {
    const screen = sketchRect(x + w * 0.1, y, w * 0.8, h * 0.6, roughness);
    const base = sketchLine(x, y + h * 0.75, x + w, y + h * 0.75, roughness);
    const slantL = sketchLine(x + w * 0.1, y + h * 0.6, x, y + h * 0.75, roughness);
    const slantR = sketchLine(x + w * 0.9, y + h * 0.6, x + w, y + h * 0.75, roughness);
    const thickBase = sketchLine(x, y + h * 0.8, x + w, y + h * 0.8, roughness);
    const thickL = sketchLine(x, y + h * 0.75, x, y + h * 0.8, roughness);
    const thickR = sketchLine(x + w, y + h * 0.75, x + w, y + h * 0.8, roughness);
    return `${screen} ${base} ${slantL} ${slantR} ${thickBase} ${thickL} ${thickR}`;
  }
  
  if (iconName === "mobile") {
    const frame = sketchRect(x + w * 0.2, y, w * 0.6, h, roughness);
    const screen = sketchRect(x + w * 0.24, y + h * 0.08, w * 0.52, h * 0.8, roughness);
    const home = sketchEllipse(x + w * 0.46, y + h * 0.92, w * 0.08, h * 0.04, roughness);
    return `${frame} ${screen} ${home}`;
  }

  if (iconName === "tablet") {
    const frame = sketchRect(x + w * 0.1, y, w * 0.8, h, roughness);
    const screen = sketchRect(x + w * 0.15, y + h * 0.06, w * 0.7, h * 0.88, roughness);
    return `${frame} ${screen}`;
  }

  if (iconName === "pos") {
    const slot = sketchRect(x + w * 0.3, y, w * 0.4, h * 0.15, roughness);
    const paper = sketchLine(x + w * 0.35, y + h * 0.05, x + w * 0.65, y + h * 0.05, roughness);
    const body = sketchRect(x + w * 0.1, y + h * 0.15, w * 0.8, h * 0.8, roughness);
    const screen = sketchRect(x + w * 0.2, y + h * 0.25, w * 0.6, h * 0.3, roughness);
    const key1 = sketchLine(x + w * 0.25, y + h * 0.65, x + w * 0.75, y + h * 0.65, roughness);
    const key2 = sketchLine(x + w * 0.25, y + h * 0.78, x + w * 0.75, y + h * 0.78, roughness);
    return `${slot} ${paper} ${body} ${screen} ${key1} ${key2}`;
  }

  if (iconName === "card") {
    const cardRect = sketchRect(x, y + h * 0.15, w, h * 0.7, roughness);
    const magStripe = sketchRect(x, y + h * 0.3, w, h * 0.15, roughness);
    const chip = sketchRect(x + w * 0.15, y + h * 0.55, w * 0.2, h * 0.2, roughness);
    return `${cardRect} ${magStripe} ${chip}`;
  }

  if (iconName === "qrcode") {
    const outer = sketchRect(x, y, w, h, roughness);
    const sq1 = sketchRect(x + w * 0.1, y + h * 0.1, w * 0.25, h * 0.25, roughness);
    const sq2 = sketchRect(x + w * 0.65, y + h * 0.1, w * 0.25, h * 0.25, roughness);
    const sq3 = sketchRect(x + w * 0.1, y + h * 0.65, w * 0.25, h * 0.25, roughness);
    const dot = sketchRect(x + w * 0.45, y + h * 0.45, w * 0.2, h * 0.2, roughness);
    return `${outer} ${sq1} ${sq2} ${sq3} ${dot}`;
  }

  if (iconName === "store") {
    const roofL1 = sketchLine(x, y + h * 0.3, x + w * 0.5, y, roughness);
    const roofL2 = sketchLine(x + w * 0.5, y, x + w, y + h * 0.3, roughness);
    const roofBase = sketchLine(x, y + h * 0.3, x + w, y + h * 0.3, roughness);
    const body = sketchRect(x + w * 0.1, y + h * 0.3, w * 0.8, h * 0.7, roughness);
    const door = sketchRect(x + w * 0.38, y + h * 0.55, w * 0.24, h * 0.45, roughness);
    return `${roofL1} ${roofL2} ${roofBase} ${body} ${door}`;
  }

  if (iconName === "printer") {
    const topPaper = sketchRect(x + w * 0.2, y, w * 0.6, h * 0.3, roughness);
    const body = sketchRect(x, y + h * 0.3, w, h * 0.45, roughness);
    const bottomPaper = sketchRect(x + w * 0.25, y + h * 0.75, w * 0.5, h * 0.25, roughness);
    const line = sketchLine(x + w * 0.3, y + h * 0.85, x + w * 0.7, y + h * 0.85, roughness);
    return `${topPaper} ${body} ${bottomPaper} ${line}`;
  }

  if (iconName === "cart") {
    const handle = sketchLine(x, y + h * 0.2, x + w * 0.2, y + h * 0.2, roughness);
    const back = sketchLine(x + w * 0.2, y + h * 0.2, x + w * 0.3, y + h * 0.65, roughness);
    const bottom = sketchLine(x + w * 0.3, y + h * 0.65, x + w * 0.8, y + h * 0.65, roughness);
    const front = sketchLine(x + w * 0.85, y + h * 0.2, x + w * 0.8, y + h * 0.65, roughness);
    const topBasket = sketchLine(x + w * 0.2, y + h * 0.2, x + w * 0.85, y + h * 0.2, roughness);
    const wheel1 = sketchEllipse(x + w * 0.35, y + h * 0.75, w * 0.15, h * 0.15, roughness);
    const wheel2 = sketchEllipse(x + w * 0.7, y + h * 0.75, w * 0.15, h * 0.15, roughness);
    return `${handle} ${back} ${bottom} ${front} ${topBasket} ${wheel1} ${wheel2}`;
  }

  if (iconName === "cpu") {
    const chip = sketchRect(x + w * 0.2, y + h * 0.2, w * 0.6, h * 0.6, roughness);
    const inner = sketchRect(x + w * 0.35, y + h * 0.35, w * 0.3, h * 0.3, roughness);
    const pTop1 = sketchLine(x + w * 0.35, y, x + w * 0.35, y + h * 0.2, roughness);
    const pTop2 = sketchLine(x + w * 0.65, y, x + w * 0.65, y + h * 0.2, roughness);
    const pBot1 = sketchLine(x + w * 0.35, y + h * 0.8, x + w * 0.35, y + h, roughness);
    const pBot2 = sketchLine(x + w * 0.65, y + h * 0.8, x + w * 0.65, y + h, roughness);
    const pLeft1 = sketchLine(x, y + h * 0.35, x + w * 0.2, y + h * 0.35, roughness);
    const pLeft2 = sketchLine(x, y + h * 0.65, x + w * 0.2, y + h * 0.65, roughness);
    const pRight1 = sketchLine(x + w * 0.8, y + h * 0.35, x + w, y + h * 0.35, roughness);
    const pRight2 = sketchLine(x + w * 0.8, y + h * 0.65, x + w, y + h * 0.65, roughness);
    return `${chip} ${inner} ${pTop1} ${pTop2} ${pBot1} ${pBot2} ${pLeft1} ${pLeft2} ${pRight1} ${pRight2}`;
  }

  if (iconName === "globe") {
    const circle = sketchEllipse(x, y, w, h, roughness);
    const equator = sketchLine(x, y + h * 0.5, x + w, y + h * 0.5, roughness);
    const meridian = sketchEllipse(x + w * 0.25, y, w * 0.5, h, roughness);
    return `${circle} ${equator} ${meridian}`;
  }

  if (iconName === "wifi") {
    const dot = sketchEllipse(x + w * 0.42, y + h * 0.8, w * 0.16, h * 0.16, roughness);
    const arc1 = sketchArc(x + w * 0.3, y + h * 0.55, w * 0.4, h * 0.4, -Math.PI * 0.8, -Math.PI * 0.2, roughness);
    const arc2 = sketchArc(x + w * 0.15, y + h * 0.3, w * 0.7, h * 0.7, -Math.PI * 0.8, -Math.PI * 0.2, roughness);
    const arc3 = sketchArc(x, y + h * 0.05, w, h * 0.9, -Math.PI * 0.8, -Math.PI * 0.2, roughness);
    return `${dot} ${arc1} ${arc2} ${arc3}`;
  }

  if (iconName === "file") {
    const p1 = sketchLine(x, y, x + w * 0.65, y, roughness);
    const p2 = sketchLine(x + w * 0.65, y, x + w, y + h * 0.35, roughness);
    const p3 = sketchLine(x + w, y + h * 0.35, x + w, y + h, roughness);
    const p4 = sketchLine(x + w, y + h, x, y + h, roughness);
    const p5 = sketchLine(x, y + h, x, y, roughness);
    const fold1 = sketchLine(x + w * 0.65, y, x + w * 0.65, y + h * 0.35, roughness);
    const fold2 = sketchLine(x + w * 0.65, y + h * 0.35, x + w, y + h * 0.35, roughness);
    const l1 = sketchLine(x + w * 0.2, y + h * 0.55, x + w * 0.8, y + h * 0.55, roughness);
    const l2 = sketchLine(x + w * 0.2, y + h * 0.75, x + w * 0.65, y + h * 0.75, roughness);
    return `${p1} ${p2} ${p3} ${p4} ${p5} ${fold1} ${fold2} ${l1} ${l2}`;
  }

  if (iconName === "lock") {
    const body = sketchRect(x + w * 0.1, y + h * 0.4, w * 0.8, h * 0.6, roughness);
    const shackle = sketchArc(x + w * 0.25, y, w * 0.5, h * 0.65, Math.PI, 0, roughness);
    const keyhole = sketchEllipse(x + w * 0.42, y + h * 0.6, w * 0.16, h * 0.2, roughness);
    return `${body} ${shackle} ${keyhole}`;
  }

  if (iconName === "shield") {
    const topL = sketchLine(x + w * 0.1, y + h * 0.1, x + w * 0.9, y + h * 0.1, roughness);
    const sideL = sketchLine(x + w * 0.1, y + h * 0.1, x + w * 0.1, y + h * 0.5, roughness);
    const sideR = sketchLine(x + w * 0.9, y + h * 0.1, x + w * 0.9, y + h * 0.5, roughness);
    const botL = sketchLine(x + w * 0.1, y + h * 0.5, x + w * 0.5, y + h, roughness);
    const botR = sketchLine(x + w * 0.9, y + h * 0.5, x + w * 0.5, y + h, roughness);
    const centerL = sketchLine(x + w * 0.5, y + h * 0.2, x + w * 0.5, y + h * 0.85, roughness);
    return `${topL} ${sideL} ${sideR} ${botL} ${botR} ${centerL}`;
  }
  
  return "";
};

// Generates a bold, prominent, large arrow path string
const sketchArrow = (x1, y1, x2, y2, roughness = 1) => {
  const linePath = sketchLine(x1, y1, x2, y2, roughness);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 28; // Prominent large arrowhead length (was 16)
  const arrowAngle = Math.PI / 5.5; // 32 degrees sharp arrowhead angle

  const xLeft = x2 - arrowLength * Math.cos(angle - arrowAngle);
  const yLeft = y2 - arrowLength * Math.sin(angle - arrowAngle);
  const xRight = x2 - arrowLength * Math.cos(angle + arrowAngle);
  const yRight = y2 - arrowLength * Math.sin(angle + arrowAngle);

  const leftPath = sketchLine(x2, y2, xLeft, yLeft, roughness * 0.8);
  const rightPath = sketchLine(x2, y2, xRight, yRight, roughness * 0.8);

  return `${linePath} ${leftPath} ${rightPath}`;
};

// Color palettes for sketchy styling
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

export default function DrawableView() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Canvas State
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tool, setTool] = useState("select");

  // Style Settings
  const [strokeColor, setStrokeColor] = useState("black");
  const [fillColor, setFillColor] = useState("transparent");
  const [fillStyle, setFillStyle] = useState("none");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState("solid");
  const [fontFamily, setFontFamily] = useState("arial");
  const [fontSize, setFontSize] = useState(24);
  const [textAlign, setTextAlign] = useState("left");
  const [roughness, setRoughness] = useState(1);

  // Interaction & UI State
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [activeElement, setActiveElement] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [groupStartBounds, setGroupStartBounds] = useState(null);
  const [selectionMarquee, setSelectionMarquee] = useState(null);
  const [editingTextId, setEditingTextId] = useState(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeLibraryIcon, setActiveLibraryIcon] = useState("cloud");
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);
  const [isShapeDropdownOpen, setIsShapeDropdownOpen] = useState(false);
  const [iconCategory, setIconCategory] = useState("all");
  const [iconSearch, setIconSearch] = useState("");
  const [isZenMode, setIsZenMode] = useState(false);

  // Reset tool styling parameters back to standard pristine defaults when switching tools
  const resetDefaultStyles = () => {
    setStrokeWidth(2);
    setStrokeColor("#1e293b");
    setFillColor("transparent");
    setFillStyle("none");
    setRoughness(1);
    setFontFamily("arial");
    setFontSize(24);
    setTextAlign("left");
  };

  // Persistence, Auto-Save & Toast State
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [lastSavedTime, setLastSavedTime] = useState("");
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [hoverCoords, setHoverCoords] = useState(null);

  const svgRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Toast Helper
  const showToast = (message, type = "info", duration = 4000) => {
    setToast({ visible: true, message, type });
    if (duration > 0) {
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, duration);
    }
  };

  // Load font & restore state from URL param or LocalStorage on mount
  useEffect(() => {
    const linkId = "font-architects-daughter";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap";
      document.head.appendChild(link);
    }

    // Check URL share parameter
    const fullUrl = window.location.href;
    let sharedData = null;

    if (fullUrl.includes("share=")) {
      try {
        const match = fullUrl.match(/share=([^&#]+)/);
        if (match && match[1]) {
          sharedData = decodeURIComponent(match[1]);
        }
      } catch (e) {
        console.error("Failed to parse share URL param", e);
      }
    }

    if (sharedData) {
      try {
        const decodedJson = decodeURIComponent(escape(atob(sharedData)));
        const parsed = JSON.parse(decodedJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          const nowIso = new Date().toISOString();
          localStorage.setItem("isv_whiteboard_elements", JSON.stringify(parsed));
          localStorage.setItem("isv_whiteboard_last_saved", nowIso);
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          showToast(`✨ Proyecto compartido cargado con éxito (${parsed.length} elementos)`, "success", 5000);

          const cleanUrl = window.location.pathname + window.location.search.replace(/[?&]share=[^&]+/, "");
          window.history.replaceState(null, "", cleanUrl || "/drawable");
          return;
        }
      } catch (err) {
        console.error("Failed to decode shared diagram data", err);
      }
    }

    // LocalStorage fallback
    const saved = localStorage.getItem("isv_whiteboard_elements");
    const lastSaved = localStorage.getItem("isv_whiteboard_last_saved");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
          const formattedTime = lastSaved
            ? new Date(lastSaved).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastSavedTime(formattedTime);
          showToast(
            `📥 Proyecto guardado cargado automáticamente (${parsed.length} elemento${parsed.length !== 1 ? "s" : ""})`,
            "info",
            4000
          );
        } else {
          showToast("🎨 Lienzo nuevo listo para diagramar", "info", 3000);
        }
      } catch (e) {
        console.error("Failed to restore elements from local storage", e);
      }
    } else {
      showToast("🎨 Lienzo nuevo listo para diagramar", "info", 3000);
    }
  }, []);

  // Sync & Auto-save to LocalStorage on element change
  const updateElementsAndHistory = (newElements) => {
    setElements(newElements);
    setAutoSaveStatus("saving");

    const nowIso = new Date().toISOString();
    const formattedTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    localStorage.setItem("isv_whiteboard_elements", JSON.stringify(newElements));
    localStorage.setItem("isv_whiteboard_last_saved", nowIso);

    setTimeout(() => {
      setAutoSaveStatus("saved");
      setLastSavedTime(formattedTime);
    }, 300);

    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, newElements]);
    setHistoryIndex(nextHistory.length);
  };

  // Keep selected values in sync with sidebar if an element is selected
  useEffect(() => {
    if (selectedIds.length === 1) {
      const el = elements.find((e) => e.id === selectedIds[0]);
      if (el) {
        setStrokeColor(el.strokeColor || "black");
        setFillColor(el.fillColor || "transparent");
        setFillStyle(el.fillStyle || "none");
        setStrokeWidth(el.strokeWidth || 2);
        setStrokeStyle(el.strokeStyle || "solid");
        setFontFamily(el.fontFamily || "hand");
        setFontSize(el.fontSize || 24);
        setTextAlign(el.textAlign || "left");
        setRoughness(el.roughness || 1);
      }
    }
  }, [selectedIds, elements]);

  // Apply style updates to selected elements (auto recalculating dimensions for text)
  const updateSelectedStyle = (key, value) => {
    if (selectedIds.length > 0) {
      const updated = elements.map((el) => {
        if (selectedIds.includes(el.id)) {
          const next = { ...el, [key]: value };
          if (next.type === "text" && (key === "fontSize" || key === "fontFamily" || key === "text" || key === "textAlign")) {
            const dims = computeTextDimensions(next.text, next.fontSize, next.fontFamily);
            next.width = dims.width;
            next.height = dims.height;
          }
          return next;
        }
        return el;
      });
      updateElementsAndHistory(updated);
    }
  };

  // Screen coordinates to SVG viewport coordinates conversion
  const getCanvasCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (editingTextId || isShareModalOpen || activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) {
          const remaining = elements.filter((el) => !selectedIds.includes(el.id));
          updateElementsAndHistory(remaining);
          setSelectedIds([]);
        }
      } else if (cmdCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (cmdCtrl && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        handleRedo();
      } else if (cmdCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedIds(elements.map((el) => el.id));
      } else if (cmdCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedIds.length > 0) {
          const duplicated = [];
          const updatedElements = [...elements];
          selectedIds.forEach((id) => {
            const original = elements.find((el) => el.id === id);
            if (original) {
              const copy = {
                ...original,
                id: `elem-${Date.now()}-${Math.random()}`,
                x: original.x + 20,
                y: original.y + 20,
              };
              duplicated.push(copy);
              updatedElements.push(copy);
            }
          });
          updateElementsAndHistory(updatedElements);
          setSelectedIds(duplicated.map((el) => el.id));
        }
      } else if (e.key === "Escape") {
        setSelectedIds([]);
        setActiveElement(null);
        setSelectionMarquee(null);
        setIsDrawing(false);
        setIsLibraryDropdownOpen(false);
        setIsZenMode(false);
      } else {
        switch (e.key.toLowerCase()) {
          case "v": setTool("select"); break;
          case "h": setTool("hand"); break;
          case "r": setTool("rectangle"); break;
          case "d": setTool("diamond"); break;
          case "o": setTool("ellipse"); break;
          case "a": setTool("arrow"); break;
          case "l": setTool("line"); break;
          case "p": setTool("freedraw"); break;
          case "t": setTool("text"); break;
          case "e": setTool("eraser"); break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [elements, selectedIds, editingTextId, historyIndex, history, isShareModalOpen]);

  // Undo / Redo mechanics
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setElements(history[prevIndex]);
      setHistoryIndex(prevIndex);
      setSelectedIds([]);
      localStorage.setItem("isv_whiteboard_elements", JSON.stringify(history[prevIndex]));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setElements(history[nextIndex]);
      setHistoryIndex(nextIndex);
      setSelectedIds([]);
      localStorage.setItem("isv_whiteboard_elements", JSON.stringify(history[nextIndex]));
    }
  };

  const handleClear = () => {
    if (window.confirm("¿Seguro que deseas limpiar todo el lienzo?")) {
      updateElementsAndHistory([]);
      setSelectedIds([]);
      showToast("Lienzo limpiado completamente", "info");
    }
  };

  const bringToFront = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const reordered = [...unselected, ...selected];
    updateElementsAndHistory(reordered);
    setSelectedIds(selected.map((el) => el.id));
    showToast("⬆️ Traído al frente", "info", 1500);
  };

  const sendToBack = () => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const unselected = elements.filter((el) => !selectedIds.includes(el.id));
    const reordered = [...selected, ...unselected];
    updateElementsAndHistory(reordered);
    setSelectedIds(selected.map((el) => el.id));
    showToast("⬇️ Enviado al fondo", "info", 1500);
  };

  // Group / Ungroup Elements
  const handleGroupToggle = () => {
    if (selectedIds.length === 0) return;

    const selectedEls = elements.filter((el) => selectedIds.includes(el.id));
    const firstGroupId = selectedEls[0]?.groupId;

    // Check if ALL selected elements belong to the exact same existing group
    const isSingleFullyGrouped =
      firstGroupId && selectedEls.every((el) => el.groupId === firstGroupId);

    if (isSingleFullyGrouped) {
      // Ungroup
      const updated = elements.map((el) => {
        if (el.groupId === firstGroupId || selectedIds.includes(el.id)) {
          const { groupId, ...clean } = el;
          return clean;
        }
        return el;
      });
      updateElementsAndHistory(updated);
      showToast("🔓 Elementos desagrupados", "info");
    } else if (selectedIds.length >= 2) {
      // Group all selected elements into a new unified group
      const newGroupId = `group-${Date.now()}`;
      const updated = elements.map((el) => {
        if (selectedIds.includes(el.id)) {
          return { ...el, groupId: newGroupId };
        }
        return el;
      });
      updateElementsAndHistory(updated);
      showToast(`🧩 ${selectedIds.length} elementos agrupados`, "success");
    }
  };

  // Rotate Selection (+45 degrees)
  const handleRotateSelection = () => {
    if (selectedIds.length === 0) return;

    const selectedEls = elements.filter((el) => selectedIds.includes(el.id));
    const gBounds = getGroupBounds(selectedEls);
    const centerX = (gBounds.minX + gBounds.maxX) / 2;
    const centerY = (gBounds.minY + gBounds.maxY) / 2;
    const angle = 45;
    const rad = (angle * Math.PI) / 180;

    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        if (selectedIds.length === 1) {
          const nextRot = ((el.rotation || 0) + angle) % 360;
          return { ...el, rotation: nextRot };
        } else {
          const b = getElementBounds(el);
          const elCx = (b.minX + b.maxX) / 2;
          const elCy = (b.minY + b.maxY) / 2;

          const dx = elCx - centerX;
          const dy = elCy - centerY;

          const newCx = centerX + dx * Math.cos(rad) - dy * Math.sin(rad);
          const newCy = centerY + dx * Math.sin(rad) + dy * Math.cos(rad);

          const shiftX = newCx - elCx;
          const shiftY = newCy - elCy;
          const nextRot = ((el.rotation || 0) + angle) % 360;

          if (el.type === "freedraw" && el.points) {
            const newPoints = el.points.map((p) => {
              const pdx = p.x - centerX;
              const pdy = p.y - centerY;
              return {
                x: centerX + pdx * Math.cos(rad) - pdy * Math.sin(rad),
                y: centerY + pdx * Math.sin(rad) + pdy * Math.cos(rad),
              };
            });
            return { ...el, points: newPoints, rotation: nextRot };
          }

          return {
            ...el,
            x: el.x + shiftX,
            y: el.y + shiftY,
            rotation: nextRot,
          };
        }
      }
      return el;
    });

    updateElementsAndHistory(updated);
    showToast("🔄 Selección rotada 45°", "info");
  };

  // Free Move / Lock Toggle
  const handleToggleFreeMove = () => {
    if (selectedIds.length === 0) return;

    const selectedEls = elements.filter((el) => selectedIds.includes(el.id));
    const anyLocked = selectedEls.some((el) => el.isLocked);
    const newLockState = !anyLocked;

    const updated = elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return { ...el, isLocked: newLockState };
      }
      return el;
    });

    updateElementsAndHistory(updated);
    showToast(
      newLockState ? "🔒 Posición bloqueada" : "✋ Modo Mover Libremente activo",
      newLockState ? "warning" : "success"
    );
  };

  // Generate Shareable Link
  const generateShareUrl = () => {
    try {
      const jsonStr = JSON.stringify(elements);
      const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#share=${encodeURIComponent(encodedData)}`;
    } catch (e) {
      console.error("Failed to generate share URL", e);
      return window.location.href;
    }
  };

  const handleCopyShareLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setIsLinkCopied(true);
    showToast("¡Enlace de proyecto copiado al portapapeles!", "success");
    setTimeout(() => setIsLinkCopied(false), 3000);
  };

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify({ version: "isv-whiteboard-v1", elements }, null, 2);
    navigator.clipboard.writeText(jsonStr);
    showToast("¡Configuración JSON copiada al portapapeles!", "success");
  };



  // Double Click Handler (Only edit existing text, never insert text on empty canvas double-click)
  const handleDoubleClick = (e) => {
    const { x, y } = getCanvasCoords(e);

    const clickedText = [...elements].reverse().find(
      (el) => el.type === "text" && isPointInElement(x, y, el)
    );

    if (clickedText) {
      setSelectedIds([clickedText.id]);
      setEditingTextId(clickedText.id);
      setTextInputValue(clickedText.text);
      setTimeout(() => {
        if (textInputRef.current) textInputRef.current.focus();
      }, 50);
      return;
    }
  };

  // Mouse pointer down handler on SVG
  const handlePointerDown = (e) => {
    if (editingTextId) {
      saveTextEdit();
      return;
    }

    const { x, y } = getCanvasCoords(e);

    if (tool === "hand" || e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    if (selectedIds.length > 0 && tool === "select") {
      const selectedEls = elements.filter((e) => selectedIds.includes(e.id));
      if (selectedEls.length > 0) {
        let gBounds = null;
        if (selectedEls.length === 1) {
          const b = getElementBounds(selectedEls[0]);
          gBounds = { minX: b.minX, maxX: b.maxX, minY: b.minY, maxY: b.maxY, width: b.width, height: b.height };
        } else {
          gBounds = getGroupBounds(selectedEls);
        }

        const singleRot = selectedEls.length === 1 ? (selectedEls[0].rotation || 0) : 0;
        const handle = findGroupResizeHandle(x, y, gBounds, singleRot);
        if (handle) {
          setResizeHandle(handle);
          setIsDrawing(true);
          setStartMouse({ x, y });
          setGroupStartBounds(gBounds);
          setElements(
            elements.map((e) => {
              if (selectedIds.includes(e.id)) {
                const b = getElementBounds(e);
                return {
                  ...e,
                  startResizeX: e.x,
                  startResizeY: e.y,
                  startResizeWidth: e.width || b.width,
                  startResizeHeight: e.height || b.height,
                  startResizeFontSize: e.fontSize || 24,
                  startResizePoints: e.points ? e.points.map((p) => ({ ...p })) : null,
                };
              }
              return e;
            })
          );
          return;
        }
      }
    }

    setIsDrawing(true);
    setStartMouse({ x, y });

    if (tool === "select") {
      const candidateEls = elements.filter((el) => isPointInElement(x, y, el));
      let clickedElement = null;
      if (candidateEls.length > 0) {
        // Sort candidate elements by distance from click (x,y) to element center for pixel-perfect precision when icons are close together
        candidateEls.sort((a, b) => {
          const bA = getElementBounds(a);
          const bB = getElementBounds(b);
          const distA = Math.hypot(x - (bA.minX + bA.maxX) / 2, y - (bA.minY + bA.maxY) / 2);
          const distB = Math.hypot(x - (bB.minX + bB.maxX) / 2, y - (bB.minY + bB.maxY) / 2);
          return distA - distB;
        });
        clickedElement = candidateEls[0];
      }

      if (clickedElement) {
        let targetIds = [clickedElement.id];

        // Group member expansion: select entire group together if element belongs to a group
        if (clickedElement.groupId) {
          const members = elements.filter((el) => el.groupId === clickedElement.groupId).map((el) => el.id);
          if (members.length > 0) targetIds = members;
        }

        let newSelectedIds = selectedIds;
        if (e.shiftKey) {
          if (targetIds.every((id) => selectedIds.includes(id))) {
            newSelectedIds = selectedIds.filter((id) => !targetIds.includes(id));
          } else {
            newSelectedIds = [...new Set([...selectedIds, ...targetIds])];
          }
        } else {
          if (!targetIds.some((id) => selectedIds.includes(id))) {
            newSelectedIds = targetIds;
          }
        }
        setSelectedIds(newSelectedIds);

        const anyLocked = elements.filter((el) => newSelectedIds.includes(el.id)).some((el) => el.isLocked);
        if (!anyLocked) {
          setElements(
            elements.map((el) => {
              if (newSelectedIds.includes(el.id)) {
                return {
                  ...el,
                  startDragX: el.x,
                  startDragY: el.y,
                  startDragPoints: el.points ? el.points.map((pt) => ({ ...pt })) : null,
                };
              }
              return el;
            })
          );
        }
      } else {
        setSelectedIds([]);
        setSelectionMarquee({ x1: x, y1: y, x2: x, y2: y });
      }
    } else if (tool === "eraser") {
      setIsDrawing(true);
      const remaining = elements.filter((el) => !isPointInElement(x, y, el));
      if (remaining.length !== elements.length) {
        updateElementsAndHistory(remaining);
        showToast("🧹 Elemento borrado", "info", 1200);
      }
    } else if (tool === "text") {
      const defaultWidth = 180;
      const defaultHeight = Math.max(40, fontSize * 1.5);
      const newText = {
        id: `elem-${Date.now()}`,
        type: "text",
        x,
        y,
        width: defaultWidth,
        height: defaultHeight,
        text: "",
        strokeColor,
        fillColor: "transparent",
        fontFamily,
        fontSize,
        textAlign,
        opacity: 1,
      };
      setActiveElement(newText);
    } else {
      const defaultIconWidth = tool === "custom-icon" ? 64 : 0;
      const defaultIconHeight = tool === "custom-icon" ? 64 : 0;

      const newEl = {
        id: `elem-${Date.now()}`,
        type: tool,
        x,
        y,
        width: defaultIconWidth,
        height: defaultIconHeight,
        strokeColor,
        fillColor,
        fillStyle,
        strokeWidth,
        strokeStyle,
        fontFamily,
        fontSize,
        textAlign,
        roughness,
        opacity: 1,
        points: tool === "freedraw" ? [{ x, y }] : [],
        ...(tool === "custom-icon" ? { iconName: activeLibraryIcon } : {}),
      };
      setActiveElement(newEl);
    }
  };

  // Mouse move handler
  const handlePointerMove = (e) => {
    const { x, y } = getCanvasCoords(e);

    if (tool === "eraser") {
      setHoverCoords({ x, y });
      if (isDrawing) {
        setElements((prev) => {
          const remaining = prev.filter((el) => !isPointInElement(x, y, el));
          if (remaining.length !== prev.length) {
            localStorage.setItem("isv_whiteboard_elements", JSON.stringify(remaining));
            return remaining;
          }
          return prev;
        });
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
      return;
    }

    if (!isDrawing) {
      if (tool === "text" || tool === "eraser") {
        setHoverCoords({ x, y });
      }
      return;
    }

    const dx = x - startMouse.x;
    const dy = y - startMouse.y;

    if (resizeHandle && selectedIds.length > 0) {
      if (resizeHandle === "rotate") {
        const selectedEls = elements.filter((e) => selectedIds.includes(e.id));
        const g = getGroupBounds(selectedEls);
        const cx = (g.minX + g.maxX) / 2;
        const cy = (g.minY + g.maxY) / 2;
        const angleRad = Math.atan2(y - cy, x - cx);
        let angleDeg = Math.round(angleRad * (180 / Math.PI) + 90);
        if (angleDeg < 0) angleDeg += 360;
        if (e.shiftKey) angleDeg = Math.round(angleDeg / 15) * 15;

        const updated = elements.map((el) => {
          if (selectedIds.includes(el.id)) {
            return {
              ...el,
              rotation: angleDeg,
            };
          }
          return el;
        });
        setElements(updated);
        return;
      }

      if (selectedIds.length === 1) {
        const el = elements.find((e) => e.id === selectedIds[0]);
        if (!el) return;

        const updated = { ...el };

        const sX = el.startResizeX !== undefined ? el.startResizeX : el.x;
        const sY = el.startResizeY !== undefined ? el.startResizeY : el.y;
        const sW = el.startResizeWidth !== undefined ? el.startResizeWidth : el.width;
        const sH = el.startResizeHeight !== undefined ? el.startResizeHeight : el.height;

        if (el.type === "line" || el.type === "arrow") {
          if (resizeHandle === "start") {
            updated.x = x;
            updated.y = y;
            updated.width = sX + sW - x;
            updated.height = sY + sH - y;
          } else {
            updated.width = x - sX;
            updated.height = y - sY;
          }
        } else if (el.rotation) {
          // --- ACCURATE ROTATED RESIZING (Center-Anchored Matrix Scaling) ---
          const rad = (el.rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          // Project screen mouse displacement onto local rotated element axes:
          const dU = dx * cos + dy * sin;
          const dV = -dx * sin + dy * cos;

          let targetW = sW;
          let targetH = sH;

          if (resizeHandle.includes("e")) targetW = Math.max(16, sW + dU);
          if (resizeHandle.includes("w")) targetW = Math.max(16, sW - dU);
          if (resizeHandle.includes("s")) targetH = Math.max(16, sH + dV);
          if (resizeHandle.includes("n")) targetH = Math.max(16, sH - dV);

          if (el.type === "custom-icon" || el.type === "image") {
            const scale = Math.max(targetW / Math.max(1, sW), targetH / Math.max(1, sH));
            targetW = Math.max(16, Math.round(sW * scale));
            targetH = Math.max(16, Math.round(sH * scale));
          } else if (el.type === "text") {
            const sFS = el.startResizeFontSize || el.fontSize || 24;
            const scale = Math.max(targetW / Math.max(1, sW), targetH / Math.max(1, sH));
            const nextFS = Math.max(10, Math.min(140, Math.round(sFS * scale)));
            const dims = computeTextDimensions(el.text, nextFS, el.fontFamily);
            updated.fontSize = nextFS;
            targetW = dims.width;
            targetH = dims.height;
          }

          updated.width = targetW;
          updated.height = targetH;

          const dW = targetW - sW;
          const dH = targetH - sH;

          const shiftU = resizeHandle.includes("e") ? dW / 2 : resizeHandle.includes("w") ? -dW / 2 : 0;
          const shiftV = resizeHandle.includes("s") ? dH / 2 : resizeHandle.includes("n") ? -dH / 2 : 0;

          const initialCx = sX + sW / 2;
          const initialCy = sY + sH / 2;

          const newCx = initialCx + shiftU * cos - shiftV * sin;
          const newCy = initialCy + shiftU * sin + shiftV * cos;

          updated.x = newCx - targetW / 2;
          updated.y = newCy - targetH / 2;
        } else if (el.type === "custom-icon" || el.type === "image") {
          // Proportional Icon, Symbol & Image scaling for maximum crispness
          let nextW = sW;
          let nextH = sH;
          if (resizeHandle.includes("e")) nextW = Math.max(16, sW + dx);
          if (resizeHandle.includes("s")) nextH = Math.max(16, sH + dy);
          if (resizeHandle.includes("w")) nextW = Math.max(16, sW - dx);
          if (resizeHandle.includes("n")) nextH = Math.max(16, sH - dy);

          const scale = Math.max(nextW / Math.max(1, sW), nextH / Math.max(1, sH));
          const finalW = Math.max(16, Math.round(sW * scale));
          const finalH = Math.max(16, Math.round(sH * scale));

          updated.width = finalW;
          updated.height = finalH;

          if (resizeHandle.includes("w")) updated.x = sX + (sW - finalW);
          if (resizeHandle.includes("n")) updated.y = sY + (sH - finalH);
        } else if (el.type === "text") {
          // Dynamic Proportional Scaling for Text Elements
          const sFS = el.startResizeFontSize || el.fontSize || 24;
          let nextWidth = sW;
          let nextHeight = sH;

          if (resizeHandle.includes("e")) nextWidth = Math.max(20, sW + dx);
          if (resizeHandle.includes("s")) nextHeight = Math.max(20, sH + dy);
          if (resizeHandle.includes("w")) nextWidth = Math.max(20, sW - dx);
          if (resizeHandle.includes("n")) nextHeight = Math.max(20, sH - dy);

          const scaleX = nextWidth / Math.max(1, sW);
          const scaleY = nextHeight / Math.max(1, sH);
          const scale = Math.max(scaleX, scaleY);

          const nextFontSize = Math.max(10, Math.min(140, Math.round(sFS * scale)));
          const dims = computeTextDimensions(el.text, nextFontSize, el.fontFamily);

          updated.fontSize = nextFontSize;
          updated.width = dims.width;
          updated.height = dims.height;

          if (resizeHandle.includes("w")) updated.x = sX + (sW - dims.width);
          if (resizeHandle.includes("n")) updated.y = sY + (sH - dims.height);
        } else {
          if (resizeHandle.includes("e")) {
            updated.width = Math.max(10, sW + dx);
          }
          if (resizeHandle.includes("s")) {
            updated.height = Math.max(10, sH + dy);
          }
          if (resizeHandle.includes("w")) {
            const nextW = Math.max(10, sW - dx);
            if (nextW > 10) {
              updated.x = sX + dx;
              updated.width = nextW;
            }
          }
          if (resizeHandle.includes("n")) {
            const nextH = Math.max(10, sH - dy);
            if (nextH > 10) {
              updated.y = sY + dy;
              updated.height = nextH;
            }
          }
        }

        setElements(elements.map((e) => (e.id === el.id ? updated : e)));
        return;
      } else if (groupStartBounds) {
        // Multi-Selection Group Resizing
        const g = groupStartBounds;
        let nextGW = g.width;
        let nextGH = g.height;

        if (resizeHandle.includes("e")) nextGW = Math.max(30, g.width + dx);
        if (resizeHandle.includes("s")) nextGH = Math.max(30, g.height + dy);
        if (resizeHandle.includes("w")) nextGW = Math.max(30, g.width - dx);
        if (resizeHandle.includes("n")) nextGH = Math.max(30, g.height - dy);

        const scaleX = nextGW / Math.max(1, g.width);
        const scaleY = nextGH / Math.max(1, g.height);
        const scale = Math.max(scaleX, scaleY);

        const updated = elements.map((el) => {
          if (selectedIds.includes(el.id)) {
            const sX = el.startResizeX !== undefined ? el.startResizeX : el.x;
            const sY = el.startResizeY !== undefined ? el.startResizeY : el.y;
            const sW = el.startResizeWidth !== undefined ? el.startResizeWidth : el.width;
            const sH = el.startResizeHeight !== undefined ? el.startResizeHeight : el.height;

            let newX = g.minX + (sX - g.minX) * scaleX;
            let newY = g.minY + (sY - g.minY) * scaleY;
            if (resizeHandle.includes("w")) newX += (g.width - nextGW);
            if (resizeHandle.includes("n")) newY += (g.height - nextGH);

            const newW = Math.round(sW * scaleX);
            const newH = Math.round(sH * scaleY);

            const nextEl = {
              ...el,
              x: newX,
              y: newY,
              width: newW,
              height: newH,
            };

            if (el.type === "text") {
              const sFS = el.startResizeFontSize || 24;
              const nextFS = Math.max(10, Math.min(140, Math.round(sFS * scale)));
              const dims = computeTextDimensions(el.text, nextFS, el.fontFamily);
              nextEl.fontSize = nextFS;
              nextEl.width = dims.width;
              nextEl.height = dims.height;
            }

            if (el.type === "freedraw" && el.startResizePoints) {
              nextEl.points = el.startResizePoints.map((pt) => ({
                x: g.minX + (pt.x - g.minX) * scaleX + (resizeHandle.includes("w") ? g.width - nextGW : 0),
                y: g.minY + (pt.y - g.minY) * scaleY + (resizeHandle.includes("n") ? g.height - nextGH : 0),
              }));
            }

            return nextEl;
          }
          return el;
        });

        setElements(updated);
        return;
      }
    }

    if (tool === "select") {
      if (selectionMarquee) {
        setSelectionMarquee({
          ...selectionMarquee,
          x2: x,
          y2: y,
        });
      } else if (selectedIds.length > 0) {
        const updated = elements.map((el) => {
          if (selectedIds.includes(el.id) && el.startDragX !== undefined) {
            if (el.type === "freedraw" && el.startDragPoints) {
              const movedPoints = el.startDragPoints.map((pt) => ({
                x: pt.x + dx,
                y: pt.y + dy,
              }));
              return {
                ...el,
                x: el.startDragX + dx,
                y: el.startDragY + dy,
                points: movedPoints,
              };
            }
            return {
              ...el,
              x: el.startDragX + dx,
              y: el.startDragY + dy,
            };
          }
          return el;
        });
        setElements(updated);
      }
    } else if (activeElement) {
      const updated = { ...activeElement };
      if (tool === "freedraw") {
        updated.points = [...updated.points, { x, y }];
      } else if (tool === "text") {
        const dragW = Math.abs(x - startMouse.x);
        const dragH = Math.abs(y - startMouse.y);
        if (dragW > 10 || dragH > 10) {
          updated.x = Math.min(x, startMouse.x);
          updated.y = Math.min(y, startMouse.y);
          updated.width = Math.max(100, dragW);
          updated.height = Math.max(35, dragH);
        }
      } else {
        updated.width = tool === "custom-icon" ? Math.max(24, Math.abs(dx)) : dx;
        updated.height = tool === "custom-icon" ? Math.max(24, Math.abs(dy)) : dy;
      }
      setActiveElement(updated);
    }
  };

  // Mouse up handler
  const handlePointerUp = () => {
    setIsPanning(false);

    if (!isDrawing) return;
    setIsDrawing(false);
    setResizeHandle(null);

    if (selectionMarquee) {
      const xMin = Math.min(selectionMarquee.x1, selectionMarquee.x2);
      const xMax = Math.max(selectionMarquee.x1, selectionMarquee.x2);
      const yMin = Math.min(selectionMarquee.y1, selectionMarquee.y2);
      const yMax = Math.max(selectionMarquee.y1, selectionMarquee.y2);

      const inMarquee = elements.filter((el) => {
        const b = getElementBounds(el);
        return b.maxX >= xMin && b.minX <= xMax && b.maxY >= yMin && b.minY <= yMax;
      });

      setSelectedIds(inMarquee.map((el) => el.id));
      setSelectionMarquee(null);
      return;
    }

    if (tool === "select" && selectedIds.length > 0) {
      const updated = elements.map((el) => {
        const {
          startDragX,
          startDragY,
          startDragPoints,
          startResizeX,
          startResizeY,
          startResizeWidth,
          startResizeHeight,
          startResizeFontSize,
          ...clean
        } = el;
        return clean;
      });
      updateElementsAndHistory(updated);
      return;
    }

    if (activeElement) {
      let finalElement = { ...activeElement };

      if (
        finalElement.type !== "line" &&
        finalElement.type !== "arrow" &&
        finalElement.type !== "freedraw"
      ) {
        if (finalElement.width < 0) {
          finalElement.x += finalElement.width;
          finalElement.width = Math.abs(finalElement.width);
        }
        if (finalElement.height < 0) {
          finalElement.y += finalElement.height;
          finalElement.height = Math.abs(finalElement.height);
        }
      }

      if (
        finalElement.type !== "freedraw" &&
        Math.abs(finalElement.width) < 5 &&
        Math.abs(finalElement.height) < 5
      ) {
        setActiveElement(null);
        return;
      }

      const nextElements = [...elements, finalElement];
      updateElementsAndHistory(nextElements);
      setActiveElement(null);
      if (finalElement.type === "text") {
        setEditingTextId(finalElement.id);
        setTextInputValue("");
        setSelectedIds([finalElement.id]);
        setTool("select");
        setIsSidebarOpen(true);
        setTimeout(() => {
          if (textInputRef.current) textInputRef.current.focus();
        }, 50);
      } else {
        // Automatically select newly placed shape/element and display contour handles for instant sizing & modification
        setSelectedIds([finalElement.id]);
        setTool("select");
        setIsSidebarOpen(true);
        showToast("✨ Forma lista — ajusta su tamaño, estilo o rotación", "info", 2500);
      }
    }
  };

  // Center View / Fit All Elements in View
  const handleCenterView = () => {
    if (elements.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      showToast("🎯 Lienzo centrado", "info");
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      const b = getElementBounds(el);
      if (b.minX < minX) minX = b.minX;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxY > maxY) maxY = b.maxY;
    });

    const contentWidth = Math.max(100, maxX - minX);
    const contentHeight = Math.max(100, maxY - minY);

    const padding = 140;
    const viewWidth = window.innerWidth - padding;
    const viewHeight = window.innerHeight - padding;

    const scaleX = viewWidth / contentWidth;
    const scaleY = viewHeight / contentHeight;
    const targetZoom = Math.min(2, Math.max(0.2, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetPanX = window.innerWidth / 2 - centerX * targetZoom;
    const targetPanY = window.innerHeight / 2 - centerY * targetZoom;

    setZoom(Number(targetZoom.toFixed(2)));
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    showToast("🎯 Vista centrada en tu trabajo", "success");
  };

  // Zoom controls (Focal zoom centered on screen/cursor, preventing bottom-right drift)
  const handleZoom = (type, centerCoords = null) => {
    const focusX = centerCoords?.x ?? window.innerWidth / 2;
    const focusY = centerCoords?.y ?? window.innerHeight / 2;

    setZoom((prevZoom) => {
      let nextZoom = prevZoom;
      if (type === "in") nextZoom = Math.min(prevZoom * 1.25, 8);
      else if (type === "out") nextZoom = Math.max(prevZoom / 1.25, 0.15);
      else {
        setPan({ x: 0, y: 0 });
        return 1;
      }

      if (Math.abs(nextZoom - prevZoom) < 0.001) return prevZoom;

      const scaleRatio = nextZoom / prevZoom;
      setPan((prevPan) => ({
        x: focusX - (focusX - prevPan.x) * scaleRatio,
        y: focusY - (focusY - prevPan.y) * scaleRatio,
      }));

      return nextZoom;
    });
  };

  // Silky-smooth Excalidraw / Figma style canvas navigation:
  // - Ctrl / Cmd + Scroll or Touchpad Pinch: Exponential smooth centered zoom without dizziness
  // - Normal Scroll: Pan canvas up/down (or left/right with Shift)
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const onWheel = (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Smooth Centered Zoom Mode
        const rect = svgEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomSensitivity = 0.0015;
        const delta = -e.deltaY;
        const scaleFactor = Math.exp(delta * zoomSensitivity);

        setZoom((prevZoom) => {
          const nextZoom = Math.min(8, Math.max(0.15, prevZoom * scaleFactor));
          if (Math.abs(nextZoom - prevZoom) < 0.0001) return prevZoom;

          const scaleRatio = nextZoom / prevZoom;

          setPan((prevPan) => ({
            x: mouseX - (mouseX - prevPan.x) * scaleRatio,
            y: mouseY - (mouseY - prevPan.y) * scaleRatio,
          }));

          return nextZoom;
        });
      } else {
        // Pan Mode (Excalidraw 2D Scroll)
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        const dy = e.shiftKey ? 0 : e.deltaY;

        setPan((prevPan) => ({
          x: prevPan.x - dx,
          y: prevPan.y - dy,
        }));
      }
    };

    svgEl.addEventListener("wheel", onWheel, { passive: false });
    return () => svgEl.removeEventListener("wheel", onWheel);
  }, []);

  // Text inputs editing with auto dimension calculation and automatic post-edit selection
  const saveTextEdit = () => {
    if (!editingTextId) return;

    const updated = elements
      .map((el) => {
        if (el.id === editingTextId) {
          const dims = computeTextDimensions(textInputValue, el.fontSize, el.fontFamily);
          return {
            ...el,
            text: textInputValue,
            width: dims.width,
            height: dims.height,
          };
        }
        return el;
      })
      .filter((el) => el.type !== "text" || el.text.trim() !== "");

    updateElementsAndHistory(updated);
    if (textInputValue.trim() !== "") {
      setSelectedIds([editingTextId]);
    }
    setEditingTextId(null);
    setTextInputValue("");
  };

  // Element hit calculations for selection with rotation awareness and zoom-adaptive margin
  const isPointInElement = (x, y, el) => {
    let testX = x;
    let testY = y;
    const b = getElementBounds(el);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;

    if (el.rotation) {
      const rad = (-el.rotation * Math.PI) / 180;
      const dx = x - cx;
      const dy = y - cy;
      testX = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
      testY = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
    }

    const margin = Math.max(8, 14 / zoom);
    const xMin = b.minX;
    const xMax = b.maxX;
    const yMin = b.minY;
    const yMax = b.maxY;

    if (
      el.type === "rectangle" ||
      el.type === "ellipse" ||
      el.type === "diamond" ||
      el.type === "triangle" ||
      el.type === "custom-icon" ||
      el.type === "image" ||
      el.type === "text"
    ) {
      return testX >= xMin - margin && testX <= xMax + margin && testY >= yMin - margin && testY <= yMax + margin;
    }

    if (el.type === "line" || el.type === "arrow") {
      const x2 = el.x + el.width;
      const y2 = el.y + el.height;
      const l2 = Math.pow(x2 - el.x, 2) + Math.pow(y2 - el.y, 2);
      if (l2 === 0) return Math.hypot(testX - el.x, testY - el.y) < margin;

      let t = ((testX - el.x) * (x2 - el.x) + (testY - el.y) * (y2 - el.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = el.x + t * (x2 - el.x);
      const projY = el.y + t * (y2 - el.y);

      return Math.hypot(testX - projX, testY - projY) < margin;
    }

    if (el.type === "freedraw" && el.points) {
      return el.points.some((pt) => Math.hypot(testX - pt.x, testY - pt.y) < margin * 1.5);
    }

    return false;
  };

  // Find if click lands on a single element resize handle with high sensitivity and exact handle alignment
  const findResizeHandle = (x, y, el) => {
    if (!el) return null;
    const bounds = getElementBounds(el);
    const pad = 6;
    const left = bounds.minX - pad;
    const top = bounds.minY - pad;
    const right = bounds.maxX + pad;
    const bottom = bounds.maxY + pad;
    const centerX = (left + right) / 2;
    const rotYTop = top - 28 / zoom;
    const rotYBottom = bottom + 28 / zoom;
    const handleHitRadius = Math.max(16, 24 / zoom);

    if (Math.hypot(x - centerX, y - rotYTop) < handleHitRadius || Math.hypot(x - centerX, y - rotYBottom) < handleHitRadius) {
      return "rotate";
    }

    if (Math.hypot(x - left, y - top) < handleHitRadius) return "nw";
    if (Math.hypot(x - right, y - top) < handleHitRadius) return "ne";
    if (Math.hypot(x - right, y - bottom) < handleHitRadius) return "se";
    if (Math.hypot(x - left, y - bottom) < handleHitRadius) return "sw";

    return null;
  };

  // Find if click lands on a multi-selection group resize handle with high sensitivity and exact handle alignment
  const findGroupResizeHandle = (x, y, gBounds, rotation = 0) => {
    if (!gBounds) return null;
    const cx = (gBounds.minX + gBounds.maxX) / 2;
    const cy = (gBounds.minY + gBounds.maxY) / 2;

    let testX = x;
    let testY = y;
    if (rotation) {
      const rad = (-rotation * Math.PI) / 180;
      const dx = x - cx;
      const dy = y - cy;
      testX = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
      testY = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
    }

    const pad = 6;
    const left = gBounds.minX - pad;
    const top = gBounds.minY - pad;
    const right = gBounds.maxX + pad;
    const bottom = gBounds.maxY + pad;
    const rotYTop = top - 28 / zoom;
    const rotYBottom = bottom + 28 / zoom;
    const handleHitRadius = Math.max(16, 24 / zoom);

    if (Math.hypot(testX - cx, testY - rotYTop) < handleHitRadius || Math.hypot(testX - cx, testY - rotYBottom) < handleHitRadius) {
      return "rotate";
    }

    if (Math.hypot(testX - left, testY - top) < handleHitRadius) return "nw";
    if (Math.hypot(testX - right, testY - top) < handleHitRadius) return "ne";
    if (Math.hypot(testX - right, testY - bottom) < handleHitRadius) return "se";
    if (Math.hypot(testX - left, testY - bottom) < handleHitRadius) return "sw";

    return null;
  };

  // Image Upload Import Handler
  const handleImageImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      const img = new Image();
      img.onload = () => {
        let w = img.width || 200;
        let h = img.height || 200;
        const maxDim = 320;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvasCenterX = (-pan.x + window.innerWidth / 2) / zoom - w / 2;
        const canvasCenterY = (-pan.y + window.innerHeight / 2) / zoom - h / 2;

        const newImageEl = {
          id: `elem-${Date.now()}`,
          type: "image",
          src: dataUrl,
          x: Math.round(canvasCenterX),
          y: Math.round(canvasCenterY),
          width: w,
          height: h,
          opacity: 1,
        };

        updateElementsAndHistory([...elements, newImageEl]);
        setSelectedIds([newImageEl.id]);
        setTool("select");
        showToast("🖼️ Imagen importada al lienzo", "success");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Import / Export whiteboards
  const handleJSONExport = () => {
    const data = JSON.stringify({
      version: "isv-whiteboard-v1",
      elements,
    }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ISV-Whiteboard-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Archivo .json descargado exitosamente", "success");
  };

  const handleJSONImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.elements) {
          updateElementsAndHistory(data.elements);
          setSelectedIds([]);
          showToast(`Proyecto cargado desde JSON (${data.elements.length} elementos)`, "success");
        }
      } catch (e) {
        showToast("Archivo JSON inválido o corrupto", "warning");
      }
    };
    reader.readAsText(file);
  };

  const handleSVGExport = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgRef.current);
    
    const fontEmbed = `<style>@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&amp;display=swap'); text { font-family: 'Architects Daughter', cursive; }</style>`;
    svgString = svgString.replace("<defs>", `<defs>${fontEmbed}`);

    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `isv-diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Diagrama exportado como SVG vectorial", "success");
  };

  const handlePNGExport = () => {
    if (!svgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const rect = svgRef.current.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.fillStyle = darkMode ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgRef.current);
    const fontEmbed = `<style>@import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&amp;display=swap'); text { font-family: 'Architects Daughter', cursive; }</style>`;
    svgString = svgString.replace("<defs>", `<defs>${fontEmbed}`);

    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngURL = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = pngURL;
      downloadLink.download = `isv-diagram-${Date.now()}.png`;
      downloadLink.click();
      URLObject.revokeObjectURL(blobURL);
      showToast("Imagen PNG descargada con éxito", "success");
    };
    img.src = blobURL;
  };

  // Helper renderer for element shapes
  const renderElement = (el) => {
    const hex = COLORS[el.strokeColor] || el.strokeColor || "#000";
    const fillHex = el.fillStyle === "solid" ? COLORS[el.fillColor] || el.fillColor : "none";
    const hatchUrl = el.fillStyle === "hatch" ? `url(#hatch-${el.fillColor})` : "none";

    const styleProps = {
      stroke: hex,
      strokeWidth: el.strokeWidth,
      strokeDasharray: el.strokeStyle === "dashed" ? "10 6" : el.strokeStyle === "dotted" ? "2 6" : "none",
      opacity: el.opacity || 1,
      fill: fillHex !== "none" ? fillHex : hatchUrl,
      color: hex,
    };

    const b = getElementBounds(el);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const transform = el.rotation ? `rotate(${el.rotation}, ${cx}, ${cy})` : undefined;

    let pathD = "";
    if (el.type === "rectangle") pathD = sketchRect(el.x, el.y, el.width, el.height, el.roughness || roughness);
    else if (el.type === "diamond") pathD = sketchDiamond(el.x, el.y, el.width, el.height, el.roughness || roughness);
    else if (el.type === "ellipse") pathD = sketchEllipse(el.x, el.y, el.width, el.height, el.roughness || roughness);
    else if (el.type === "triangle") pathD = sketchTriangle(el.x, el.y, el.width, el.height, el.roughness || roughness);
    else if (el.type === "line") pathD = sketchLine(el.x, el.y, el.x + el.width, el.y + el.height, el.roughness || roughness);
    else if (el.type === "arrow") pathD = sketchArrow(el.x, el.y, el.x + el.width, el.y + el.height, el.roughness || roughness);
    else if (el.type === "custom-icon") {
      const iconObj = ICON_LIBRARY.find((i) => i.id === el.iconName) || ICON_LIBRARY[0];
      const IconComp = iconObj?.icon || Cloud;
      const strokeHex = COLORS[el.strokeColor] || el.strokeColor || "#1e293b";
      const fillHex = el.fillStyle === "solid" ? (COLORS[el.fillColor] || el.fillColor) : "transparent";
      const iconLineColor = (fillHex !== "transparent" && fillHex === strokeHex) ? "#ffffff" : strokeHex;

      const bounds = getElementBounds(el);

      return (
        <g key={el.id} transform={transform}>
          {/* Full 100% Solid Fill Container for Custom Icon */}
          {fillHex !== "transparent" && (
            <rect
              x={bounds.minX}
              y={bounds.minY}
              width={bounds.width}
              height={bounds.height}
              fill={fillHex}
              rx={bounds.width * 0.16}
              style={{ pointerEvents: "all", cursor: "pointer" }}
            />
          )}
          <foreignObject
            x={bounds.minX}
            y={bounds.minY}
            width={bounds.width}
            height={bounds.height}
            style={{ overflow: "visible", pointerEvents: "all", cursor: "pointer" }}
          >
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="w-full h-full flex items-center justify-center pointer-events-none p-1.5"
            >
              <IconComp
                size={bounds.width * 0.8}
                color={iconLineColor}
                fill={fillHex !== "transparent" ? fillHex : "none"}
                strokeWidth={el.strokeWidth || 2}
                style={{ width: "80%", height: "80%" }}
              />
            </div>
          </foreignObject>
        </g>
      );
    }
    else if (el.type === "freedraw") pathD = getFreeDrawPath(el.points);

    if (el.type === "image") {
      return (
        <g key={el.id} transform={transform}>
          <image
            href={el.src}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            preserveAspectRatio="none"
            opacity={el.opacity || 1}
            style={{ pointerEvents: "all", cursor: "pointer" }}
          />
        </g>
      );
    }

    if (el.type === "text") {
      // Hide SVG text representation when actively editing in overlay to prevent ghosting/double text
      if (editingTextId === el.id) return null;

      const font =
        el.fontFamily === "arial" || el.fontFamily === "sans" || !el.fontFamily
          ? "'Inter', system-ui, -apple-system, sans-serif"
          : el.fontFamily === "hand"
          ? "'Architects Daughter', 'Caveat', cursive"
          : el.fontFamily === "mono"
          ? "'Fira Code', 'Courier New', monospace"
          : el.fontFamily === "serif"
          ? "Georgia, 'Times New Roman', serif"
          : "'Inter', system-ui, sans-serif";

      const align = el.textAlign || "left";
      const anchor = align === "center" ? "middle" : align === "right" ? "end" : "start";
      const textX = align === "center" ? el.x + el.width / 2 : align === "right" ? el.x + el.width : el.x;

      return (
        <g
          key={el.id}
          transform={transform}
          onDoubleClick={() => {
            setSelectedIds([el.id]);
            setEditingTextId(el.id);
            setTextInputValue(el.text);
            setTimeout(() => {
              if (textInputRef.current) textInputRef.current.focus();
            }, 50);
          }}
        >
          {el.fillColor && el.fillColor !== "transparent" && (
            <rect
              x={el.x - 6}
              y={el.y - 6}
              width={el.width + 12}
              height={el.height + 12}
              fill={COLORS[el.fillColor] || el.fillColor}
              rx={10}
              opacity={0.3}
            />
          )}
          <text
            x={textX}
            y={el.y + el.fontSize * 0.88}
            fill={hex}
            fontSize={el.fontSize}
            fontFamily={font}
            fontWeight="600"
            textAnchor={anchor}
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", pointerEvents: "all", cursor: "pointer" }}
          >
            {el.text.split("\n").map((line, i) => (
              <tspan key={i} x={textX} dy={i === 0 ? 0 : el.fontSize * 1.35}>
                {line}
              </tspan>
            ))}
          </text>
        </g>
      );
    }

    const rx = Math.min(el.x, el.x + el.width);
    const ry = Math.min(el.y, el.y + el.height);
    const rw = Math.abs(el.width);
    const rh = Math.abs(el.height);

    return (
      <g key={el.id} transform={transform}>
        {/* Underlay SVG Fill Shape for Solid / Hatch Fill */}
        {fillHex !== "none" && (
          <>
            {el.type === "rectangle" && (
              <rect x={rx} y={ry} width={rw} height={rh} fill={fillHex} pointerEvents="all" />
            )}
            {el.type === "ellipse" && (
              <ellipse cx={rx + rw / 2} cy={ry + rh / 2} rx={rw / 2} ry={rh / 2} fill={fillHex} pointerEvents="all" />
            )}
            {el.type === "diamond" && (
              <polygon
                points={`${rx + rw / 2},${ry} ${rx + rw},${ry + rh / 2} ${rx + rw / 2},${ry + rh} ${rx},${ry + rh / 2}`}
                fill={fillHex}
                pointerEvents="all"
              />
            )}
            {el.type === "triangle" && (
              <polygon
                points={`${rx + rw / 2},${ry} ${rx + rw},${ry + rh} ${rx},${ry + rh}`}
                fill={fillHex}
                pointerEvents="all"
              />
            )}
          </>
        )}

        <path d={pathD} {...styleProps} fill={hatchUrl !== "none" ? hatchUrl : "none"} pointerEvents="stroke" />
        
        {(el.type === "line" || el.type === "arrow" || el.type === "freedraw") && (
          <path
            d={pathD}
            stroke="transparent"
            strokeWidth={15}
            fill="none"
            pointerEvents="stroke"
            style={{ cursor: tool === "select" ? "move" : "default" }}
          />
        )}
        
        {(el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond" || el.type === "triangle" || el.type === "custom-icon") && (
          <path
            d={pathD}
            fill="transparent"
            pointerEvents="all"
            style={{ cursor: tool === "select" ? "move" : "default" }}
          />
        )}
      </g>
    );
  };

  const getFreeDrawPath = (pts) => {
    if (!pts || pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  };

  const filteredIcons = ICON_LIBRARY.filter((item) => {
    const matchesCat = iconCategory === "all" || item.category === iconCategory;
    const matchesSearch = item.label.toLowerCase().includes(iconSearch.toLowerCase()) || item.id.includes(iconSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeIconObj = ICON_LIBRARY.find((item) => item.id === activeLibraryIcon) || ICON_LIBRARY[0];
  const ActiveIconComp = activeIconObj.icon;

  const isTextModeActive = tool === "text" || (selectedIds.length === 1 && elements.find((e) => e.id === selectedIds[0])?.type === "text");

  return (
    <div
      className={`relative w-full h-screen flex overflow-hidden select-none transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Floating Notification Toast Banner (Positioned at bottom-right above share bar) */}
      {toast.visible && (
        <div className="absolute bottom-20 right-4 z-50 px-4 py-2.5 backdrop-blur-md bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 dark:border-slate-300/50 text-xs font-semibold flex items-center gap-2.5 animate-fade-in transition-all">
          <span>{toast.message}</span>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="hover:opacity-75 cursor-pointer p-0.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-black"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Floating UI Overlays & Controls (Hidden in Zen Mode) */}
      {!isZenMode && (
        <>
          {/* Floating Back Arrow & Title */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              title="Volver"
              className="btn-draw p-2.5 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Real-time Auto-Save Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-lg text-xs font-medium text-slate-600 dark:text-slate-300">
              {autoSaveStatus === "saving" ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-purple-500" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Autoguardado</span>
                  {lastSavedTime && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      {lastSavedTime}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Large iOne Tech Watermark Logo in Top Right (No Background Box) */}
          <div className="absolute top-4 right-6 z-20 pointer-events-none select-none opacity-45 hover:opacity-85 transition-opacity">
            <img
              src={iOneTechLogo}
              alt="iOne Tech"
              className="h-10 sm:h-12 w-auto object-contain filter contrast-125 dark:brightness-125 drop-shadow-md"
            />
          </div>

          {/* Floating Whiteboard Settings Toolbar */}
          <CanvasToolbar
            tool={tool}
            setTool={setTool}
            setSelectedIds={setSelectedIds}
            setIsSidebarOpen={setIsSidebarOpen}
            activeIconObj={activeIconObj}
            isLibraryDropdownOpen={isLibraryDropdownOpen}
            setIsLibraryDropdownOpen={setIsLibraryDropdownOpen}
            isShapeDropdownOpen={isShapeDropdownOpen}
            setIsShapeDropdownOpen={setIsShapeDropdownOpen}
            imageInputRef={imageInputRef}
            undo={handleUndo}
            redo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            clearCanvas={handleClear}
            resetDefaultStyles={resetDefaultStyles}
          />

          {/* Floating Shape Dropdown Popover (Aligned directly under Formas button) */}
          {isShapeDropdownOpen && (
            <div className="absolute top-[76px] left-[calc(50%-140px)] -translate-x-1/2 z-40 p-2.5 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-1 w-52 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1">
                  <Shapes size={13} className="text-emerald-500" /> Formas Básicas
                </span>
                <button
                  onClick={() => setIsShapeDropdownOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
              {[
                { id: "rectangle", icon: Square, label: "Rectángulo (R)" },
                { id: "ellipse", icon: Circle, label: "Círculo (O)" },
                { id: "triangle", icon: Triangle, label: "Triángulo" },
                { id: "diamond", icon: Diamond, label: "Rombo (D)" },
              ].map((st) => {
                const ShapeIcon = st.icon;
                const isSel = tool === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setTool(st.id);
                      setSelectedIds([]);
                      resetDefaultStyles();
                      setIsShapeDropdownOpen(false);
                    }}
                    className={`btn-draw px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSel
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <ShapeIcon size={16} />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Floating Library Dropdown Popover (Aligned directly under Custom Icon button) */}
          {isLibraryDropdownOpen && tool === "custom-icon" && (
            <div className="absolute top-[76px] left-[calc(50%-80px)] -translate-x-1/2 z-40 w-84 sm:w-96 p-4 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-3 animate-fade-in max-h-[75vh] overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-300 flex items-center gap-1.5 font-extrabold">
                  <Sparkles size={15} className="text-purple-500" />
                  <span>Biblioteca de Iconos ({ICON_LIBRARY.length})</span>
                </div>
                <button
                  onClick={() => setIsLibraryDropdownOpen(false)}
                  className="p-1 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar icono..."
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/40 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 border-b border-slate-100 dark:border-slate-800">
                {ICON_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setIconCategory(cat.id)}
                    className={`btn-draw px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      iconCategory === cat.id
                        ? "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 font-bold"
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {filteredIcons.map((lib) => {
                  const LibIcon = lib.icon;
                  const isSel = activeLibraryIcon === lib.id;
                  return (
                    <button
                      key={lib.id}
                      onClick={() => {
                        setActiveLibraryIcon(lib.id);
                        setIsLibraryDropdownOpen(false);
                        if (resetDefaultStyles) resetDefaultStyles();
                      }}
                      title={lib.label}
                      className={`btn-draw p-2.5 rounded-xl transition-all duration-150 hover:scale-108 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSel
                          ? "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30 ring-2 ring-purple-500/20"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                      }`}
                    >
                      <LibIcon size={18} />
                      <span className="text-[10px] font-medium text-center leading-tight truncate w-full">
                        {lib.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dedicated Style Sidebar per Tool */}
          <StyleSidebar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            tool={tool}
            strokeColor={strokeColor}
            setStrokeColor={setStrokeColor}
            fillColor={fillColor}
            setFillColor={setFillColor}
            fillStyle={fillStyle}
            setFillStyle={setFillStyle}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeStyle={strokeStyle}
            setStrokeStyle={setStrokeStyle}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            roughness={roughness}
            setRoughness={setRoughness}
            updateSelectedStyle={updateSelectedStyle}
            bringToFront={bringToFront}
            sendToBack={sendToBack}
            hasSelection={selectedIds.length > 0}
            selectedElementType={selectedIds.length === 1 ? elements.find((e) => e.id === selectedIds[0])?.type : null}
            imageInputRef={imageInputRef}
            activeIconObj={activeIconObj}
            setIsLibraryDropdownOpen={setIsLibraryDropdownOpen}
            handleRotateSelection={handleRotateSelection}
            handleGroupToggle={handleGroupToggle}
            handleToggleFreeMove={handleToggleFreeMove}
            handleCenterView={handleCenterView}
          />

          {/* Floating Expand Sidebar Button */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              title="Mostrar Estilos"
              className="btn-draw absolute top-20 left-4 z-20 p-2.5 backdrop-blur-md bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center animate-fade-in"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Floating Canvas Save, Share & Export Control Panel */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 sm:p-2 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 max-w-[calc(100vw-1rem)]">
            <button
              onClick={() => setIsShareModalOpen(true)}
              title="Compartir enlace de proyecto"
              className="btn-draw inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Share2 size={15} />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Toggle Zen Presentation Mode (Clean Canvas View without HUD/UI) */}
            <button
              onClick={() => {
                setIsZenMode(true);
                showToast("🧘 Modo Zen activo — Interfaz ocultada. Pulsa Esc o el botón para volver", "info", 3500);
              }}
              title="Modo Zen / Presentación (Limpiar pantalla y ocultar interfaz)"
              className="btn-draw inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-slate-800 dark:bg-slate-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 shadow-md hover:scale-105 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <EyeOff size={15} />
              <span className="hidden sm:inline">Modo Zen</span>
            </button>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageImport}
              className="hidden"
            />

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

            <button
              onClick={handleSVGExport}
              title="Exportar como SVG (vectorial)"
              className="btn-draw inline-flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-all hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>SVG</span>
            </button>

            <button
              onClick={handlePNGExport}
              title="Exportar como PNG (imagen)"
              className="btn-draw inline-flex items-center justify-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-105 transition-all cursor-pointer whitespace-nowrap shrink-0"
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
                title="Resetear Zoom (100%)"
                className="btn-draw p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>

              {/* Preset Zoom Levels */}
              <div className="hidden md:flex items-center gap-1 pl-1 border-l border-slate-200/50 dark:border-slate-700/50">
                {[0.5, 1, 1.5, 2].map((zVal) => (
                  <button
                    key={zVal}
                    onClick={() => {
                      const focusX = window.innerWidth / 2;
                      const focusY = window.innerHeight / 2;
                      setZoom((prevZoom) => {
                        const scaleRatio = zVal / prevZoom;
                        setPan((prevPan) => ({
                          x: focusX - (focusX - prevPan.x) * scaleRatio,
                          y: focusY - (focusY - prevPan.y) * scaleRatio,
                        }));
                        return zVal;
                      });
                    }}
                    className={`btn-draw px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                      Math.abs(zoom - zVal) < 0.05
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {Math.round(zVal * 100)}%
                  </button>
                ))}
              </div>
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
                <Info size={12} /> Elementos: {elements.length}
              </span>
              <span>Atajos: [V] Select, [P] Pen, [R] Rect, [Doble Clic] Editar Texto</span>
            </div>
          </div>
        </>
      )}

      {/* Floating Exit Zen Mode Button (Appears when UI is hidden) */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          title="Mostrar Interfaz (o presiona Esc)"
          className="absolute bottom-4 right-4 z-50 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-2xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2 font-extrabold text-xs animate-bounce"
        >
          <Eye size={18} />
          <span>Mostrar Interfaz (Esc)</span>
        </button>
      )}

      {/* Actual Drawing SVG Canvas Area */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair touch-none focus:outline-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{
          cursor: tool === "hand" ? (isPanning ? "grabbing" : "grab") : tool === "select" ? "default" : "crosshair",
        }}
      >
        <defs>
          <pattern
            id="grid"
            width={20 * zoom}
            height={20 * zoom}
            patternUnits="userSpaceOnUse"
            x={pan.x}
            y={pan.y}
          >
            <circle cx={1} cy={1} r={1} fill={darkMode ? "#334155" : "#cbd5e1"} />
          </pattern>
          {Object.entries(COLORS).map(([name, hex]) => (
            <pattern
              key={name}
              id={`hatch-${name}`}
              width="14"
              height="14"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="0" y2="14" stroke={hex} strokeWidth="1.2" opacity="0.45" />
            </pattern>
          ))}
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {elements.map((el) => renderElement(el))}
          {activeElement && renderElement(activeElement)}

          {/* Live PowerPoint Text Box Placement Preview */}
          {tool === "text" && hoverCoords && !isDrawing && !editingTextId && (
            <g transform={`translate(${hoverCoords.x}, ${hoverCoords.y})`} pointerEvents="none">
              <rect
                x={0}
                y={0}
                width={180}
                height={Math.max(40, fontSize * 1.5)}
                fill="rgba(168, 85, 247, 0.06)"
                stroke="#8b5cf6"
                strokeWidth={1.5 / zoom}
                strokeDasharray={`${4 / zoom} ${4 / zoom}`}
                rx={4 / zoom}
              />
              <rect x={-3 / zoom} y={-3 / zoom} width={6 / zoom} height={6 / zoom} fill="#ffffff" stroke="#8b5cf6" strokeWidth={1 / zoom} />
              <rect x={177 / zoom} y={-3 / zoom} width={6 / zoom} height={6 / zoom} fill="#ffffff" stroke="#8b5cf6" strokeWidth={1 / zoom} />
              <rect x={177 / zoom} y={(fontSize * 1.5 - 3) / zoom} width={6 / zoom} height={6 / zoom} fill="#ffffff" stroke="#8b5cf6" strokeWidth={1 / zoom} />
              <rect x={-3 / zoom} y={(fontSize * 1.5 - 3) / zoom} width={6 / zoom} height={6 / zoom} fill="#ffffff" stroke="#8b5cf6" strokeWidth={1 / zoom} />

              <text
                x={10}
                y={fontSize * 0.9}
                fill="#a855f7"
                fontSize={fontSize}
                fontFamily="Arial, sans-serif"
                opacity={0.55}
                fontStyle="italic"
              >
                Escribe tu texto...
              </text>
            </g>
          )}

          {selectionMarquee && (
            <rect
              x={Math.min(selectionMarquee.x1, selectionMarquee.x2)}
              y={Math.min(selectionMarquee.y1, selectionMarquee.y2)}
              width={Math.abs(selectionMarquee.x2 - selectionMarquee.x1)}
              height={Math.abs(selectionMarquee.y2 - selectionMarquee.y1)}
              fill="rgba(168, 85, 247, 0.05)"
              stroke="#8b5cf6"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              pointerEvents="none"
            />
          )}

          {/* Multi and Single Selection Highlight Bounding Box & Interactive Rotation Handle */}
          {!isZenMode && tool === "select" && selectedIds.length > 0 && (
            (() => {
              const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
              if (selectedElements.length === 0) return null;

              let groupMinX = Infinity;
              let groupMaxX = -Infinity;
              let groupMinY = Infinity;
              let groupMaxY = -Infinity;

              selectedElements.forEach((el) => {
                const b = getElementBounds(el);
                if (b.minX < groupMinX) groupMinX = b.minX;
                if (b.maxX > groupMaxX) groupMaxX = b.maxX;
                if (b.minY < groupMinY) groupMinY = b.minY;
                if (b.maxY > groupMaxY) groupMaxY = b.maxY;
              });

              const pad = 6;
              const gLeft = groupMinX - pad;
              const gTop = groupMinY - pad;
              const gRight = groupMaxX + pad;
              const gBottom = groupMaxY + pad;
              const gW = Math.max(10, gRight - gLeft);
              const gH = Math.max(10, gBottom - gTop);

              const sw = Math.max(1.5, 2.2 / zoom);
              const dash = `${6 / zoom} ${4 / zoom}`;
              const hs = Math.max(8, 12 / zoom);
              const rotStem = 28 / zoom;
              const rotR = Math.max(6, 8 / zoom);

              const singleRot = selectedElements.length === 1 ? (selectedElements[0].rotation || 0) : 0;
              const centerX = (gLeft + gRight) / 2;
              const centerY = (gTop + gBottom) / 2;
              const rotYTop = gTop - rotStem;
              const rotYBottom = gBottom + rotStem;
              const transform = singleRot ? `rotate(${singleRot}, ${centerX}, ${centerY})` : undefined;

              return (
                <g pointerEvents="all" transform={transform}>
                  {/* Top Vertical Anchor Stem & Rotation Handle */}
                  <g style={{ cursor: "grab" }} pointerEvents="all">
                    <line
                      x1={centerX}
                      y1={gTop}
                      x2={centerX}
                      y2={rotYTop}
                      stroke="#8b5cf6"
                      strokeWidth={sw}
                      strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                    />
                    <circle
                      cx={centerX}
                      cy={rotYTop}
                      r={rotR}
                      fill="#ffffff"
                      stroke="#8b5cf6"
                      strokeWidth={sw}
                    />
                    <foreignObject
                      x={centerX - rotR}
                      y={rotYTop - rotR}
                      width={rotR * 2}
                      height={rotR * 2}
                      transform={singleRot ? `rotate(${-singleRot}, ${centerX}, ${rotYTop})` : undefined}
                      style={{ pointerEvents: "none" }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-purple-600">
                        <RotateCw size={Math.max(10, Math.round(12 / zoom))} />
                      </div>
                    </foreignObject>

                    {/* Live Rotation Angle Badge (Counter-Rotated for Gravity Alignment) */}
                    {singleRot !== 0 && (
                      <foreignObject
                        x={centerX - 35 / zoom}
                        y={rotYTop - 26 / zoom}
                        width={70 / zoom}
                        height={20 / zoom}
                        transform={singleRot ? `rotate(${-singleRot}, ${centerX}, ${rotYTop})` : undefined}
                        style={{ pointerEvents: "none" }}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="px-1.5 py-0.5 rounded-md bg-purple-900/90 text-white font-mono font-bold text-[10px] shadow-sm border border-purple-400/40 whitespace-nowrap">
                            🎯 {singleRot}°
                          </span>
                        </div>
                      </foreignObject>
                    )}
                  </g>

                  {/* Bottom Vertical Anchor Stem & Rotation Handle */}
                  <g style={{ cursor: "grab" }} pointerEvents="all">
                    <line
                      x1={centerX}
                      y1={gBottom}
                      x2={centerX}
                      y2={rotYBottom}
                      stroke="#8b5cf6"
                      strokeWidth={sw}
                      strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                    />
                    <circle
                      cx={centerX}
                      cy={rotYBottom}
                      r={rotR}
                      fill="#ffffff"
                      stroke="#8b5cf6"
                      strokeWidth={sw}
                    />
                    <foreignObject
                      x={centerX - rotR}
                      y={rotYBottom - rotR}
                      width={rotR * 2}
                      height={rotR * 2}
                      transform={singleRot ? `rotate(${-singleRot}, ${centerX}, ${rotYBottom})` : undefined}
                      style={{ pointerEvents: "none" }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-purple-600">
                        <RotateCw size={Math.max(10, Math.round(12 / zoom))} />
                      </div>
                    </foreignObject>
                  </g>

                  {/* Main Bounding Box */}
                  <rect
                    x={gLeft}
                    y={gTop}
                    width={gW}
                    height={gH}
                    fill="rgba(168, 85, 247, 0.04)"
                    stroke="#8b5cf6"
                    strokeWidth={sw}
                    strokeDasharray={dash}
                    rx={4 / zoom}
                  />

                  {/* Corner Resize Handles */}
                  <rect x={gLeft - hs / 2} y={gTop - hs / 2} width={hs} height={hs} fill="#ffffff" stroke="#8b5cf6" strokeWidth={sw} rx={2 / zoom} style={{ cursor: "nwse-resize" }} />
                  <rect x={gRight - hs / 2} y={gTop - hs / 2} width={hs} height={hs} fill="#ffffff" stroke="#8b5cf6" strokeWidth={sw} rx={2 / zoom} style={{ cursor: "nesw-resize" }} />
                  <rect x={gRight - hs / 2} y={gBottom - hs / 2} width={hs} height={hs} fill="#ffffff" stroke="#8b5cf6" strokeWidth={sw} rx={2 / zoom} style={{ cursor: "nwse-resize" }} />
                  <rect x={gLeft - hs / 2} y={gBottom - hs / 2} width={hs} height={hs} fill="#ffffff" stroke="#8b5cf6" strokeWidth={sw} rx={2 / zoom} style={{ cursor: "nesw-resize" }} />

                  {/* Multi-element count badge */}
                  {selectedElements.length > 1 && (
                    <foreignObject x={gLeft} y={gTop - 32 / zoom} width={Math.max(170, gW)} height={28 / zoom}>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-[11px] font-bold shadow-md">
                        <span>✨ {selectedElements.length} elementos seleccionados</span>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })()
          )}
        </g>
      </svg>

      {/* Inline PowerPoint-Style Text Frame Overlay Editor */}
      {editingTextId && (
        (() => {
          const el = elements.find((e) => e.id === editingTextId);
          if (!el) return null;

          const screenX = el.x * zoom + pan.x;
          const screenY = el.y * zoom + pan.y;
          const hex = COLORS[el.strokeColor] || el.strokeColor || "#000";
          const font =
            el.fontFamily === "arial" || el.fontFamily === "sans" || !el.fontFamily
              ? "Arial, Helvetica, sans-serif"
              : el.fontFamily === "hand"
              ? "'Architects Daughter', cursive"
              : el.fontFamily === "mono"
              ? "monospace"
              : el.fontFamily === "serif"
              ? "Georgia, serif"
              : "Arial, Helvetica, sans-serif";

          const align = el.textAlign || "left";
          const currentDims = computeTextDimensions(textInputValue || "Escribe tu texto...", el.fontSize, el.fontFamily);
          const boxWidth = Math.max(140 * zoom, (currentDims.width + 20) * zoom);
          const boxHeight = Math.max((el.fontSize * 1.3 + 8) * zoom, (currentDims.height + 8) * zoom);

          let leftPos = screenX - 6 * zoom;
          if (align === "center") {
            leftPos = screenX + (el.width * zoom) / 2 - boxWidth / 2;
          } else if (align === "right") {
            leftPos = screenX + el.width * zoom - boxWidth + 6 * zoom;
          }
          const topPos = screenY - 4 * zoom;

          return (
            <div
              className="absolute z-40 flex flex-col gap-1 pointer-events-auto animate-fade-in"
              style={{
                left: `${leftPos}px`,
                top: `${topPos}px`,
                width: `${boxWidth}px`,
              }}
            >
              <div
                className="relative border-2 border-dashed border-purple-500/90 dark:border-purple-400/90 rounded-lg ring-4 ring-purple-500/15 p-1 flex flex-col transition-all duration-75"
                style={{
                  width: "100%",
                  minHeight: `${boxHeight}px`,
                  backgroundColor: "transparent",
                }}
              >
                {/* PowerPoint Corner Handles */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-purple-600 dark:border-purple-400 rounded-sm pointer-events-none shadow-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-purple-600 dark:border-purple-400 rounded-sm pointer-events-none shadow-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-purple-600 dark:border-purple-400 rounded-sm pointer-events-none shadow-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-2 border-purple-600 dark:border-purple-400 rounded-sm pointer-events-none shadow-sm" />

                <textarea
                  ref={textInputRef}
                  value={textInputValue}
                  placeholder="Escribe tu texto..."
                  autoFocus
                  onChange={(e) => {
                    const val = e.target.value;
                    setTextInputValue(val);
                    const dims = computeTextDimensions(val || "Escribe tu texto...", el.fontSize, el.fontFamily);
                    setElements(
                      elements.map((item) =>
                        item.id === el.id ? { ...item, text: val, width: dims.width, height: dims.height } : item
                      )
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
                      e.preventDefault();
                      saveTextEdit();
                    }
                  }}
                  onBlur={saveTextEdit}
                  className="w-full bg-transparent focus:outline-none caret-purple-600 dark:caret-purple-400 resize-none overflow-hidden p-0 m-0 border-none font-medium placeholder-purple-400/40 dark:placeholder-purple-400/40"
                  style={{
                    fontSize: `${el.fontSize * zoom}px`,
                    lineHeight: "1.3",
                    fontFamily: font,
                    textAlign: el.textAlign || "left",
                    width: "100%",
                    height: `${Math.max(el.fontSize * zoom * 1.3, (currentDims.height + 4) * zoom)}px`,
                    color: hex,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                />
              </div>

              {/* Status Hint Badge */}
              <div className="mt-1 self-start px-2 py-0.5 backdrop-blur-md bg-purple-900/90 text-white text-[10px] font-bold rounded-md shadow-md flex items-center gap-1.5 pointer-events-none whitespace-nowrap opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Escribe libremente | Esc para finalizar</span>
              </div>
            </div>
          );
        })()
      )}



      {/* SHARE PROJECT MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60 animate-fade-in">
          <div className="relative w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Share2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Compartir Proyecto
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Enlace interactivo y autocomprimido para colaboraciones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Direct URL Share Box */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Enlace Directo del Diagrama
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generateShareUrl()}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-mono focus:outline-none select-all truncate"
                />
                <button
                  onClick={handleCopyShareLink}
                  className={`btn-draw px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isLinkCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-500/20"
                  }`}
                >
                  {isLinkCopied ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      <span>Copiar Enlace</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Export Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCopyJSON}
                className="btn-draw p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
              >
                <CodeIcon size={16} />
                <span>Copiar JSON</span>
              </button>

              <button
                onClick={() => {
                  handleJSONExport();
                  setIsShareModalOpen(false);
                }}
                className="btn-draw p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
              >
                <Upload size={16} />
                <span>Descargar .json</span>
              </button>
            </div>

            {/* Diagram Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-purple-500" />
                <span>Total de Elementos: <strong className="text-slate-800 dark:text-slate-200">{elements.length}</strong></span>
              </div>
              <div>
                <span>Autoguardado: <strong className="text-emerald-600 dark:text-emerald-400">Activo</strong></span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
