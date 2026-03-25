// ============================================
// File: components/admin/sections/DiscountsManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { groupService, Group } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';
import { Percent, Tag, Loader2, X } from 'lucide-react';

export default function DiscountsManagement() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    const [discountModalGroup, setDiscountModalGroup] = useState<Group | null>(null);
    const [discountPercent, setDiscountPercent] = useState<string>('10');
    const [isApplying, setIsApplying] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                groupService.getAll(pageNum),
                groupService.getAllCount()
            ]);
            if (response.error) {
                toast.error('Kunde inte ladda grupper');
                return;
            }
            const data = response.data ?? [];
            const list = Array.isArray(data) ? data : [];
            if (reset) {
                setGroups(list);
            } else {
                setGroups(prev => [...prev, ...list]);
            }
            const countRes = response2.data;
            setTotalCount(typeof countRes === 'object' && countRes !== null && 'count' in countRes
                ? (countRes as { count: number }).count
                : Number(countRes) || 0);
        } catch (e) {
            toast.error('Kunde inte ladda grupper');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        loadGroups(false, nextPage);
    };

    const handleApplyDiscount = async () => {
        if (!discountModalGroup) return;
        const pct = parseInt(discountPercent, 10);
        if (isNaN(pct) || pct < 1 || pct > 99) {
            toast.error('Ange en rabatt mellan 1 och 99 %');
            return;
        }
        setIsApplying(true);
        try {
            const res = await groupService.applyDiscount(discountModalGroup.id, pct);
            if (res.error) {
                toast.error(res.error as string || 'Kunde inte sätta rabatt');
                return;
            }
            toast.success(`Rabatt ${pct} % satt för hela produktgruppen`);
            setDiscountModalGroup(null);
            setDiscountPercent('10');
            await loadGroups();
        } catch (e) {
            toast.error('Kunde inte sätta rabatt');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveDiscount = async (group: Group) => {
        if (!confirm(`Ta bort rabatt för gruppen "${group.name}"? Ordinarie pris (ListPrice) rensas för alla varianter.`)) return;
        const id = String(group.id);
        setIsRemoving(id);
        try {
            const res = await groupService.removeDiscount(group.id);
            if (res.error) {
                toast.error(res.error as string || 'Kunde inte ta bort rabatt');
                return;
            }
            toast.success('Rabatt borttagen för gruppen');
            await loadGroups();
        } catch (e) {
            toast.error('Kunde inte ta bort rabatt');
        } finally {
            setIsRemoving(null);
        }
    };

    const categoryName = (g: Group) => (g.category as { name?: string } | undefined)?.name ?? g.categoryId ?? '–';

    return (
        <div className="space-y-6">
            <p className="text-gray-400">
                Rabattera eller avrabattera <strong>hela produktgrupper</strong>. När du sätter rabatt får alla varianter i gruppen samma ordinarie pris (ListPrice) och kampanjpris.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : (
                <>
                    <div className="rounded-xl border border-[#3a3a3a] overflow-hidden bg-[#2a2a2a]">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#3a3a3a] text-left text-gray-400 text-sm">
                                    <th className="p-4 font-medium">Grupp</th>
                                    <th className="p-4 font-medium">Kategori</th>
                                    <th className="p-4 font-medium">Rabatt</th>
                                    <th className="p-4 font-medium text-right">Åtgärder</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((g) => (
                                    <tr key={String(g.id)} className="border-b border-[#3a3a3a] hover:bg-[#333]">
                                        <td className="p-4 text-white font-medium">{g.name ?? '–'}</td>
                                        <td className="p-4 text-gray-400">{categoryName(g)}</td>
                                        <td className="p-4">
                                            {g.hasDiscount ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 text-sm">Ja</span>
                                            ) : (
                                                <span className="text-gray-500">Nej</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDiscountPercent('10');
                                                    setDiscountModalGroup(g);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white text-sm transition"
                                            >
                                                <Percent className="w-4 h-4" />
                                                Rabattera
                                            </button>
                                            {g.hasDiscount && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDiscount(g)}
                                                    disabled={isRemoving === String(g.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-gray-300 text-sm transition disabled:opacity-50"
                                                >
                                                    {isRemoving === String(g.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                                                    Avrabattera
                                                </button>
                                            )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {groups.length < totalCount && (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="px-4 py-2 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Laddar…' : 'Ladda fler grupper'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal: Sätt rabatt */}
            {discountModalGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !isApplying && setDiscountModalGroup(null)}>
                    <div
                        className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] shadow-xl w-full max-w-md p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Rabattera grupp</h3>
                            <button
                                type="button"
                                onClick={() => !isApplying && setDiscountModalGroup(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Grupp: <strong className="text-white">{discountModalGroup.name}</strong>. Alla varianter i gruppen får samma rabatt i procent.
                        </p>
                        <label className="block text-sm text-gray-400 mb-2">Rabatt (%)</label>
                        <input
                            type="number"
                            min={1}
                            max={99}
                            value={discountPercent}
                            onChange={e => setDiscountPercent(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-[#3a3a3a] text-white mb-6"
                        />
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => !isApplying && setDiscountModalGroup(null)}
                                className="flex-1 py-2 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white"
                            >
                                Avbryt
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyDiscount}
                                disabled={isApplying}
                                className="flex-1 py-2 rounded-lg bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Sätt rabatt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
