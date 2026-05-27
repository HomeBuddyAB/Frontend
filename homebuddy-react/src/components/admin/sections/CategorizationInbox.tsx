"use client";
import { useEffect, useState } from 'react';
import {
    stagingService,
    StagedGroup,
    categoryService,
    Category,
    categoryMappingService,
    CategoryMappingItem,
} from '@/lib/services/adminServices';
import { toast } from 'react-toastify';
import { FolderTree, CheckCircle, Trash2, Plus, ArrowRight } from 'lucide-react';

export default function CategorizationInbox() {
    const [uncategorized, setUncategorized] = useState<StagedGroup[]>([]);
    const [mappings, setMappings] = useState<CategoryMappingItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [parentCategories, setParentCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkCategoryId, setBulkCategoryId] = useState('');
    const [activeView, setActiveView] = useState<'inbox' | 'mappings'>('inbox');

    // New mapping form
    const [newTerm, setNewTerm] = useState('');
    const [newSubcategoryId, setNewSubcategoryId] = useState('');

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setIsLoading(true);
        await Promise.all([loadUncategorized(), loadCategories(), loadMappings()]);
        setIsLoading(false);
    };

    const loadUncategorized = async () => {
        const res = await stagingService.getAll(1, { uncategorizedOnly: true });
        if (!res.error && res.data) setUncategorized(res.data.items || []);
    };

    const loadCategories = async () => {
        const [leafRes, parentRes] = await Promise.all([
            categoryService.getAll(1, { leafOnly: true }),
            categoryService.getAll(1, { parentsOnly: true }),
        ]);
        if (!leafRes.error) setCategories(leafRes.data || []);
        if (!parentRes.error) setParentCategories(parentRes.data || []);
    };

    const loadMappings = async () => {
        const res = await categoryMappingService.getAll(1);
        if (!res.error) setMappings(res.data || []);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleAssignSingle = async (groupId: string, categoryId: string) => {
        const res = await stagingService.assignCategory(groupId, categoryId, true);
        if (res.error) { toast.error(res.error); return; }
        toast.success('Assigned & mapping saved');
        await Promise.all([loadUncategorized(), loadMappings()]);
    };

    const handleBulkAssign = async () => {
        if (!bulkCategoryId || selected.size === 0) return;
        const res = await stagingService.bulkAssignCategory(Array.from(selected), bulkCategoryId, true);
        if (res.error) { toast.error(res.error); return; }
        toast.success(`Assigned ${selected.size} group(s)`);
        setSelected(new Set());
        setBulkCategoryId('');
        await Promise.all([loadUncategorized(), loadMappings()]);
    };

    const handleDeleteMapping = async (id: number) => {
        if (!confirm('Delete this mapping?')) return;
        const res = await categoryMappingService.delete(id);
        if (res.error) { toast.error(res.error); return; }
        toast.success('Mapping deleted');
        await loadMappings();
    };

    const handleCreateMapping = async () => {
        if (!newTerm.trim() || !newSubcategoryId) {
            toast.error('Supplier term and subcategory are required');
            return;
        }
        const res = await categoryMappingService.create(newTerm.trim(), newSubcategoryId);
        if (res.error) { toast.error(res.error); return; }
        toast.success('Mapping created');
        setNewTerm('');
        setNewSubcategoryId('');
        await loadMappings();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-white">
                <div className="h-12 w-12 border-4 border-[#4a3a3a] border-t-transparent rounded-full animate-spin mb-4" />
                <p>Loading categorization data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex gap-2 border-b border-[#3a3a3a] pb-2">
                <button
                    onClick={() => setActiveView('inbox')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeView === 'inbox' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                >
                    Uncategorized Inbox ({uncategorized.length})
                </button>
                <button
                    onClick={() => setActiveView('mappings')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                        activeView === 'mappings' ? 'bg-[#3a3a3a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                >
                    Category Mappings ({mappings.length})
                </button>
            </div>

            {activeView === 'inbox' ? (
                <InboxView
                    groups={uncategorized}
                    categories={categories}
                    selected={selected}
                    bulkCategoryId={bulkCategoryId}
                    onToggleSelect={toggleSelect}
                    onToggleAll={() => {
                        if (selected.size === uncategorized.length) setSelected(new Set());
                        else setSelected(new Set(uncategorized.map(g => g.id)));
                    }}
                    onAssign={handleAssignSingle}
                    onBulkAssign={handleBulkAssign}
                    onBulkCategoryChange={setBulkCategoryId}
                />
            ) : (
                <MappingsView
                    mappings={mappings}
                    categories={categories}
                    newTerm={newTerm}
                    newSubcategoryId={newSubcategoryId}
                    onNewTermChange={setNewTerm}
                    onNewSubcategoryChange={setNewSubcategoryId}
                    onCreateMapping={handleCreateMapping}
                    onDeleteMapping={handleDeleteMapping}
                />
            )}
        </div>
    );
}

function InboxView({
    groups,
    categories,
    selected,
    bulkCategoryId,
    onToggleSelect,
    onToggleAll,
    onAssign,
    onBulkAssign,
    onBulkCategoryChange,
}: {
    groups: StagedGroup[];
    categories: Category[];
    selected: Set<string>;
    bulkCategoryId: string;
    onToggleSelect: (id: string) => void;
    onToggleAll: () => void;
    onAssign: (groupId: string, categoryId: string) => void;
    onBulkAssign: () => void;
    onBulkCategoryChange: (id: string) => void;
}) {
    if (groups.length === 0) {
        return (
            <div className="text-center py-16 text-gray-400">
                <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">All caught up</p>
                <p className="text-sm mt-1">No uncategorized items pending review.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk bar */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 p-4 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
                    <span className="text-sm text-gray-300">{selected.size} selected</span>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <select
                        value={bulkCategoryId}
                        onChange={e => onBulkCategoryChange(e.target.value)}
                        className="px-3 py-1.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white text-sm flex-1 max-w-xs"
                    >
                        <option value="">Assign to...</option>
                        {categories.map(c => (
                            <option key={String(c.id)} value={String(c.id)}>
                                {c.parentCategoryName ? `${c.parentCategoryName} > ` : ''}{c.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={onBulkAssign}
                        disabled={!bulkCategoryId}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm rounded-lg transition flex items-center gap-1.5"
                    >
                        <CheckCircle className="w-4 h-4" /> Assign All
                    </button>
                </div>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {groups.map(g => (
                    <div
                        key={g.id}
                        className={`bg-[#2a2a2a] rounded-xl border p-4 transition ${
                            selected.has(g.id) ? 'border-blue-500 bg-blue-500/5' : 'border-[#3a3a3a]'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={selected.has(g.id)}
                                onChange={() => onToggleSelect(g.id)}
                                className="mt-1 w-4 h-4"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">{g.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{g.objectId}</div>
                                {g.rawCategoryHint && (
                                    <div className="mt-2 text-xs text-orange-400 bg-orange-400/10 inline-block px-2 py-0.5 rounded">
                                        Supplier: &quot;{g.rawCategoryHint}&quot;
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">
                                    {g.variantCount} variant{g.variantCount !== 1 ? 's' : ''}
                                    {g.importSource && <> &middot; {g.importSource}</>}
                                </div>
                            </div>
                        </div>

                        {/* Category selector */}
                        <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                            <select
                                defaultValue=""
                                onChange={e => { if (e.target.value) onAssign(g.id, e.target.value); }}
                                className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white text-sm"
                            >
                                <option value="" disabled>Assign to subcategory...</option>
                                {categories.map(c => (
                                    <option key={String(c.id)} value={String(c.id)}>
                                        {c.parentCategoryName ? `${c.parentCategoryName} > ` : ''}{c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {/* Select all */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <button onClick={onToggleAll} className="hover:text-white transition underline">
                    {selected.size === groups.length ? 'Deselect all' : 'Select all'}
                </button>
                <span>&middot; {groups.length} uncategorized item{groups.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
    );
}

function MappingsView({
    mappings,
    categories,
    newTerm,
    newSubcategoryId,
    onNewTermChange,
    onNewSubcategoryChange,
    onCreateMapping,
    onDeleteMapping,
}: {
    mappings: CategoryMappingItem[];
    categories: Category[];
    newTerm: string;
    newSubcategoryId: string;
    onNewTermChange: (v: string) => void;
    onNewSubcategoryChange: (v: string) => void;
    onCreateMapping: () => void;
    onDeleteMapping: (id: number) => void;
}) {
    return (
        <div className="space-y-6">
            {/* Add mapping form */}
            <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Add Manual Mapping</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={newTerm}
                        onChange={e => onNewTermChange(e.target.value)}
                        placeholder='Supplier term (e.g. "Floor Lamps")'
                        className="flex-1 px-3 py-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white text-sm placeholder-gray-500"
                    />
                    <select
                        value={newSubcategoryId}
                        onChange={e => onNewSubcategoryChange(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white text-sm"
                    >
                        <option value="">Maps to subcategory...</option>
                        {categories.map(c => (
                            <option key={String(c.id)} value={String(c.id)}>
                                {c.parentCategoryName ? `${c.parentCategoryName} > ` : ''}{c.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={onCreateMapping}
                        disabled={!newTerm.trim() || !newSubcategoryId}
                        className="px-4 py-2 bg-[#4a3a3a] hover:bg-[#5a4a4a] disabled:opacity-40 text-white text-sm rounded-lg transition flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Mappings table */}
            <div className="bg-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden border border-[#3a3a3a]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#3a3a3a] border-b border-[#4a4a4a]">
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Supplier Term</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Source</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Maps To</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3a3a3a]">
                            {mappings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No mappings yet. Assign categories to imported items and mappings will be created automatically.
                                    </td>
                                </tr>
                            ) : (
                                mappings.map(m => (
                                    <tr key={m.id} className="hover:bg-[#333333] transition">
                                        <td className="px-6 py-3 text-sm text-white font-medium">{m.supplierTerm}</td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{m.supplierSource || '—'}</td>
                                        <td className="px-6 py-3 text-sm text-gray-300">
                                            {m.parentCategoryName && <span className="text-gray-500">{m.parentCategoryName} &gt; </span>}
                                            {m.subcategoryName}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">
                                            {new Date(m.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button
                                                onClick={() => onDeleteMapping(m.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                                title="Delete mapping"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-sm text-gray-400">
                {mappings.length} mapping{mappings.length !== 1 ? 's' : ''} total.
                Each mapping teaches the import system to auto-categorize matching items in future imports.
            </div>
        </div>
    );
}
