import { useState, useEffect, useRef, useCallback } from "react";
import Peer from "peerjs";

const CURSOR_COLORS = [
  "#f43f5e", // Rose
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#a855f7", // Violet
];

function getRandomColor() {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

function getRandomUserName() {
  const names = ["Diseñador", "Colaborador", "Invitado", "Creador", "Arquitecto", "Artista"];
  const num = Math.floor(100 + Math.random() * 900);
  return `${names[Math.floor(Math.random() * names.length)]} #${num}`;
}

export function usePeerCollaboration({
  projectId,
  elements,
  setElements,
  isRemoteUpdatingRef,
}) {
  const [remoteCursors, setRemoteCursors] = useState({});
  const [connectedCount, setConnectedCount] = useState(1);
  const [userInfo] = useState(() => ({
    userId: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userName: getRandomUserName(),
    userColor: getRandomColor(),
  }));

  const peerRef = useRef(null);
  const connectionsRef = useRef([]);
  const lastBroadcastElementsRef = useRef("");

  // Clean up inactive cursors (> 6 seconds without update)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRemoteCursors((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          if (now - next[id].lastUpdated > 6000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update connected peers count
  const updateConnectedCount = useCallback(() => {
    const activeConns = connectionsRef.current.filter((c) => c && c.open);
    setConnectedCount(activeConns.length + 1);
  }, []);

  // Setup peer data listeners
  const setupConnectionListeners = useCallback(
    (conn) => {
      conn.on("open", () => {
        if (!connectionsRef.current.some((c) => c.peer === conn.peer)) {
          connectionsRef.current.push(conn);
        }
        updateConnectedCount();

        // Send initial state to newly connected peer
        if (elements && elements.length > 0) {
          conn.send({
            type: "ELEMENTS_UPDATE",
            elements: elements,
            senderId: userInfo.userId,
          });
        }
      });

      conn.on("data", (data) => {
        if (!data || typeof data !== "object") return;

        if (data.type === "CURSOR_MOVE") {
          setRemoteCursors((prev) => ({
            ...prev,
            [data.userId]: {
              userId: data.userId,
              userName: data.userName,
              userColor: data.userColor,
              x: data.x,
              y: data.y,
              lastUpdated: Date.now(),
            },
          }));
        } else if (data.type === "ELEMENTS_UPDATE") {
          if (Array.isArray(data.elements)) {
            const newJson = JSON.stringify(data.elements);
            if (newJson !== lastBroadcastElementsRef.current) {
              lastBroadcastElementsRef.current = newJson;
              if (isRemoteUpdatingRef) isRemoteUpdatingRef.current = true;
              setElements(data.elements);
              setTimeout(() => {
                if (isRemoteUpdatingRef) isRemoteUpdatingRef.current = false;
              }, 100);
            }
          }
        }
      });

      conn.on("close", () => {
        connectionsRef.current = connectionsRef.current.filter((c) => c.peer !== conn.peer);
        updateConnectedCount();
      });

      conn.on("error", (err) => {
        console.warn("Peer connection error:", err);
      });
    },
    [elements, setElements, updateConnectedCount, userInfo.userId, isRemoteUpdatingRef]
  );

  // Initialize PeerJS instance
  useEffect(() => {
    if (!projectId) return;

    const hostPeerId = `isv-whiteboard-room-${projectId}`;
    let isSubscribed = true;

    // Try creating Host Peer
    const peer = new Peer(hostPeerId, {
      debug: 1,
    });
    peerRef.current = peer;

    peer.on("open", () => {
      if (!isSubscribed) return;
    });

    peer.on("connection", (conn) => {
      setupConnectionListeners(conn);
    });

    peer.on("error", (err) => {
      // If room host ID already taken, create client Peer and connect to host
      if (err.type === "unavailable-id") {
        if (peerRef.current) peerRef.current.destroy();

        const clientPeer = new Peer({ debug: 1 });
        peerRef.current = clientPeer;

        clientPeer.on("open", () => {
          if (!isSubscribed) return;
          const conn = clientPeer.connect(hostPeerId, { reliable: true });
          setupConnectionListeners(conn);
        });

        clientPeer.on("connection", (conn) => {
          setupConnectionListeners(conn);
        });
      } else {
        console.warn("PeerJS error:", err);
      }
    });

    return () => {
      isSubscribed = false;
      connectionsRef.current.forEach((conn) => {
        try {
          if (conn.open) conn.close();
        } catch (e) {}
      });
      connectionsRef.current = [];
      if (peerRef.current) {
        try {
          peerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [projectId, setupConnectionListeners]);

  // Broadcast mouse cursor position
  const broadcastCursor = useCallback(
    (x, y) => {
      const payload = {
        type: "CURSOR_MOVE",
        userId: userInfo.userId,
        userName: userInfo.userName,
        userColor: userInfo.userColor,
        x,
        y,
      };

      connectionsRef.current.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send(payload);
          } catch (e) {}
        }
      });
    },
    [userInfo]
  );

  // Broadcast element updates to all connected peers
  const broadcastElements = useCallback(
    (newElements) => {
      if (!Array.isArray(newElements)) return;
      const json = JSON.stringify(newElements);
      if (json === lastBroadcastElementsRef.current) return;
      lastBroadcastElementsRef.current = json;

      const payload = {
        type: "ELEMENTS_UPDATE",
        elements: newElements,
        senderId: userInfo.userId,
      };

      connectionsRef.current.forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send(payload);
          } catch (e) {}
        }
      });
    },
    [userInfo.userId]
  );

  return {
    remoteCursors,
    connectedCount,
    broadcastCursor,
    broadcastElements,
    userInfo,
  };
}
