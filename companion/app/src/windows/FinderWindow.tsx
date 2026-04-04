/**
 * FinderWindow - File System
 * macOS-style Finder with sidebar, breadcrumb, and file browser
 */

import { useState, useCallback } from 'react';
import { 
  Folder, FileText, ChevronRight, Home, Star, Clock, 
  HardDrive, Search, Grid, List as ListIcon, Columns
} from 'lucide-react';
import type { VirtualFile } from '@/types/os';

interface FileSystemNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  size?: string;
  modified?: string;
  children?: FileSystemNode[];
}

const fileSystem: FileSystemNode[] = [
  {
    id: 'projects',
    name: 'Projects',
    type: 'folder',
    modified: 'Today',
    children: [
      {
        id: 'proj1',
        name: 'ecommerce-app',
        type: 'folder',
        modified: '2 hours ago',
        children: [
          { id: 'src', name: 'src', type: 'folder', modified: 'Yesterday' },
          { id: 'tests', name: 'tests', type: 'folder', modified: '3 days ago' },
          { id: 'pkg', name: 'package.json', type: 'file', extension: 'json', size: '2.4 KB', modified: 'Today' },
          { id: 'readme', name: 'README.md', type: 'file', extension: 'md', size: '4.1 KB', modified: '1 week ago' },
        ],
      },
      {
        id: 'proj2',
        name: 'api-gateway',
        type: 'folder',
        modified: 'Yesterday',
        children: [
          { id: 'routes', name: 'routes', type: 'folder', modified: 'Yesterday' },
          { id: 'middleware', name: 'middleware', type: 'folder', modified: '2 days ago' },
          { id: 'config', name: 'config.yaml', type: 'file', extension: 'yaml', size: '1.2 KB', modified: '3 days ago' },
        ],
      },
      {
        id: 'proj3',
        name: 'auth-service',
        type: 'folder',
        modified: '3 days ago',
      },
    ],
  },
  {
    id: 'evidence',
    name: 'Evidence',
    type: 'folder',
    modified: 'Today',
    children: [
      { id: 'ev1', name: 'sql-injection-proof.pdf', type: 'file', extension: 'pdf', size: '1.8 MB', modified: 'Today' },
      { id: 'ev2', name: 'xss-evidence.png', type: 'file', extension: 'png', size: '245 KB', modified: 'Yesterday' },
      { id: 'ev3', name: 'scan-report-2024-01.json', type: 'file', extension: 'json', size: '156 KB', modified: '2 days ago' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports',
    type: 'folder',
    modified: '1 week ago',
    children: [
      { id: 'rpt1', name: 'Q4-Security-Assessment.pdf', type: 'file', extension: 'pdf', size: '4.2 MB', modified: '2 weeks ago' },
      { id: 'rpt2', name: 'Monthly-Audit-Jan.pdf', type: 'file', extension: 'pdf', size: '2.1 MB', modified: '1 month ago' },
    ],
  },
];

const sidebarItems = [
  { id: 'favorites', label: 'FAVORITES', items: [
    { id: 'projects', name: 'Projects', icon: Folder },
    { id: 'evidence', name: 'Evidence', icon: FileText },
    { id: 'reports', name: 'Reports', icon: Star },
  ]},
  { id: 'locations', label: 'LOCATIONS', items: [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'desktop', name: 'Desktop', icon: HardDrive },
    { id: 'recent', name: 'Recent', icon: Clock },
  ]},
];

export function FinderWindow() {
  const [currentPath, setCurrentPath] = useState<string[]>(['Home']);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'icon' | 'list' | 'columns'>('icon');
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = useCallback((folderName: string) => {
    setCurrentPath(prev => [...prev, folderName]);
  }, []);

  const navigateUp = useCallback(() => {
    setCurrentPath(prev => prev.slice(0, -1));
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    setCurrentPath(prev => prev.slice(0, index + 1));
  }, []);

  const getCurrentFolder = useCallback((): FileSystemNode[] => {
    // Simplified - just return root for demo
    return fileSystem;
  }, []);

  const getFileIcon = (type: string, extension?: string) => {
    if (type === 'folder') {
      return <Folder size={48} style={{ color: '#F59E0B' }} />;
    }
    switch (extension) {
      case 'js':
      case 'ts':
      case 'tsx':
        return <FileText size={48} style={{ color: '#F7DF1E' }} />;
      case 'json':
        return <FileText size={48} style={{ color: '#10B981' }} />;
      case 'md':
        return <FileText size={48} style={{ color: '#fff' }} />;
      case 'pdf':
        return <FileText size={48} style={{ color: '#EF4444' }} />;
      case 'png':
      case 'jpg':
        return <FileText size={48} style={{ color: '#3B82F6' }} />;
      default:
        return <FileText size={48} style={{ color: '#9CA3AF' }} />;
    }
  };

  const currentItems = getCurrentFolder();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={navigateUp}
            disabled={currentPath.length <= 1}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '6px',
              color: currentPath.length > 1 ? '#fff' : 'rgba(255,255,255,0.3)',
              cursor: currentPath.length > 1 ? 'pointer' : 'not-allowed',
            }}
          >
            ←
          </button>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {currentPath.map((segment, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {index > 0 && <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />}
              <button
                onClick={() => navigateToBreadcrumb(index)}
                style={{
                  padding: '4px 8px',
                  background: index === currentPath.length - 1 ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: index === currentPath.length - 1 ? '#6366F1' : 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {segment}
              </button>
            </div>
          ))}
        </div>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
          }}
        >
          <Search size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '13px',
              width: '120px',
            }}
          />
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            onClick={() => setViewMode('icon')}
            style={{
              padding: '6px',
              background: viewMode === 'icon' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '4px',
              color: viewMode === 'icon' ? '#6366F1' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px',
              background: viewMode === 'list' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '4px',
              color: viewMode === 'list' ? '#6366F1' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <ListIcon size={16} />
          </button>
          <button
            onClick={() => setViewMode('columns')}
            style={{
              padding: '6px',
              background: viewMode === 'columns' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '4px',
              color: viewMode === 'columns' ? '#6366F1' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
            }}
          >
            <Columns size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div
          style={{
            width: '180px',
            background: 'rgba(255,255,255,0.02)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            padding: '12px',
            overflow: 'auto',
          }}
        >
          {sidebarItems.map((section) => (
            <div key={section.id} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  padding: '4px 8px',
                  marginBottom: '4px',
                }}
              >
                {section.label}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    background: selectedItem === item.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: selectedItem === item.id ? '#6366F1' : 'rgba(255,255,255,0.8)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => setSelectedItem(item.id)}
                >
                  <item.icon size={16} />
                  {item.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* File Browser */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {viewMode === 'icon' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.type === 'folder' && navigateTo(item.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: item.type === 'folder' ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {getFileIcon(item.type, item.extension)}
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#fff',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.name}
                  </span>
                  {item.type === 'file' && item.size && (
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                      {item.size}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  padding: '8px 12px',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.5)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span>Name</span>
                <span>Size</span>
                <span>Modified</span>
              </div>
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.type === 'folder' && navigateTo(item.name)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    cursor: item.type === 'folder' ? 'pointer' : 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.type === 'folder' ? (
                      <Folder size={18} style={{ color: '#F59E0B' }} />
                    ) : (
                      <FileText size={18} style={{ color: '#9CA3AF' }} />
                    )}
                    <span style={{ fontSize: '13px', color: '#fff' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {item.size || '--'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    {item.modified}
                  </span>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'columns' && (
            <div style={{ display: 'flex', gap: '1px', height: '100%' }}>
              {/* Column 1 */}
              <div
                style={{
                  width: '200px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '6px',
                  overflow: 'auto',
                }}
              >
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {item.type === 'folder' ? (
                      <Folder size={16} style={{ color: '#F59E0B' }} />
                    ) : (
                      <FileText size={16} style={{ color: '#9CA3AF' }} />
                    )}
                    <span style={{ fontSize: '13px', color: '#fff' }}>{item.name}</span>
                    {item.type === 'folder' && <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '6px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.5)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>{currentItems.length} items</span>
        <span>{currentItems.filter(i => i.type === 'folder').length} folders, {currentItems.filter(i => i.type === 'file').length} files</span>
      </div>
    </div>
  );
}

export default FinderWindow;
