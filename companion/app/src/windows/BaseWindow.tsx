/**
 * BaseWindow - Window Component Base
 * Draggable, resizable window with macOS-style controls
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '@/stores';
import type { WindowInstance } from '@/types/os';
import { X, Minus, Square } from 'lucide-react';

interface BaseWindowProps {
  window: WindowInstance;
  color?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const RESIZE_HANDLE_SIZE = 8;

export function BaseWindow({ window, color = '#6366f1', children, onClose }: BaseWindowProps) {
  const { 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow, 
    moveWindow, 
    resizeWindow,
    bringToFront 
  } = useWindowStore();

  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle window focus
  const handleWindowClick = useCallback(() => {
    if (!window.isFocused) {
      focusWindow(window.id);
    }
    bringToFront(window.id);
  }, [window.id, window.isFocused, focusWindow, bringToFront]);

  // Drag handlers
  const handleTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.isMaximized) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    });
    focusWindow(window.id);
    bringToFront(window.id);
  }, [window.position, window.isMaximized, window.id, focusWindow, bringToFront]);

  // Resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
  }, [window.size]);

  // Get viewport dimensions
  const getViewportWidth = () => (typeof globalThis !== 'undefined' && globalThis.window ? globalThis.window.innerWidth : 1920);
  const getViewportHeight = () => (typeof globalThis !== 'undefined' && globalThis.window ? globalThis.window.innerHeight : 1080);

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        // Keep window within viewport (with some padding)
        const maxX = getViewportWidth() - 100;
        const maxY = getViewportHeight() - 50;
        
        moveWindow(window.id, {
          x: Math.max(-window.size.width + 100, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        resizeWindow(window.id, {
          width: Math.max(MIN_WIDTH, resizeStart.width + deltaX),
          height: Math.max(MIN_HEIGHT, resizeStart.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, window.id, window.size.width, moveWindow, resizeWindow]);

  // Window controls
  const handleClose = useCallback(() => {
    closeWindow(window.id);
    onClose?.();
  }, [window.id, closeWindow, onClose]);

  const handleMinimize = useCallback(() => {
    minimizeWindow(window.id);
  }, [window.id, minimizeWindow]);

  const handleMaximize = useCallback(() => {
    if (window.isMaximized) {
      restoreWindow(window.id);
    } else {
      maximizeWindow(window.id);
    }
  }, [window.id, window.isMaximized, maximizeWindow, restoreWindow]);

  // Double click on title bar to maximize
  const handleTitleBarDoubleClick = useCallback(() => {
    handleMaximize();
  }, [handleMaximize]);

  if (window.isMinimized) return null;

  const windowStyle: React.CSSProperties = window.isMaximized
    ? {
        position: 'fixed',
        top: '28px',
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 28px - 70px)',
        zIndex: window.zIndex,
      }
    : {
        position: 'absolute',
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
      };

  return (
    <div
      ref={windowRef}
      className="window-container"
      style={windowStyle}
      onClick={handleWindowClick}
    >
      {/* Window Frame */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(15, 15, 25, 0.98)',
          borderRadius: window.isMaximized ? 0 : '12px',
          border: window.isFocused ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: window.isFocused
            ? `0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px ${color}20`
            : '0 10px 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(20px)',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          animation: 'windowEnter 0.2s ease',
        }}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={handleTitleBarDoubleClick}
          style={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            background: window.isFocused
              ? `linear-gradient(180deg, ${color}15 0%, transparent 100%)`
              : 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            cursor: window.isMaximized ? 'default' : 'move',
            userSelect: 'none',
          }}
        >
          {/* Window Controls (macOS style - left) */}
          <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
            <button
              onClick={handleClose}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#FF5F57',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FF453A')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FF5F57')}
            >
              <X size={8} style={{ opacity: 0, color: '#000' }} />
            </button>
            <button
              onClick={handleMinimize}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#FFBD2E',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#FFB800')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#FFBD2E')}
            >
              <Minus size={8} style={{ opacity: 0, color: '#000' }} />
            </button>
            <button
              onClick={handleMaximize}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#28CA42',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#28C840')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#28CA42')}
            >
              <Square size={8} style={{ opacity: 0, color: '#000' }} />
            </button>
          </div>

          {/* Window Title */}
          <div
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 500,
              color: window.isFocused ? '#fff' : 'rgba(255,255,255,0.5)',
            }}
          >
            {window.title}
          </div>

          {/* Spacer for balance */}
          <div style={{ width: '60px' }} />
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}
        >
          {children}
        </div>

        {/* Resize Handles (only when not maximized) */}
        {!window.isMaximized && (
          <>
            {/* Bottom-right corner */}
            <div
              onMouseDown={handleResizeMouseDown}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: RESIZE_HANDLE_SIZE * 2,
                height: RESIZE_HANDLE_SIZE * 2,
                cursor: 'nwse-resize',
                zIndex: 10,
              }}
            />
            {/* Right edge */}
            <div
              onMouseDown={handleResizeMouseDown}
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                bottom: '16px',
                width: RESIZE_HANDLE_SIZE,
                cursor: 'ew-resize',
                zIndex: 10,
              }}
            />
            {/* Bottom edge */}
            <div
              onMouseDown={handleResizeMouseDown}
              style={{
                position: 'absolute',
                bottom: 0,
                left: '16px',
                right: '16px',
                height: RESIZE_HANDLE_SIZE,
                cursor: 'ns-resize',
                zIndex: 10,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default BaseWindow;
