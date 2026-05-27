"use client";
import { useEffect, useState } from 'react';
import { stagingService, StagedGroup, StagingSummary, StagingVariant, ImportLogItem, ImportScheduleStatus, FeedSuspendedGroup, categoryService, Category, ImportResultData } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, Package, Download, CloudDownload, ChevronLeft, ChevronRight, History, Edit3, Save, X, Clock, PauseCircle } from 'lucide-react';

type FilterTab = 'all' | 'staged' | 'ready' | 'rejected';

const BLOCKER_LABELS: Record<string, string> = {
    missing_price: 'Missing price',
    missing_image: 'Missing image',
    uncategorized: 'Uncategorized',
};

const WARNING_LABELS: Record<string, string> = {
    zero_stock: 'Zero stock',
};

export default function EditorialReview() {
    const [groups, setGroups] = useState<StagedGroup[]>([]);
    const [summary, setSummary] = useState<StagingSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [categories, setCategories] = useState<Category[]>([]);
    const [assignCategoryId, setAssignCategoryId] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isExternalImporting, setIsExternalImporting] = useState(false);
    const [lastImportResult, setLastImportResult] = useState<ImportResultData | null>(null);
    const [importSchedule, setImportSchedule] = useState<ImportScheduleStatus | null>(null);
    const [showFeedSuspended, setShowFeedSuspended] = useState(false);
    const [feedSuspendedItems, setFeedSuspendedItems] = useState<FeedSuspendedGroup[]>([]);
    const [feedSuspendedCount, setFeedSuspendedCount] = useState(0);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Import history
    const [showHistory, setShowHistory] = useState(false);
    const [historyItems, setHistoryItems] = useState<ImportLogItem[]>([]);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotalPages, setHistoryTotalPages] = useState(1);

    // Variant editing
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingVariants, setEditingVariants] = useState<StagingVariant[]>([]);

    useEffect(() => {
        loadData();
        loadCategories();
        loadImportSchedule();
    }, []);

    const loadImportSchedule = async () => {
        const res = await stagingService.getImportSchedule();
        if (!res.error && res.data) setImportSchedule(res.data);
    };

    useEffect(() => {
        setCurrentPage(1);
        loadGroups(1);
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([loadGroups(currentPage), loadSummary()]);
        if (showFeedSuspended) await loadFeedSuspended();
        setIsLoading(false);
    };

    const loadSummary = async () => {
        const res = await stagingService.getSummary();
        if (!res.error && res.data) {
            setSummary(res.data);
            setFeedSuspendedCount(res.data.feedSuspended ?? 0);
        }
    };

    const loadFeedSuspended = async () => {
        const res = await stagingService.getFeedSuspended(1);
        if (!res.error && res.data) {
            setFeedSuspendedItems(res.data.items);
            setFeedSuspendedCount(res.data.totalCount);
        }
    };

    const loadGroups = async (page: number = currentPage) => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const res = await stagingService.getAll(page, { status });
        if (!res.error && res.data) {
            setGroups(res.data.items || []);
            setCurrentPage(res.data.page);
            setTotalPages(res.data.totalPages);
            setTotalCount(res.data.totalCount);
        }
    };

    const loadCategories = async () => {
        const res = await categoryService.getAll(1, { leafOnly: true });
        if (!res.error) setCategories(res.data || []);
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        loadGroups(page);
        setSelected(new Set());
    };

    const loadHistory = async (page: number = 1) => {
        const res = await stagingService.getImportHistory(page);
        if (!res.error && res.data) {
            setHistoryItems(res.data.items);
            setHistoryPage(res.data.page);
            setHistoryTotalPages(res.data.totalPages);
        }
    };

    const openVariantEditor = async (groupId: string) => {
        const res = await stagingService.getGroupVariants(groupId);
        if (res.error) { toast.error(res.error); return; }
        setEditingVariants(res.data || []);
        setEditingGroupId(groupId);
    };

    const handleSaveVariant = async (variantId: string, data: {
        price?: number; listPrice?: number; description?: string; brand?: string;
        material?: string; color?: string; size?: string; stock?: number; imageUrls?: string[];
    }) => {
        const res = await stagingService.updateVariant(variantId, data);
        if (res.error) { toast.error(res.error); return; }
        toast.success('Variant updated');
        if (editingGroupId) await openVariantEditor(editingGroupId);
        await Promise.all([loadGroups(currentPage), loadSummary()]);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === groups.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(groups.map(g => g.id)));
        }
    };

    const handlePublish = async (ids: string[]) => {
        const res = await stagingService.publish(ids);
        if (res.error) {
            toast.error(`Publish failed: ${res.error}`);
            return;
        }
        const data = res.data!;
        if (data.published.length > 0)
            toast.success(`Published ${data.published.length} group(s)`);
        if (data.blocked.length > 0)
            toast.warn(`${data.blocked.length} group(s) blocked: ${data.blocked.map(b => b.blockers.join(', ')).join('; ')}`);
        setSelected(new Set());
        await loadData();
    };

    const handleReject = async (ids: string[]) => {
        const res = await stagingService.reject(ids);
        if (res.error) { toast.error(`Reject failed: ${res.error}`); return; }
        toast.success(`Rejected ${ids.length} group(s)`);
        setSelected(new Set());
        await loadData();
    };

    const handleRestage = async (ids: string[]) => {
        const res = await stagingService.restage(ids);
        if (res.error) { toast.error(`Restage failed: ${res.error}`); return; }
        toast.success(`Restaged ${ids.length} group(s)`);
        setSelected(new Set());
        await loadData();
    };

    const handleAssignCategory = async (groupId: string, categoryId: string) => {
        const res = await stagingService.assignCategory(groupId, categoryId);
        if (res.error) { toast.error(`Assign failed: ${res.error}`); return; }
        toast.success('Category assigned (mapping saved)');
        await loadData();
    };

    const handleBulkAssign = async () => {
        if (!assignCategoryId || selected.size === 0) return;
        const res = await stagingService.bulkAssignCategory(Array.from(selected), assignCategoryId);
        if (res.error) { toast.error(`Bulk assign failed: ${res.error}`); return; }
        toast.success(`Assigned category to ${selected.size} group(s)`);
        setSelected(new Set());
        setAssignCategoryId('');
        await loadData();
    };

    const handleRunTestImport = async () => {
        setIsImporting(true);
        setLastImportResult(null);
        const res = await stagingService.runTestImport();
        setIsImporting(false);
        if (res.error) {
            toast.error(`Import failed: ${res.error}`);
            return;
        }
        const data = res.data!;
        setLastImportResult(data);
        toast.success(`Import complete: ${data.staged} staged, ${data.updated} updated, ${data.skipped} skipped`);
        setCurrentPage(1);
        await Promise.all([loadGroups(1), loadSummary(), loadImportSchedule()]);
    };

    const handleRunExternalImport = async () => {
        setIsExternalImporting(true);
        setLastImportResult(null);
        const res = await stagingService.runExternalImport();
        setIsExternalImporting(false);
        if (res.error) {
            toast.error(`External import failed: ${res.error}`);
            return;
        }
        const data = res.data!;
        setLastImportResult(data);
        toast.success(`External import complete: ${data.staged} staged, ${data.updated} updated, ${data.skipped} skipped`);
        setCurrentPage(1);
        await Promise.all([loadGroups(1), loadSummary(), loadImportSchedule()]);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-white">
                <div className="h-12 w-12 border-4 border-[#4a3a3a] border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading staging data...</p>
            </div>
        );
    }

    const tabs: { id: FilterTab; label: string; count: number }[] = [
        { id: 'all', label: 'All non-published', count: summary?.total ?? 0 },
        { id: 'staged', label: 'Staged', count: summary?.staged ?? 0 },
        { id: 'ready', label: 'Ready', count: summary?.ready ?? 0 },
        { id: 'rejected', label: 'Rejected', count: summary?.rejected ?? 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Import Triggers */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a]">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white">Import Products</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Ingest product data into the staging pipeline. Items will appear below for review.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRunTestImport}
                        disabled={isImporting || isExternalImporting}
                        className="px-4 py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:opacity-50 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
                    >
                        {isImporting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Sample Data
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleRunExternalImport}
                        disabled={isImporting || isExternalImporting}
                        className="px-4 py-2.5 bg-[#4a3a3a] hover:bg-[#5a4a4a] disabled:opacity-50 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
                    >
                        {isExternalImporting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <CloudDownload className="w-4 h-4" />
                                Import from TestApi
                            </>
                        )}
                    </button>
                </div>
                {importSchedule && (
                    <div className="w-full pt-3 mt-1 border-t border-[#3a3a3a] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>
                            Auto-import:{' '}
                            <strong className={importSchedule.enabled ? 'text-green-400' : 'text-gray-500'}>
                                {importSchedule.enabled ? 'On' : 'Off'}
                            </strong>
                            {importSchedule.enabled && (
                                <> · every <strong className="text-gray-300">{importSchedule.intervalMinutes}</strong> min</>
                            )}
                        </span>
                        {importSchedule.catalogueBaseUrl && (
                            <span className="font-mono truncate max-w-xs" title={importSchedule.catalogueBaseUrl}>
                                {importSchedule.catalogueBaseUrl}
                            </span>
                        )}
                        {importSchedule.importInProgress && (
                            <span className="text-yellow-400">Import running…</span>
                        )}
                        {importSchedule.lastScheduledRun && (
                            <span>
                                Last auto-run:{' '}
                                <strong className="text-gray-300">
                                    {new Date(importSchedule.lastScheduledRun.startedAt).toLocaleString()}
                                </strong>
                                {' '}({importSchedule.lastScheduledRun.status})
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Last Import Result */}
            {lastImportResult && (
                <div className="p-4 bg-green-400/5 border border-green-400/20 rounded-xl text-sm space-y-1">
                    <div className="font-medium text-green-400">Import Complete</div>
                    <div className="text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Staged: <strong>{lastImportResult.staged}</strong></span>
                        <span>Updated: <strong>{lastImportResult.updated}</strong></span>
                        <span>Skipped: <strong>{lastImportResult.skipped}</strong></span>
                        <span>Auto-categorized: <strong>{lastImportResult.autoCategorized}</strong></span>
                        <span>Uncategorized: <strong>{lastImportResult.uncategorized}</strong></span>
                        {lastImportResult.orphaned > 0 && <span className="text-purple-400">Orphaned: <strong>{lastImportResult.orphaned}</strong></span>}
                        {lastImportResult.unpublished > 0 && <span className="text-red-400">To review (staged): <strong>{lastImportResult.unpublished}</strong></span>}
                        {lastImportResult.feedSuspended > 0 && <span className="text-amber-400">Feed-paused: <strong>{lastImportResult.feedSuspended}</strong></span>}
                        {lastImportResult.feedRestored > 0 && <span className="text-emerald-400">Feed-restored: <strong>{lastImportResult.feedRestored}</strong></span>}
                        {lastImportResult.reappeared > 0 && <span className="text-emerald-400">Reappeared: <strong>{lastImportResult.reappeared}</strong></span>}
                    </div>
                    {lastImportResult.feedPauseApplied && (
                        <div className="mt-2 p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg text-amber-300 text-xs">
                            Supplier feed unavailable or empty. Published items are <strong>hidden from the store</strong> but kept as published — they will reappear automatically when the feed returns.
                        </div>
                    )}
                    {lastImportResult.orphanAborted && (
                        <div className="mt-2 p-3 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-xs">
                            <strong>Orphan detection aborted:</strong> More than 50% of published items from this source were missing from the feed. This could indicate a broken or partial feed. No items were unpublished. Check the supplier feed and re-import.
                        </div>
                    )}
                    {lastImportResult.warnings.length > 0 && (
                        <div className="text-yellow-400 mt-1">
                            {lastImportResult.warnings.filter(w => w.externalId !== '_SYSTEM').length} item(s) with issues:
                            {lastImportResult.warnings.filter(w => w.externalId !== '_SYSTEM').slice(0, 5).map(w => (
                                <span key={w.externalId} className="ml-2 text-xs text-gray-400">
                                    {w.externalId} ({w.issues.join(', ')})
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryCard label="Staged" value={summary.staged} color="text-yellow-400" />
                    <SummaryCard label="Ready" value={summary.ready} color="text-blue-400" />
                    <SummaryCard label="Missing Price" value={summary.missingPrice} color="text-red-400" />
                    <SummaryCard label="Missing Image" value={summary.missingImage} color="text-red-400" />
                    <SummaryCard label="Uncategorized" value={summary.uncategorized} color="text-orange-400" />
                    <SummaryCard label="Zero Stock" value={summary.zeroStock} color="text-gray-400" />
                    <SummaryCard label="Orphaned" value={summary.orphaned} color="text-purple-400" />
                    <SummaryCard label="Feed Paused" value={summary.feedSuspended} color="text-amber-400" />
                    <SummaryCard label="Rejected" value={summary.rejected} color="text-red-500" />
                    <SummaryCard label="Total Pending" value={summary.total} color="text-white" />
                </div>
            )}

            {/* Feed-paused listings (hidden from store, auto-restore when feed returns) */}
            {feedSuspendedCount > 0 && (
                <div className="bg-[#2a2a2a] rounded-xl border border-amber-400/30 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => {
                            const next = !showFeedSuspended;
                            setShowFeedSuspended(next);
                            if (next) loadFeedSuspended();
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#333] transition"
                    >
                        <span className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                            <PauseCircle className="w-4 h-4" />
                            Feed-paused ({feedSuspendedCount}) — hidden from store, data kept
                        </span>
                        <span className="text-xs text-gray-500">{showFeedSuspended ? 'Hide' : 'Show'}</span>
                    </button>
                    {showFeedSuspended && (
                        <ul className="divide-y divide-[#3a3a3a] border-t border-[#3a3a3a] max-h-48 overflow-y-auto">
                            {feedSuspendedItems.map(item => (
                                <li key={item.id} className="px-4 py-2 flex items-center gap-3 text-sm">
                                    {item.primaryImageUrl ? (
                                        <img src={item.primaryImageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-[#3a3a3a]" />
                                    )}
                                    <span className="text-white truncate flex-1">{item.name}</span>
                                    <span className="text-xs text-gray-500 shrink-0">
                                        {item.feedSuspendedAt ? new Date(item.feedSuspendedAt).toLocaleString() : '—'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-[#3a3a3a] pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSelected(new Set()); }}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                            activeTab === tab.id
                                ? 'bg-[#3a3a3a] text-white'
                                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Bulk Actions */}
            {selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                    <span className="text-sm text-gray-300">{selected.size} selected</span>
                    <button
                        onClick={() => handlePublish(Array.from(selected))}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1.5"
                    >
                        <CheckCircle className="w-4 h-4" /> Publish
                    </button>
                    <button
                        onClick={() => handleReject(Array.from(selected))}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition flex items-center gap-1.5"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    {activeTab === 'rejected' && (
                        <button
                            onClick={() => handleRestage(Array.from(selected))}
                            className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-4 h-4" /> Restage
                        </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                        <select
                            value={assignCategoryId}
                            onChange={e => setAssignCategoryId(e.target.value)}
                            className="px-3 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white text-sm"
                        >
                            <option value="">Assign category...</option>
                            {categories.map(c => (
                                <option key={String(c.id)} value={String(c.id)}>
                                    {c.parentCategoryName ? `${c.parentCategoryName} > ` : ''}{c.name}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleBulkAssign}
                            disabled={!assignCategoryId}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg transition"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}

            {/* Groups Table */}
            <div className="bg-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden border border-[#3a3a3a]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#3a3a3a] border-b border-[#4a4a4a]">
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={groups.length > 0 && selected.size === groups.length}
                                        onChange={toggleAll}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Supplier Hint</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Issues</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Variants</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3a]">
                            {groups.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                        No items in this view
                                    </td>
                                </tr>
                            ) : (
                                groups.map(g => (
                                    <StagedGroupRow
                                        key={g.id}
                                        group={g}
                                        isSelected={selected.has(g.id)}
                                        onToggle={() => toggleSelect(g.id)}
                                        categories={categories}
                                        onPublish={() => handlePublish([g.id])}
                                        onReject={() => handleReject([g.id])}
                                        onRestage={() => handleRestage([g.id])}
                                        onAssignCategory={(catId) => handleAssignCategory(g.id, catId)}
                                        onEditVariants={() => openVariantEditor(g.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Showing {groups.length} of {totalCount} items</span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="p-1.5 rounded-lg hover:bg-[#3a3a3a] disabled:opacity-30 transition text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) {
                                pageNum = i + 1;
                            } else if (currentPage <= 4) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 3) {
                                pageNum = totalPages - 6 + i;
                            } else {
                                pageNum = currentPage - 3 + i;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                                        currentPage === pageNum
                                            ? 'bg-[#4a3a3a] text-white'
                                            : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="p-1.5 rounded-lg hover:bg-[#3a3a3a] disabled:opacity-30 transition text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <button
                    onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-xs"
                >
                    <History className="w-3.5 h-3.5" /> Import History
                </button>
            </div>

            {/* Import History Panel */}
            {showHistory && (
                <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] overflow-hidden">
                    <div className="px-4 py-3 bg-[#3a3a3a] border-b border-[#4a4a4a] flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Import History</h3>
                        <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[#3a3a3a]">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Source</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Status</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Staged</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Updated</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Skipped</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Warnings</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3a3a3a]">
                                {historyItems.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No import history yet</td></tr>
                                ) : historyItems.map(h => (
                                    <tr key={h.id} className="hover:bg-[#333] transition">
                                        <td className="px-4 py-2 text-gray-300">{new Date(h.startedAt).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-gray-300">{h.source}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                h.status === 'Completed' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                                            }`}>{h.status}</span>
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-300">{h.itemsStaged}</td>
                                        <td className="px-4 py-2 text-right text-gray-300">{h.itemsUpdated}</td>
                                        <td className="px-4 py-2 text-right text-gray-300">{h.itemsSkipped}</td>
                                        <td className="px-4 py-2 text-right text-yellow-400">{h.warningCount}</td>
                                        <td className="px-4 py-2 text-right text-gray-400">{h.durationMs}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {historyTotalPages > 1 && (
                        <div className="flex justify-center gap-2 py-3 border-t border-[#3a3a3a]">
                            <button onClick={() => { setHistoryPage(p => Math.max(1, p - 1)); loadHistory(Math.max(1, historyPage - 1)); }} disabled={historyPage <= 1} className="px-3 py-1 text-xs bg-[#3a3a3a] rounded disabled:opacity-30 text-white">Prev</button>
                            <span className="text-xs text-gray-400 py-1">Page {historyPage} of {historyTotalPages}</span>
                            <button onClick={() => { setHistoryPage(p => Math.min(historyTotalPages, p + 1)); loadHistory(Math.min(historyTotalPages, historyPage + 1)); }} disabled={historyPage >= historyTotalPages} className="px-3 py-1 text-xs bg-[#3a3a3a] rounded disabled:opacity-30 text-white">Next</button>
                        </div>
                    )}
                </div>
            )}

            {/* Variant Editor Modal */}
            {editingGroupId && (
                <VariantEditorModal
                    groupId={editingGroupId}
                    groupName={groups.find(g => g.id === editingGroupId)?.name ?? ''}
                    variants={editingVariants}
                    onSave={handleSaveVariant}
                    onClose={() => { setEditingGroupId(null); setEditingVariants([]); }}
                />
            )}
        </div>
    );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="bg-[#2a2a2a] rounded-xl p-4 border border-[#3a3a3a]">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        Staged: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
        Ready: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
        Published: 'bg-green-400/10 text-green-400 border-green-400/20',
        Rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'text-gray-400'}`}>
            {status}
        </span>
    );
}

function StagedGroupRow({
    group,
    isSelected,
    onToggle,
    categories,
    onPublish,
    onReject,
    onRestage,
    onAssignCategory,
    onEditVariants,
}: {
    group: StagedGroup;
    isSelected: boolean;
    onToggle: () => void;
    categories: Category[];
    onPublish: () => void;
    onReject: () => void;
    onRestage: () => void;
    onAssignCategory: (categoryId: string) => void;
    onEditVariants: () => void;
}) {
    const [showCatSelect, setShowCatSelect] = useState(false);

    return (
        <tr className="hover:bg-[#333333] transition">
            <td className="px-4 py-3">
                <input type="checkbox" checked={isSelected} onChange={onToggle} className="w-4 h-4" />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    {group.primaryImageUrl ? (
                        <img
                            src={group.primaryImageUrl}
                            alt={group.name}
                            className="w-10 h-10 rounded object-cover flex-shrink-0 border border-[#3a3a3a]"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded bg-[#3a3a3a] flex items-center justify-center flex-shrink-0 text-gray-500 text-xs">
                            N/A
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{group.name}</div>
                        <div className="text-xs text-gray-500">{group.objectId}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <StatusBadge status={group.publishStatus} />
                    {group.isOrphaned && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-400/15 text-purple-400 border border-purple-400/30" title={`Disappeared from supplier feed${group.orphanedAt ? ` on ${new Date(group.orphanedAt).toLocaleDateString()}` : ''}`}>
                            ORPHAN
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                {showCatSelect ? (
                    <select
                        autoFocus
                        defaultValue=""
                        onChange={e => { onAssignCategory(e.target.value); setShowCatSelect(false); }}
                        onBlur={() => setShowCatSelect(false)}
                        className="px-2 py-1 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-xs"
                    >
                        <option value="" disabled>Select...</option>
                        {categories.map(c => (
                            <option key={String(c.id)} value={String(c.id)}>
                                {c.parentCategoryName ? `${c.parentCategoryName} > ` : ''}{c.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <button
                        onClick={() => setShowCatSelect(true)}
                        className="text-sm text-gray-300 hover:text-white transition"
                        title="Click to change category"
                    >
                        {group.parentCategoryName && <span className="text-gray-500">{group.parentCategoryName} &gt; </span>}
                        {group.categoryName}
                    </button>
                )}
            </td>
            <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate" title={group.rawCategoryHint || ''}>
                {group.rawCategoryHint || '—'}
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                    {group.blockers.map(b => (
                        <span key={b} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-red-400/10 text-red-400 border border-red-400/20">
                            <AlertTriangle className="w-3 h-3" /> {BLOCKER_LABELS[b] || b}
                        </span>
                    ))}
                    {group.warnings.map(w => (
                        <span key={w} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                            {WARNING_LABELS[w] || w}
                        </span>
                    ))}
                    {group.blockers.length === 0 && group.warnings.length === 0 && (
                        <span className="text-xs text-green-400">Ready</span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                    <Package className="w-3.5 h-3.5" /> {group.variantCount}
                </span>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex gap-1 justify-end">
                    <button
                        onClick={onEditVariants}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition"
                        title="Edit variants"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    {group.publishStatus !== 'Rejected' && (
                        <>
                            <button
                                onClick={onPublish}
                                className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition"
                                title="Publish"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onReject}
                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                title="Reject"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {group.publishStatus === 'Rejected' && (
                        <button
                            onClick={onRestage}
                            className="p-1.5 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition"
                            title="Restage"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function VariantEditorModal({
    groupId,
    groupName,
    variants,
    onSave,
    onClose,
}: {
    groupId: string;
    groupName: string;
    variants: StagingVariant[];
    onSave: (variantId: string, data: Record<string, any>) => void;
    onClose: () => void;
}) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<Record<string, any>>({});

    const startEdit = (v: StagingVariant) => {
        setEditingId(v.id);
        setForm({
            price: v.price,
            listPrice: v.listPrice ?? '',
            description: v.description ?? '',
            brand: v.brand ?? '',
            material: v.material ?? '',
            color: v.color,
            size: v.size,
            stock: v.stock,
            imageUrls: v.images.map(i => i.url).join('\n'),
        });
    };

    const saveEdit = () => {
        if (!editingId) return;
        const imageUrls = (form.imageUrls as string).split('\n').map((u: string) => u.trim()).filter(Boolean);
        onSave(editingId, {
            price: Number(form.price) || undefined,
            listPrice: form.listPrice ? Number(form.listPrice) : undefined,
            description: form.description || undefined,
            brand: form.brand || undefined,
            material: form.material || undefined,
            color: form.color || undefined,
            size: form.size || undefined,
            stock: Number(form.stock) ?? undefined,
            imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        });
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="bg-[#1f1f1f] rounded-2xl border border-[#3a3a3a] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 bg-[#2a2a2a] border-b border-[#3a3a3a] flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Edit Variants</h3>
                        <p className="text-sm text-gray-400">{groupName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#3a3a3a] transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-4">
                    {variants.map(v => (
                        <div key={v.id} className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-4">
                            <div className="flex items-start gap-4">
                                {v.images[0] ? (
                                    <img src={v.images[0].url} alt={v.sku} className="w-16 h-16 rounded object-cover flex-shrink-0 border border-[#3a3a3a]" />
                                ) : (
                                    <div className="w-16 h-16 rounded bg-[#3a3a3a] flex items-center justify-center flex-shrink-0 text-gray-500 text-xs">N/A</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-gray-300">{v.sku}</span>
                                        <span className="text-xs text-gray-500">{v.color} / {v.size}</span>
                                        <span className="text-sm font-bold text-white">${v.price.toFixed(2)}</span>
                                        {v.listPrice && <span className="text-xs text-gray-500 line-through">${v.listPrice.toFixed(2)}</span>}
                                        <span className={`text-xs ${v.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>{v.stock} in stock</span>
                                    </div>

                                    {editingId === v.id ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Price</label>
                                                <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">List Price</label>
                                                <input type="number" step="0.01" value={form.listPrice} onChange={e => setForm(f => ({ ...f, listPrice: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Stock</label>
                                                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Color</label>
                                                <input type="text" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Size</label>
                                                <input type="text" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Brand</label>
                                                <input type="text" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block mb-1">Material</label>
                                                <input type="text" value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm" />
                                            </div>
                                            <div className="col-span-2 md:col-span-4">
                                                <label className="text-xs text-gray-500 block mb-1">Description</label>
                                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm resize-none" />
                                            </div>
                                            <div className="col-span-2 md:col-span-4">
                                                <label className="text-xs text-gray-500 block mb-1">Image URLs (one per line)</label>
                                                <textarea value={form.imageUrls} onChange={e => setForm(f => ({ ...f, imageUrls: e.target.value }))} rows={3} className="w-full px-2 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded text-white text-sm font-mono resize-none" />
                                            </div>
                                            <div className="col-span-2 md:col-span-4 flex gap-2">
                                                <button onClick={saveEdit} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition flex items-center gap-1.5">
                                                    <Save className="w-3.5 h-3.5" /> Save
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-sm rounded-lg transition">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">{v.description?.slice(0, 80)}{(v.description?.length ?? 0) > 80 ? '...' : ''}</span>
                                            <button onClick={() => startEdit(v)} className="ml-auto text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1">
                                                <Edit3 className="w-3 h-3" /> Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
