/**
 * AIAssistant - Floating AI Entity
 * Siri-like floating assistant that can be dragged anywhere
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSystemStore, useWindowStore } from '@/stores';
import { Brain, X, MessageCircle, Mic, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AIAssistant() {
  const { aiState, setAIState, setAIMessage } = useSystemStore();
  const { openAuditWindow, openEngineWindow } = useWindowStore();
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX - position.x,
      startY: e.clientY - position.y,
    };
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;

      const newX = e.clientX - dragRef.current.startX;
      const newY = e.clientY - dragRef.current.startY;

      // Keep within viewport
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;

      setPosition({
        x: Math.max(20, Math.min(newX, maxX)),
        y: Math.max(50, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle click to open chat
  const handleClick = useCallback(() => {
    if (!isDragging) {
      setIsOpen(true);
      setAIState('listening');
    }
  }, [isDragging, setAIState]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsTyping(true);
    setAIState('thinking');

    // Process command
    setTimeout(() => {
      const lowerMsg = userMessage.toLowerCase();
      let response = '';

      if (lowerMsg.includes('scan') || lowerMsg.includes('audit')) {
        response = 'I\'ll open the audit window for you. You can select a project and start scanning.';
        openAuditWindow();
      } else if (lowerMsg.includes('intent')) {
        response = 'Opening the Intent Engine for pattern analysis.';
        openEngineWindow('intent', 'Intent Engine');
      } else if (lowerMsg.includes('context')) {
        response = 'Opening the Context Engine for business context mapping.';
        openEngineWindow('context', 'Context Engine');
      } else if (lowerMsg.includes('security')) {
        response = 'Opening the Security Engine to check system protection status.';
        openEngineWindow('security', 'Security Engine');
      } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        response = 'Hello! I\'m your SitePulse AI assistant. How can I help you with your security analysis today?';
      } else if (lowerMsg.includes('help')) {
        response = 'I can help you:\n• Start a new audit (say "scan" or "audit")\n• Open specific engines (say "open intent engine")\n• Check security status\n• Answer questions about vulnerabilities';
      } else {
        response = 'I understand. Let me analyze that for you. Would you like me to run a security scan or open a specific engine?';
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
      setAIState('idle');
    }, 1500);
  }, [inputValue, setAIState, openAuditWindow, openEngineWindow]);

  // Get sphere color based on state
  const getSphereColor = () => {
    switch (aiState) {
      case 'listening':
        return { bg: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.5)', pulse: true };
      case 'thinking':
        return { bg: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.5)', pulse: true };
      case 'speaking':
        return { bg: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.5)', pulse: true };
      default:
        return { bg: 'rgba(99, 102, 241, 0.2)', glow: 'rgba(99, 102, 241, 0.3)', pulse: false };
    }
  };

  const sphereStyle = getSphereColor();

  return (
    <>
      {/* Floating Sphere */}
      <div
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1500,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, ${sphereStyle.bg}, transparent)`,
            boxShadow: `0 0 40px ${sphereStyle.glow}, inset 0 0 20px ${sphereStyle.bg}`,
            border: `1px solid ${sphereStyle.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: sphereStyle.pulse ? 'aiPulse 1.5s ease-in-out infinite' : 'aiBreathe 3s ease-in-out infinite',
            transition: 'all 0.3s ease',
          }}
        >
          <Brain size={28} style={{ color: '#fff' }} />
        </div>

        {/* Status indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 8px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '10px',
            fontSize: '10px',
            color: '#fff',
            whiteSpace: 'nowrap',
            opacity: sphereStyle.pulse ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          {aiState}
        </div>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '100px',
            width: '360px',
            height: '500px',
            background: 'rgba(15, 15, 25, 0.98)',
            backdropFilter: 'blur(30px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 100px rgba(0,0,0,0.8)',
            zIndex: 1501,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), transparent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>SitePulse AI</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Always here to help</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflow: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <MessageCircle size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>How can I help you today?</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>
                  Try: "Start a new audit" or "Open Intent Engine"
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#6366F1' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <span style={{ animation: 'bounce 0.6s infinite', animationDelay: '0s' }}>.</span>
                <span style={{ animation: 'bounce 0.6s infinite', animationDelay: '0.2s' }}>.</span>
                <span style={{ animation: 'bounce 0.6s infinite', animationDelay: '0.4s' }}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setAIState('listening')}
            >
              <Mic size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: inputValue.trim() ? '#6366F1' : 'rgba(255,255,255,0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={16} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistant;
