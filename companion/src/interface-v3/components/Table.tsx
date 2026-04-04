/**
 * SITEPULSE STUDIO v3.0 - TABLE COMPONENT
 * Tabela avançada com ordenação e seleção
 */

import React, { useState, useMemo } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sortable?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  selectable,
  selectedIds = new Set(),
  onSelectionChange,
  sortable,
  onRowClick,
  emptyMessage = 'Nenhum dado encontrado',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (column: TableColumn<T>) => {
    if (!sortable || !column.sortable) return;

    if (sortKey === column.key) {
      setSortDirection((prev) =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortKey(null);
      }
    } else {
      setSortKey(column.key);
      setSortDirection('asc');
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === data.length) {
      onSelectionChange?.(new Set());
    } else {
      onSelectionChange?.(new Set(data.map((row) => keyExtractor(row))));
    }
  };

  return (
    <div className="sp-w-full sp-overflow-x-auto">
      <table className="sp-w-full sp-border-collapse">
        <thead>
          <tr className="sp-border-b sp-border-white/[0.06]">
            {selectable && (
              <th className="sp-py-3 sp-px-4 sp-text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data.length && data.length > 0}
                  onChange={toggleAll}
                  className="sp-w-4 sp-h-4 sp-rounded sp-border-white/[0.2] sp-bg-transparent sp-cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`sp-py-3 sp-px-4 sp-text-left sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary sp-font-medium ${
                  sortable && col.sortable ? 'sp-cursor-pointer hover:sp-text-white' : ''
                }`}
                style={{ width: col.width }}
                onClick={() => handleSort(col)}
              >
                <div className="sp-flex sp-items-center sp-gap-2">
                  {col.header}
                  {sortable && col.sortable && sortKey === col.key && (
                    <span className="sp-text-primary">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="sp-py-12 sp-text-center sp-text-text-secondary"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds.has(id);

              return (
                <tr
                  key={id}
                  className={`sp-border-b sp-border-white/[0.04] sp-transition-colors ${
                    isSelected
                      ? 'sp-bg-primary/5'
                      : 'hover:sp-bg-white/[0.02]'
                  } ${onRowClick ? 'sp-cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="sp-py-3 sp-px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(id)}
                        className="sp-w-4 sp-h-4 sp-rounded sp-border-white/[0.2] sp-bg-transparent"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="sp-py-3 sp-px-4 sp-text-sm sp-text-white"
                      style={{ textAlign: col.align || 'left' }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

