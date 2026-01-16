// ============================================
// File: components/admin/BaseCRUDComponent.tsx
// ============================================
"use client";
import { ReactNode, useState, Fragment } from 'react';
import { Trash2, Edit, Plus, Search, X, ChevronDown, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import FullScreenPopup from '../Popups/FullScreenPopup';
import React from 'react';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => ReactNode;
    sortable?: boolean;
    searchable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export interface BaseCRUDProps<T extends { id: number | string }> {
    data: { items: T[]; totalCount: number };
    columns: Column<T>[];
    onDelete: (id: number | string) => Promise<void> | void;
    onEdit?: (item: T) => void;
    onAdd?: () => void;
    renderForm?: (item: T | null, onClose: () => void) => ReactNode;
    customFormClose?: () => void;
    isLoading?: boolean;
    title?: string;
    searchPlaceholder?: string;
    allowAdd?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    customActions?: (item: T) => ReactNode;
    handleDelete?: (id: number | string) => Promise<void> | void;
    renderDeleteForm?: (
        item: T,
        onSubmit: (extra: any) => void,
        onCancel: () => void
    ) => ReactNode;
    onDeleteWithExtra?: (item: T, extra: any) => Promise<void> | void;
    onLoadMore?: () => Promise<void>;
    isLoadingMore?: boolean;
}

export function BaseCRUDComponent<T extends { id: number | string }>({
    data,
    columns,
    onDelete,
    onEdit,
    onAdd,
    renderForm,
    customFormClose,
    isLoading = false,
    title,
    searchPlaceholder = "Search...",
    allowAdd = true,
    allowEdit = true,
    allowDelete = true,
    customActions,
    handleDelete = async (id: string | number) => { if (confirm('Are you sure you want to delete this item?')) { await onDelete(id); } },
    renderDeleteForm,
    onDeleteWithExtra,
    onLoadMore,
    isLoadingMore = false,
}: BaseCRUDProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [deletingItem, setDeletingItem] = useState<T | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<number | string>>(new Set());
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const items = data.items;
    const totalCount = data.totalCount;

    const handleEdit = (item: T) => {
        setEditingItem(item);
        if (onEdit) {
            onEdit(item);
        }
        if (renderForm) {
            setIsModalOpen(true);
        }
    };

    const handleAdd = () => {
        setEditingItem(null);
        if (onAdd) {
            onAdd();
        }
        if (renderForm) {
            setIsModalOpen(true);
        }
    };

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortDirection(null);
                setSortColumn(null);
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const getSortValue = (item: T, columnKey: string): any => {
        const value = item[columnKey as keyof T];

        // Handle null/undefined
        if (value === null || value === undefined) return '';

        // Handle numbers
        if (typeof value === 'number') return value;

        // Handle booleans
        if (typeof value === 'boolean') return value ? 1 : 0;

        // Handle dates (check if string looks like a date)
        if (typeof value === 'string') {
            const dateValue = new Date(value);
            if (!isNaN(dateValue.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                return dateValue.getTime();
            }
            return value.toLowerCase();
        }

        // Handle objects/arrays - convert to string for sorting
        if (typeof value === 'object') {
            if (Array.isArray(value)) return value.length;
            return JSON.stringify(value).toLowerCase();
        }

        return String(value).toLowerCase();
    };

    const filteredData = items.filter(item => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return columns.some(col => {
            if (col.searchable === false) return false;
            const value = item[col.key as keyof T];
            return String(value).toLowerCase().includes(searchLower);
        });
    });

    // Apply sorting
    const sortedData = sortColumn && sortDirection
        ? [...filteredData].sort((a, b) => {
            const aValue = getSortValue(a, sortColumn);
            const bValue = getSortValue(b, sortColumn);

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        })
        : filteredData;

    const toggleRowExpansion = (id: number | string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const hasExpandableData = (item: T): boolean => {
        return columns.some(col => {
            const value = item[col.key as keyof T];
            if (value === null || value === undefined) return false;
            if (typeof value !== 'object') return false;
            if (Array.isArray(value)) return value.length > 0;
            return Object.keys(value).length > 0;
        });
    };

    const renderExpandedContent = (item: T): ReactNode => {
        const expandableColumns = columns.filter(col => {
            const value = item[col.key as keyof T];
            if (value === null || value === undefined) return false;
            if (typeof value !== 'object') return false;
            if (Array.isArray(value)) return value.length > 0;
            return Object.keys(value).length > 0;
        });

        if (expandableColumns.length === 0) return null;

        return (
            <div className="p-4 bg-[#252525] space-y-4">
                {expandableColumns.map(col => {
                    const value = item[col.key as keyof T] as any;

                    // Handle arrays - HORIZONTAL TABLE LAYOUT
                    if (Array.isArray(value)) {
                        // Get all unique keys from array items
                        const allKeys = new Set<string>();
                        value.forEach((arrayItem: any) => {
                            if (typeof arrayItem === 'object' && arrayItem !== null) {
                                Object.keys(arrayItem).forEach(key => allKeys.add(key));
                            }
                        });
                        const keys = Array.from(allKeys);

                        return (
                            <div key={String(col.key)} className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                    {col.label} ({value.length} {value.length === 1 ? 'item' : 'items'})
                                </h4>
                                <div className="bg-[#2a2a2a] rounded-lg p-3 border border-[#3a3a3a] overflow-x-auto">
                                    {value.length > 0 && typeof value[0] === 'object' && value[0] !== null ? (
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-[#3a3a3a]">
                                                    {keys.map(key => (
                                                        <th key={key} className="py-2 px-3 text-left text-gray-400 font-medium text-xs uppercase">
                                                            {key}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#3a3a3a]">
                                                {value.map((arrayItem: any, index: number) => (
                                                    <tr key={index} className="hover:bg-[#333333]">
                                                        {keys.map(key => (
                                                            <td key={key} className="py-2 px-3 text-gray-300">
                                                                {typeof arrayItem[key] === 'object' && arrayItem[key] !== null
                                                                    ? JSON.stringify(arrayItem[key], null, 2)
                                                                    : String(arrayItem[key] ?? '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-gray-300 text-sm">
                                            {value.map((arrayItem: any, index: number) => (
                                                <div key={index} className="py-1">
                                                    {String(arrayItem)}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Handle plain objects - HORIZONTAL TABLE LAYOUT
                    return (
                        <div key={String(col.key)} className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                {col.label}
                            </h4>
                            <div className="bg-[#2a2a2a] rounded-lg p-3 border border-[#3a3a3a] overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[#3a3a3a]">
                                            {Object.keys(value).map((key) => (
                                                <th key={key} className="py-2 px-3 text-left text-gray-400 font-medium text-xs uppercase">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-[#333333]">
                                            {Object.entries(value).map(([key, val]) => (
                                                <td key={key} className="py-2 px-3 text-gray-300">
                                                    {typeof val === 'object' && val !== null
                                                        ? JSON.stringify(val, null, 2)
                                                        : String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getCellValue = (item: T, column: Column<T>): ReactNode => {
        if (column.render) {
            return column.render(item);
        }
        const value = item[column.key as keyof T];
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (value === null || value === undefined) {
            return null;
        }
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'bigint') {
            return String(value);
        }
        // For arrays, show a badge indicating expandable content
        if (Array.isArray(value)) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-400/10 text-purple-400 border border-purple-400/20">
                    Array ({value.length} {value.length === 1 ? 'item' : 'items'})
                </span>
            );
        }
        // For objects, show a badge indicating expandable content
        if (typeof value === 'object') {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">
                    Object ({Object.keys(value).length} fields)
                </span>
            );
        }
        // For objects or possible React nodes, cast to ReactNode as a best-effort fallback
        return (value as unknown) as ReactNode;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-white">
                <div className="h-12 w-12 border-4 border-[#4a3a3a] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading {title || 'data'}...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative flex-1 max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5a4a4a] focus:border-transparent transition"
                    />
                </div>
                {allowAdd && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white rounded-lg transition font-medium shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Add New
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden border border-[#3a3a3a]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#3a3a3a] border-b border-[#4a4a4a]">
                                <th className="px-6 py-4 w-8"></th>
                                {columns.map(column => {
                                    const isSortable = column.sortable !== false;
                                    const isSorted = sortColumn === String(column.key);

                                    return (
                                        <th
                                            key={String(column.key)}
                                            className={`px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider ${isSortable ? 'cursor-pointer select-none hover:bg-[#4a4a4a] transition-colors' : ''}`}
                                            onClick={() => isSortable && handleSort(String(column.key))}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{column.label}</span>
                                                {isSortable && (
                                                    <span className="text-gray-500">
                                                        {isSorted ? (
                                                            sortDirection === 'asc' ? (
                                                                <ArrowUp className="w-4 h-4 text-blue-400" />
                                                            ) : (
                                                                <ArrowDown className="w-4 h-4 text-blue-400" />
                                                            )
                                                        ) : (
                                                            <ArrowUpDown className="w-4 h-4" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                                {(allowEdit || allowDelete || customActions) && (
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3a]">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-gray-400">
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                sortedData.map((item) => {
                                    const isExpanded = expandedRows.has(item.id);
                                    const canExpand = hasExpandableData(item);

                                    return (
                                        <Fragment key={item.id}>
                                            <tr className="hover:bg-[#333333] transition">
                                                <td className="px-6 py-4">
                                                    {canExpand && (
                                                        <button
                                                            onClick={() => toggleRowExpansion(item.id)}
                                                            className="text-gray-400 hover:text-gray-200 transition"
                                                            title={isExpanded ? "Collapse" : "Expand"}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronRight className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                                {columns.map(column => (
                                                    <td key={String(column.key)} className="px-6 py-4 text-sm text-gray-300">
                                                        {getCellValue(item, column)}
                                                    </td>
                                                ))}
                                                {(allowEdit || allowDelete || customActions) && (
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            {customActions && customActions(item)}
                                                            {allowEdit && (
                                                                <button
                                                                    onClick={() => handleEdit(item)}
                                                                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {allowDelete && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (renderDeleteForm) {
                                                                            setDeletingItem(item);
                                                                            setIsDeleteOpen(true);
                                                                        } else {
                                                                            handleDelete(item.id);
                                                                        }
                                                                    }}
                                                                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                            {isExpanded && canExpand && (
                                                <tr>
                                                    <td colSpan={columns.length + 2} className="p-0">
                                                        {renderExpandedContent(item)}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-400">
                <span>Total: {totalCount} items</span>
                <span>Showing: {sortedData.length} items</span>
                {sortColumn && sortDirection && (
                    <span className="text-blue-400">
                        Sorted by: {columns.find(c => String(c.key) === sortColumn)?.label} ({sortDirection === 'asc' ? '↑' : '↓'})
                    </span>
                )}
            </div>

            {/* Load More Button */}
            {onLoadMore && items.length < totalCount && (
                <div className="flex justify-center">
                    <button
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="px-6 py-3 bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white rounded-lg transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoadingMore ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                Load More ({items.length} of {totalCount})
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Modal */}
            {renderForm && (
                <FullScreenPopup
                    onClose={() => {
                        setIsModalOpen(false);
                        if (customFormClose) customFormClose();
                    }}
                    open={isModalOpen}
                    childSize={{
                        width: "w-[90vw] sm:w-[35rem]",
                        height: "h-fit",
                    }}
                >
                    {renderForm(editingItem, () => setIsModalOpen(false))}
                </FullScreenPopup>
            )}
            {renderDeleteForm && deletingItem && (
                <FullScreenPopup
                    open={isDeleteOpen}
                    onClose={() => { setIsDeleteOpen(false); setDeletingItem(null); }}
                    childSize={{ width: "w-[90vw] sm:w-[30rem]", height: "h-fit" }}
                >
                    {renderDeleteForm(deletingItem, async (extra) => {
                        if (onDeleteWithExtra) {
                            await onDeleteWithExtra(deletingItem, extra);
                        } else {
                            await onDelete(deletingItem.id); // fallback
                        }
                        setIsDeleteOpen(false);
                        setDeletingItem(null);
                    }, () => {
                        setIsDeleteOpen(false);
                        setDeletingItem(null);
                    })}
                </FullScreenPopup>
            )}
        </div>
    );
}