import React from "react";

export default function LiveCursors({ remoteCursors = {}, zoom = 1, pan = { x: 0, y: 0 } }) {
  const cursorList = Object.values(remoteCursors);

  if (cursorList.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {cursorList.map((cursor) => {
        const screenX = cursor.x * zoom + pan.x;
        const screenY = cursor.y * zoom + pan.y;

        return (
          <div
            key={cursor.userId}
            className="absolute top-0 left-0 transition-transform duration-75 ease-out flex items-center gap-1 pointer-events-none select-none"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            {/* SVG Mouse Pointer Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={cursor.userColor}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="drop-shadow-md shrink-0"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.5 3.21z" />
            </svg>

            {/* Remote User Name Badge */}
            <div
              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-lg backdrop-blur-md whitespace-nowrap opacity-90"
              style={{ backgroundColor: cursor.userColor }}
            >
              {cursor.userName || "Colaborador"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
