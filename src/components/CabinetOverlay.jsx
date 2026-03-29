import { useRef, useEffect, useState, useCallback } from 'react';
import { drawCabinet } from '../cabinetStyles';

const DRAG_MIN_PX = 10;

/**
 * CabinetOverlay renders a live camera feed with a draggable canvas overlay.
 * Users click-and-drag to mark a cabinet region; the selected style is rendered there.
 */
export default function CabinetOverlay({ selectedStyle, showOverlay }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const [region, setRegion] = useState(null); // {x,y,width,height}
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const currentRegion = useRef(null);

  // Start camera
  useEffect(() => {
    let stream = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera access failed:', err);
      }
    }
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Sync canvas size to video
  const syncSize = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
  }, []);

  // Render loop: draw cabinet overlay on canvas
  useEffect(() => {
    function render() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      syncSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const reg = currentRegion.current;
      if (reg && showOverlay) {
        drawCabinet(ctx, reg, selectedStyle);
      }

      // Draw drag rectangle guide while dragging
      if (dragging && reg) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(reg.x, reg.y, reg.width, reg.height);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    }
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [selectedStyle, showOverlay, dragging, syncSize]);

  // Keep ref in sync with state for the render loop
  useEffect(() => {
    currentRegion.current = region;
  }, [region]);

  // Convert mouse/touch coords to canvas-space coords
  function toCanvasCoords(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function makeRegion(start, end) {
    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y),
    };
  }

  // Mouse handlers
  function handleMouseDown(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, e.clientX, e.clientY);
    dragStart.current = pt;
    setDragging(true);
    currentRegion.current = { x: pt.x, y: pt.y, width: 0, height: 0 };
    setRegion(currentRegion.current);
  }

  function handleMouseMove(e) {
    if (!dragging || !dragStart.current) return;
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, e.clientX, e.clientY);
    const reg = makeRegion(dragStart.current, pt);
    currentRegion.current = reg;
    setRegion(reg);
  }

  function handleMouseUp(e) {
    if (!dragging) return;
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, e.clientX, e.clientY);
    const reg = makeRegion(dragStart.current, pt);
    if (reg.width < DRAG_MIN_PX || reg.height < DRAG_MIN_PX) {
      currentRegion.current = null;
      setRegion(null);
    } else {
      currentRegion.current = reg;
      setRegion(reg);
    }
    setDragging(false);
    dragStart.current = null;
  }

  // Touch handlers
  function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, touch.clientX, touch.clientY);
    dragStart.current = pt;
    setDragging(true);
    currentRegion.current = { x: pt.x, y: pt.y, width: 0, height: 0 };
    setRegion(currentRegion.current);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    if (!dragging || !dragStart.current) return;
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, touch.clientX, touch.clientY);
    const reg = makeRegion(dragStart.current, pt);
    currentRegion.current = reg;
    setRegion(reg);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const canvas = canvasRef.current;
    const pt = toCanvasCoords(canvas, touch.clientX, touch.clientY);
    const reg = makeRegion(dragStart.current, pt);
    if (reg.width < DRAG_MIN_PX || reg.height < DRAG_MIN_PX) {
      currentRegion.current = null;
      setRegion(null);
    } else {
      currentRegion.current = reg;
      setRegion(reg);
    }
    setDragging(false);
    dragStart.current = null;
  }

  function handleClearRegion() {
    currentRegion.current = null;
    setRegion(null);
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
        onLoadedMetadata={syncSize}
      />
      <canvas
        ref={canvasRef}
        className="overlay-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: 'crosshair' }}
      />
      {region && (
        <button className="clear-btn" onClick={handleClearRegion} title="Clear selection">
          ✕
        </button>
      )}
      {!region && (
        <div className="drag-hint">
          <span>📷 Drag on the camera to place a virtual cabinet</span>
        </div>
      )}
    </div>
  );
}
