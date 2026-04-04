/**
 * AuditWindow - Real Audit Area
 * File selection, code viewer, scan progress, and findings
 */

import { useState, useRef, useCallback } from 'react';
import { useAuditStore, useEngineStore, useWindowStore } from '@/stores';
import { 
  FolderOpen, Play, Square, AlertTriangle, Shield, 
  FileCode, ChevronRight, ChevronDown, Search, CheckCircle,
  XCircle, AlertCircle, Info
} from 'lucide-react';
import type { EngineId, Severity, Finding } from '@/types/os';

// Mock file tree structure
const mockFileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    children: [
      {
        name: 'auth',
        type: 'folder',
        children: [
          { name: 'login.ts', type: 'file', content: `app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  });
});` },
          { name: 'register.ts', type: 'file', content: '// Registration logic' },
        ],
      },
      {
        name: 'components',
        type: 'folder',
        children: [
          { name: 'Comment.tsx', type: 'file', content: '<div className="comment" dangerouslySetInnerHTML={{ __html: comment.content }} />' },
          { name: 'Header.tsx', type: 'file', content: '// Header component' },
        ],
      },
      {
        name: 'config',
        type: 'folder',
        children: [
          { name: 'api.ts', type: 'file', content: 'export const config = {\n  API_KEY: "sk-1234567890abcdef",\n  ENDPOINT: "https://api.example.com"\n};' },
        ],
      },
      { name: 'server.ts', type: 'file', content: 'app.use(cors({\n  origin: "*",\n  credentials: true\n}));' },
      { name: 'routes.ts', type: 'file', content: '// Route definitions' },
    ],
  },
  {
    name: 'package.json',
    type: 'file',
    content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}',
  },
];

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  children?: FileNode[];
  content?: string;
}

export function AuditWindow() {
  const { engines } = useEngineStore();
  const { 
    target, 
    targetType, 
    selectedEngines, 
    status, 
    progress, 
    findings, 
    logs,
    setTarget,
    toggleEngine,
    startScan,
    stopScan,
    getCriticalCount,
    getHighCount,
    getMediumCount,
    getLowCount,
  } = useAuditStore();
  
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const engineList = Object.values(engines);

  const handleSelectFolder = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Pegar o caminho da primeira pasta selecionada
      const file = e.target.files[0];
      const path = file.webkitRelativePath || file.name;
      const folderName = path.split('/')[0];
      setTarget(folderName, 'folder');
    }
  }, [setTarget]);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const renderFileTree = (nodes: FileNode[], path = '') => {
    return nodes.map((node) => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(currentPath);
      const isSelected = selectedFile?.name === node.name;

      return (
        <div key={currentPath}>
          <div
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(currentPath);
              } else {
                setSelectedFile(node);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '4px',
              background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              fontSize: '13px',
              color: node.type === 'folder' ? '#fff' : 'rgba(255,255,255,0.8)',
            }}
          >
            {node.type === 'folder' && (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            )}
            <FileCode size={14} style={{ 
              color: node.type === 'folder' ? '#F59E0B' : '#10B981',
              opacity: node.type === 'folder' ? 1 : 0.7 
            }} />
            {node.name}
          </div>
          {node.type === 'folder' && isExpanded && node.children && (
            <div style={{ paddingLeft: '16px' }}>
              {renderFileTree(node.children, currentPath)}
            </div>
          )}
        </div>
      );
    });
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={16} style={{ color: '#EF4444' }} />;
      case 'high':
        return <AlertTriangle size={16} style={{ color: '#F59E0B' }} />;
      case 'medium':
        return <AlertCircle size={16} style={{ color: '#3B82F6' }} />;
      default:
        return <Info size={16} style={{ color: '#6B7280' }} />;
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        {...{ webkitdirectory: 'true', directory: 'true' } as React.InputHTMLAttributes<HTMLInputElement>}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Target Selection */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
          TARGET
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={target || ''}
            onChange={(e) => setTarget(e.target.value, 'url')}
            placeholder="https://example.com or select folder..."
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSelectFolder}
            style={{
              padding: '10px 16px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FolderOpen size={16} />
            Select Folder
          </button>
        </div>
      </div>

      {/* Engine Selection */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
          ACTIVE ENGINES
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {engineList.map((engine) => (
            <button
              key={engine.id}
              onClick={() => toggleEngine(engine.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: selectedEngines.includes(engine.id)
                  ? `${engine.color}30`
                  : 'rgba(255,255,255,0.05)',
                color: selectedEngines.includes(engine.id) ? engine.color : 'rgba(255,255,255,0.5)',
                border: `1px solid ${selectedEngines.includes(engine.id) ? engine.color : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: selectedEngines.includes(engine.id) ? engine.color : 'transparent',
                  border: `1px solid ${selectedEngines.includes(engine.id) ? engine.color : 'rgba(255,255,255,0.3)'}`,
                }}
              />
              {engine.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>
          Estimated time: {Math.round(selectedEngines.length * 1.2)} minutes
        </div>
      </div>

      {/* Main Content Area */}
      {target && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* File Tree */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'auto',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
              PROJECT FILES
            </div>
            {renderFileTree(mockFileTree)}
          </div>

          {/* Code Viewer */}
          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px',
                color: '#fff',
              }}
            >
              {selectedFile?.name || 'Select a file to view'}
            </div>
            <pre
              style={{
                flex: 1,
                padding: '16px',
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#10B981',
                overflow: 'auto',
                lineHeight: 1.6,
              }}
            >
              {selectedFile?.content || '// Select a file from the tree to view its contents'}
            </pre>
          </div>
        </div>
      )}

      {/* Start Scan Button */}
      {target && status === 'idle' && (
        <button
          onClick={startScan}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <Play size={18} />
          START AUDIT
        </button>
      )}

      {/* Scan Progress */}
      {status === 'scanning' && (
        <div
          style={{
            padding: '16px',
            background: 'rgba(99, 102, 241, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: '#fff' }}>Scanning...</span>
            <span style={{ fontSize: '14px', color: '#6366F1', fontWeight: 600 }}>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              marginTop: '12px',
              padding: '10px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#10B981',
              maxHeight: '100px',
              overflow: 'auto',
            }}
          >
            {logs.slice(-5).map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
          <button
            onClick={stopScan}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              color: '#EF4444',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Square size={14} />
            Stop
          </button>
        </div>
      )}

      {/* Results */}
      {status === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            {[
              { label: 'Critical', count: getCriticalCount(), color: '#EF4444' },
              { label: 'High', count: getHighCount(), color: '#F59E0B' },
              { label: 'Medium', count: getMediumCount(), color: '#3B82F6' },
              { label: 'Low', count: getLowCount(), color: '#6B7280' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '14px',
                  background: `${item.color}15`,
                  borderRadius: '8px',
                  border: `1px solid ${item.color}30`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: item.color }}>
                  {item.count}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Findings List */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'auto',
              maxHeight: '300px',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              FINDINGS ({findings.length})
            </div>
            {findings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  background: selectedFinding?.id === finding.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getSeverityIcon(finding.severity)}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{finding.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                      {finding.file}:{finding.line} • {finding.engine}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      background: `${getSeverityColor(finding.severity)}20`,
                      color: getSeverityColor(finding.severity),
                    }}
                  >
                    {finding.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Finding Detail */}
          {selectedFinding && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '10px',
                border: `1px solid ${getSeverityColor(selectedFinding.severity)}40`,
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                {selectedFinding.title}
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                {selectedFinding.description}
              </p>
              {selectedFinding.code && (
                <pre
                  style={{
                    padding: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#10B981',
                    overflow: 'auto',
                  }}
                >
                  {selectedFinding.code}
                </pre>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    color: '#10B981',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={14} style={{ marginRight: '6px' }} />
                  Mark Fixed
                </button>
                <button
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '6px',
                    color: '#F59E0B',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Shield size={14} style={{ marginRight: '6px' }} />
                  Ignore
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditWindow;
