import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowUpDown,
} from 'lucide-react';
import { clsx } from 'clsx';

// DataTable Component
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  searchable = true,
  sortable = true,
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange,
  onRowClick,
  emptyMessage = 'No data available',
  actions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      })
    );
  }, [data, columns, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (key) => {
    if (!sortable) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((row) => row.id));
    }
  };

  // Update parent when selection changes
  React.useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        )}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {selectable && selectedRows.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-primary text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>{selectedRows.length} selected</span>
            </div>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2',
              showFilters
                ? 'bg-primary/20 border-primary/50 text-primary'
                : 'bg-surface border-white/10 text-white hover:bg-white/5'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </button>
          {actions}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns
                .filter((col) => col.filterable)
                .map((col) => (
                  <div key={col.key} className="space-y-1">
                    <label className="text-xs text-noble-gray ml-1">{col.label}</label>
                    <input
                      type={col.filterType || 'text'}
                      placeholder={`Filter ${col.label}...`}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-white/10 text-white text-sm placeholder-white/30 focus:ring-2 focus:ring-primary/20 outline-none"
                      onChange={() => {
                        // Handle filter change
                      }}
                    />
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {selectedRows.length === paginatedData.length && paginatedData.length > 0 ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-noble-gray',
                    sortable && 'cursor-pointer hover:text-white transition-colors'
                  )}
                  onClick={() => sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortable && (
                      <span className="text-white/30">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-noble-gray">Actions</th>}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={row.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      'border-t border-white/5 hover:bg-white/5 transition-colors',
                      onRowClick && 'cursor-pointer',
                      selectedRows.includes(row.id) && 'bg-primary/5'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowSelect(row.id);
                          }}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          {selectedRows.includes(row.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render ? (
                          col.render(row[col.key], row)
                        ) : (
                          <span className="text-white text-sm">{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {typeof actions === 'function'
                            ? actions(row)
                            : actions.map((action, i) => (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                  className={clsx(
                                    'p-2 rounded-lg transition-colors',
                                    action.variant === 'danger'
                                      ? 'text-red-400 hover:bg-red-500/10'
                                      : 'text-white/50 hover:text-white hover:bg-white/10'
                                  )}
                                >
                                  {action.icon}
                                </button>
                              ))}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/30">
                      <Search className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">{emptyMessage}</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-noble-gray">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-surface border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={clsx(
                    'w-10 h-10 rounded-lg font-medium transition-all',
                    currentPage === pageNum
                      ? 'bg-primary text-background'
                      : 'bg-surface border border-white/10 text-white hover:bg-white/5'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-surface border border-white/10 text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
