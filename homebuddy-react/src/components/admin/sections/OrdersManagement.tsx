// ============================================
// File: components/admin/sections/OrdersManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { orderService, Order } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';

interface OrderFormData {
    email?: string;
    total?: number | string;
    status?: string;
    items?: Array<{ sku: string; quantity: number }>;
}

export default function OrdersManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState<OrderFormData>({});

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                orderService.getAll(pageNum),
                orderService.getAllCount()
            ]);
            if (response.error) {
                console.error('Error loading orders:', response.error);
                toast.error('Failed to load orders: ' + response.error);
                return;
            }
            if (reset) {
                setOrders(response.data || []);
            } else {
                setOrders(prev => [...prev, ...(response.data || [])]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            if (reset) {
                setIsLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        await loadOrders(false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await orderService.delete(Number(id));
            if (response.error) {
                toast.error(`Failed to delete order: ${response.error}`);
                return;
            }
            setOrders(prev => prev.filter(o => o.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('Order deleted successfully');
        } catch (error: any) {
            console.error('Error deleting order:', error);
            toast.error(error?.message || 'Failed to delete order');
        }
    };

    const handleEdit = (item: Order) => {
        setFormData({
            email: item.email,
            total: item.total,
            status: item.status
        });
    };

    const handleSave = async (item: Order | null, onClose: () => void) => {
        try {
            const { email, total, status, items } = formData;

            if (item?.id) {
                // Update existing order (only status, total, email can be updated)
                if (!email || total === undefined || !status) {
                    toast.error('Email, Total and Status are required.');
                    return;
                }
                const response = await orderService.update(
                    item.id,
                    status,
                    typeof total === 'string' ? parseFloat(total) : total,
                    email
                );
                if (response.error) {
                    toast.error(`Failed to update order: ${response.error}`);
                    return;
                }
                toast.success('Order updated successfully');
            } else {
                // Create new order - requires email and items
                if (!email || !items || items.length === 0) {
                    toast.error('Email and at least one item are required for new orders.');
                    return;
                }

                // Validate all items have SKU and quantity
                const invalidItems = items.filter(i => !i.sku || !i.quantity || i.quantity <= 0);
                if (invalidItems.length > 0) {
                    toast.error('All items must have a valid SKU and quantity greater than 0.');
                    return;
                }

                const response = await orderService.create(email, items);
                if (response.error) {
                    toast.error(`Failed to create order: ${response.error}`);
                    return;
                }
                toast.success('Order created successfully');
            }
            await loadOrders();
            onClose();
            setFormData({});
        } catch (error: any) {
            console.error('Error saving order:', error);
            toast.error(error?.message || 'Failed to save order');
        }
    };

    const addItem = () => {
        const currentItems = formData.items || [];
        setFormData({
            ...formData,
            items: [...currentItems, { sku: '', quantity: 1 }]
        });
    };

    const removeItem = (index: number) => {
        const currentItems = formData.items || [];
        setFormData({
            ...formData,
            items: currentItems.filter((_, i) => i !== index)
        });
    };

    const updateItem = (index: number, field: 'sku' | 'quantity', value: string | number) => {
        const currentItems = formData.items || [];
        const updatedItems = [...currentItems];
        if (field === 'sku') {
            updatedItems[index] = { ...updatedItems[index], sku: value as string };
        } else {
            updatedItems[index] = { ...updatedItems[index], quantity: Number(value) };
        }
        setFormData({
            ...formData,
            items: updatedItems
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500/20 text-green-400';
            case 'shipped':
                return 'bg-blue-500/20 text-blue-400';
            case 'processing':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'pending':
                return 'bg-orange-500/20 text-orange-400';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const columns: Column<Order>[] = [
        { key: 'id', label: 'ID' },
        { key: 'orderNo', label: 'Order Number' },
        {
            key: 'items', label: 'Items', render: (item) => (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                    {item.items ? (item.items.reduce((acc, i) => acc + i.quantity, 0)) : "-"}
                </span>
            )
        },
        { key: 'email', label: 'Email' },
        {
            key: 'total',
            label: 'Total',
            render: (item) => typeof item.total === 'number' ? `$${item.total.toFixed(2)}` : item.total
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                </span>
            )
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (item) => new Date(item.createdUtc).toLocaleDateString()
        },
    ];

    return (
        <BaseCRUDComponent
            data={{ items: orders, totalCount }}
            columns={columns}
            onDelete={handleDelete}
            customFormClose={() => setFormData({})}
            onEdit={handleEdit}
            isLoading={isLoading}
            title="Orders"
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            renderForm={(item, onClose) => (
                <FormWrapper
                    title="Order"
                    onClose={onClose}
                    onSave={() => handleSave(item, onClose)}
                    isEdit={!!item}
                >
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(val) => setFormData({ ...formData, email: val })}
                        required
                    />

                    {item ? (
                        // Edit mode - show Total and Status
                        <>
                            <FormField
                                label="Total"
                                name="total"
                                type="number"
                                value={formData.total}
                                onChange={(val) => setFormData({ ...formData, total: val })}
                                required
                            />
                            <FormField
                                label="Status"
                                name="status"
                                type="select"
                                value={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Processing', label: 'Processing' },
                                    { value: 'Shipped', label: 'Shipped' },
                                    { value: 'Delivered', label: 'Delivered' },
                                    { value: 'Cancelled', label: 'Cancelled' },
                                ]}
                                required
                            />
                        </>
                    ) : (
                        // Create mode - show Items array
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-300">
                                    Order Items *
                                </label>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                                >
                                    + Add Item
                                </button>
                            </div>

                            {(!formData.items || formData.items.length === 0) && (
                                <p className="text-sm text-gray-500 italic">No items added yet. Click "Add Item" to begin.</p>
                            )}

                            {formData.items?.map((item, index) => (
                                <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-400">Item #{index + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-400 hover:text-red-300 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                SKU *
                                            </label>
                                            <input
                                                type="text"
                                                value={item.sku}
                                                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="e.g., SHIRT-001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </FormWrapper>
            )}
        />
    );
}