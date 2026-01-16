// ============================================
// File: components/admin/sections/VariantsManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { variantService, groupService, Variant, Group } from '@/lib/services/adminServices';
import { variantImageService, VariantImage } from '@/lib/services/imageServices';
import { Package, Plus, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// Extended Variant type with metadata
interface VariantWithMetadata extends Variant {
    description?: string;
    brand?: string;
    material?: string;
}

// Image form data for creating/editing images
interface ImageFormData {
    url: string;
    altText: string;
    isPrimary: boolean;
    sortOrder: number;
}

export default function VariantsManagement() {
    const [variants, setVariants] = useState<VariantWithMetadata[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState<Partial<VariantWithMetadata>>({});
    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [inventoryAdjustment, setInventoryAdjustment] = useState<{ variantId: string; amount: number; transactionType: number } | null>(null);

    // Groups pagination state
    const [groupsPage, setGroupsPage] = useState(1);
    const [groupsTotalCount, setGroupsTotalCount] = useState(0);
    const [isLoadingMoreGroups, setIsLoadingMoreGroups] = useState(false);

    // Image management state
    const [imageFormList, setImageFormList] = useState<ImageFormData[]>([]);
    const [existingImages, setExistingImages] = useState<VariantImage[]>([]);

    useEffect(() => {
        loadGroups();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            loadVariants(selectedGroupId);
        }
    }, [selectedGroupId]);

    const loadGroups = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoadingMoreGroups(true);
        }
        try {
            // Assuming groupService has getAll with pagination support
            // If not, you may need to add pagination parameters
            const [response, countResponse] = await Promise.all([
                groupService.getAll(pageNum),
                groupService.getAllCount ? groupService.getAllCount() : Promise.resolve({ data: 0 })
            ]);

            const groupsData = response.data || [];

            if (reset) {
                setGroups(groupsData);
            } else {
                setGroups(prev => [...prev, ...groupsData]);
            }

            // Handle count response
            const count = typeof countResponse.data === 'object' && countResponse.data !== null && 'count' in countResponse.data
                ? (countResponse.data as any).count
                : countResponse.data || groupsData.length;
            setGroupsTotalCount(count);

            if (groupsData.length > 0 && !selectedGroupId && reset) {
                setSelectedGroupId(groupsData[0].id);
            }
        } catch (error) {
            console.error('Error loading groups:', error);
            toast.error('Failed to load groups');
        } finally {
            setIsLoadingMoreGroups(false);
        }
    };

    const handleLoadMoreGroups = async () => {
        setIsLoadingMoreGroups(true);
        const nextPage = groupsPage + 1;
        setGroupsPage(nextPage);
        await loadGroups(false, nextPage);
    };

    const loadVariants = async (groupId: number | string, reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                variantService.getByGroup(groupId, pageNum),
                variantService.getByGroupCount(groupId)
            ]);

            if (reset) {
                setVariants(response.data || []);
            } else {
                setVariants(prev => [...prev, ...(response.data || [])]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading variants:', error);
            toast.error('Failed to load variants');
            setVariants([]);
        } finally {
            if (reset) {
                setIsLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    };

    const handleLoadMore = async () => {
        if (!selectedGroupId) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        await loadVariants(selectedGroupId, false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await variantService.delete(String(id));
            if (response.error) {
                toast.error(`Failed to delete variant: ${response.error}`);
                return;
            }
            if (selectedGroupId) {
                setVariants(prev => prev.filter(v => v.id !== id));
                setTotalCount(prev => prev - 1);
            }
            toast.success('Variant deleted successfully');
        } catch (error: any) {
            console.error('Error deleting variant:', error);
            toast.error(error?.message || 'Failed to delete variant');
        }
    };

    const handleEdit = async (item: VariantWithMetadata) => {
        setFormData(item);

        // Load existing images for this variant
        try {
            const response = await variantImageService.getByVariant(item.id);
            if (response.data) {
                setExistingImages(response.data);
            }
        } catch (error) {
            console.error('Error loading variant images:', error);
        }

        // Clear new images form
        setImageFormList([]);
    };

    const handleSave = async (item: VariantWithMetadata | null, onClose: () => void) => {
        try {
            const { sku, color, size, price, description, brand, material } = formData;

            let variantId: string;

            if (item?.id) {
                // Update variant
                const response = await variantService.update(
                    item.id,
                    color,
                    size,
                    typeof price === 'string' ? parseFloat(price) : price,
                    description,
                    brand,
                    material
                );
                if (response.error) {
                    toast.error(`Failed to update variant: ${response.error}`);
                    return;
                }
                variantId = item.id;
                toast.success('Variant updated successfully');
            } else {
                // Create variant
                if (!selectedGroupId || !sku || !color || !size || price === undefined) {
                    toast.error('Group, SKU, Color, Size, and Price are required.');
                    return;
                }
                const response = await variantService.create(
                    selectedGroupId,
                    sku,
                    color,
                    size,
                    typeof price === 'string' ? parseFloat(price) : price,
                    description,
                    brand,
                    material
                );
                // Handle different response structures
                if (response.data && typeof response.data === 'object' && 'id' in response.data) {
                    variantId = response.data.id;
                } else if (response.data && typeof response.data === 'string') {
                    variantId = response.data;
                } else if ((response as any).id) {
                    variantId = (response as any).id;
                } else {
                    toast.error('Failed to get variant ID from response');
                    console.error('Unexpected response structure:', response);
                    return;
                }

                toast.success('Variant created successfully');
            }

            // Now handle images - only create NEW images from imageFormList
            if (imageFormList.length > 0) {
                for (const imageData of imageFormList) {
                    try {
                        await variantImageService.create(variantId, imageData);
                    } catch (error) {
                        console.error('Error creating image:', error);
                        toast.error('Failed to save some images');
                    }
                }
                toast.success(`Added ${imageFormList.length} new image(s)`);
            }

            // Reload variants
            if (selectedGroupId) {
                await loadVariants(selectedGroupId);
            }

            // Clear form and close
            onClose();
            setFormData({});
            setImageFormList([]);
            setExistingImages([]);
        } catch (error: any) {
            console.error('Error saving variant:', error);
            toast.error(error?.message || 'Failed to save variant');
        }
    };

    const handleInventoryAdjustment = async () => {
        if (!inventoryAdjustment) return;

        try {
            const response = await variantService.adjustInventory(
                inventoryAdjustment.variantId,
                inventoryAdjustment.amount,
                inventoryAdjustment.transactionType
            );
            if (response.error) {
                toast.error(`Failed to adjust inventory: ${response.error}`);
                return;
            }
            if (selectedGroupId) {
                await loadVariants(selectedGroupId);
            }
            setShowInventoryModal(false);
            setInventoryAdjustment(null);

            const typeNames = ['Restock', 'Sale', 'Adjustment', 'Order'];
            toast.success(`Inventory adjusted by ${inventoryAdjustment.amount > 0 ? '+' : ''}${inventoryAdjustment.amount} (${typeNames[inventoryAdjustment.transactionType]})`);
        } catch (error: any) {
            console.error('Error adjusting inventory:', error);
            toast.error(error?.message || 'Failed to adjust inventory');
        }
    };

    // Image management functions
    const addImageField = () => {
        setImageFormList([...imageFormList, {
            url: '',
            altText: '',
            isPrimary: imageFormList.length === 0 && existingImages.length === 0,
            sortOrder: imageFormList.length + existingImages.length
        }]);
    };

    const removeImageField = (index: number) => {
        setImageFormList(imageFormList.filter((_, i) => i !== index));
    };

    const updateImageField = (index: number, field: keyof ImageFormData, value: any) => {
        const updated = [...imageFormList];
        updated[index] = { ...updated[index], [field]: value };

        // If marking as primary, unmark all others
        if (field === 'isPrimary' && value === true) {
            updated.forEach((img, i) => {
                if (i !== index) img.isPrimary = false;
            });
        }

        setImageFormList(updated);
    };

    const deleteExistingImage = async (imageId: string, variantId: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            await variantImageService.delete(variantId, imageId);
            setExistingImages(existingImages.filter(img => img.id !== imageId));
            toast.success('Image deleted');
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error('Failed to delete image');
        }
    };

    const columns: Column<VariantWithMetadata>[] = [
        { key: 'id', label: 'ID' },
        { key: 'sku', label: 'SKU' },
        { key: 'color', label: 'Color' },
        { key: 'size', label: 'Size' },
        {
            key: 'price',
            label: 'Price',
            render: (item) => `$${item.price.toFixed(2)}`
        },
        {
            key: 'brand',
            label: 'Brand',
            render: (item) => item.brand || '-'
        },
        {
            key: 'inventoryQuantity',
            label: 'Inventory',
            render: (item) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${item.inventoryQuantity > item.lowStockThreshold && item.inventoryQuantity > 10
                    ? 'bg-green-500/20 text-green-400'
                    : item.inventoryQuantity > item.lowStockThreshold
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {item.inventoryQuantity}
                </span>
            )
        },
        {
            key: 'lowStockThreshold',
            label: 'Low Stock',
            render: (item) => item.lowStockThreshold || 0
        },
        {
            key: 'lastRestockDate',
            label: 'Last Restock',
            render: (item) => item.lastRestockDate
                ? new Date(item.lastRestockDate).toLocaleDateString()
                : 'Never'
        },
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Group Selector */}
                <div className="bg-[#2a2a2a] rounded-xl shadow-2xl p-6 border border-[#3a3a3a]">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Select Product Group
                    </label>
                    <select
                        value={selectedGroupId || ''}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            const selectedGroup = groups.find(g => String(g.id) === rawValue);
                            const newGroupId = selectedGroup ? selectedGroup.id : rawValue;
                            setSelectedGroupId(newGroupId);
                        }}
                        className="w-full px-4 py-2.5 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5a4a4a] transition"
                    >
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>

                    {/* Load More Groups Button */}
                    {groups.length < groupsTotalCount && (
                        <button
                            onClick={handleLoadMoreGroups}
                            disabled={isLoadingMoreGroups}
                            className="w-full mt-3 px-4 py-2.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoadingMoreGroups ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Load More Groups ({groups.length} of {groupsTotalCount})
                                </>
                            )}
                        </button>
                    )}
                </div>

                {selectedGroupId && (
                    <BaseCRUDComponent
                        data={{ items: variants, totalCount }}
                        columns={columns}
                        customFormClose={() => {
                            setFormData({});
                            setImageFormList([]);
                            setExistingImages([]);
                        }}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        isLoading={isLoading}
                        title="Variants"
                        onLoadMore={handleLoadMore}
                        isLoadingMore={isLoadingMore}
                        customActions={(item) => (
                            <button
                                onClick={() => {
                                    setInventoryAdjustment({ variantId: item.id, amount: 0, transactionType: 0 });
                                    setShowInventoryModal(true);
                                }}
                                className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-lg transition"
                                title="Adjust Inventory"
                            >
                                <Package className="w-4 h-4" />
                            </button>
                        )}
                        renderForm={(item, onClose) => (
                            <FormWrapper
                                title="Variant"
                                onClose={() => {
                                    onClose();
                                    setImageFormList([]);
                                    setExistingImages([]);
                                }}
                                onSave={() => handleSave(item, onClose)}
                                isEdit={!!item}
                            >
                                {/* Basic Fields */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-white border-b border-[#3a3a3a] pb-2">
                                        Basic Information
                                    </h3>

                                    <FormField
                                        label="SKU"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={(val) => setFormData({ ...formData, sku: val })}
                                        placeholder="ADIDAS-TSH-BLUE-M"
                                        required
                                    />
                                    <FormField
                                        label="Color"
                                        name="color"
                                        value={formData.color}
                                        onChange={(val) => setFormData({ ...formData, color: val })}
                                        placeholder="Blue"
                                        required
                                    />
                                    <FormField
                                        label="Size"
                                        name="size"
                                        value={formData.size}
                                        onChange={(val) => setFormData({ ...formData, size: val })}
                                        placeholder="M"
                                        required
                                    />
                                    <FormField
                                        label="Price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(val) => setFormData({ ...formData, price: val })}
                                        placeholder="24.99"
                                        required
                                    />
                                </div>

                                {/* Metadata Fields */}
                                <div className="space-y-4 mt-6">
                                    <h3 className="text-lg font-semibold text-white border-b border-[#3a3a3a] pb-2">
                                        Product Details (Optional)
                                    </h3>

                                    <FormField
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={(val) => setFormData({ ...formData, description: val })}
                                        placeholder="Premium cotton t-shirt with comfortable fit"
                                        type="textarea"
                                    />
                                    <FormField
                                        label="Brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={(val) => setFormData({ ...formData, brand: val })}
                                        placeholder="Nike"
                                    />
                                    <FormField
                                        label="Material"
                                        name="material"
                                        value={formData.material}
                                        onChange={(val) => setFormData({ ...formData, material: val })}
                                        placeholder="100% Cotton"
                                    />
                                </div>

                                {/* Images Section */}
                                <div className="space-y-4 mt-6">
                                    <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5" />
                                            Product Images
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addImageField}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Image
                                        </button>
                                    </div>

                                    {/* Existing Images (for edit mode) */}
                                    {item && existingImages.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-400">Existing Images</h4>
                                            {existingImages.map((img) => (
                                                <div key={img.id} className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-4">
                                                    <div className="flex gap-3">
                                                        <img
                                                            src={img.url}
                                                            alt={img.altText || 'Product'}
                                                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder.png';
                                                            }}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white truncate">{img.url}</p>
                                                            <p className="text-xs text-gray-400 mt-1 truncate">{img.altText || 'No alt text'}</p>
                                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                                {img.isPrimary && (
                                                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded whitespace-nowrap">
                                                                        Primary
                                                                    </span>
                                                                )}
                                                                <span className="px-2 py-1 bg-[#2a2a2a] text-gray-400 text-xs rounded whitespace-nowrap">
                                                                    Order: {img.sortOrder}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteExistingImage(img.id, item.id)}
                                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition self-start flex-shrink-0"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New Images */}
                                    {imageFormList.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-medium text-gray-400">
                                                {item ? 'New Images to Add' : 'Product Images'}
                                            </h4>
                                            {imageFormList.map((imageData, index) => (
                                                <div key={index} className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-400">Image {index + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImageField(index)}
                                                            className="p-1 text-red-400 hover:bg-red-400/10 rounded transition"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <FormField
                                                        label="Image URL"
                                                        name={`image-url-${index}`}
                                                        value={imageData.url}
                                                        onChange={(val) => updateImageField(index, 'url', val)}
                                                        placeholder="https://example.com/image.jpg"
                                                    />

                                                    {imageData.url && (
                                                        <img
                                                            src={imageData.url}
                                                            alt="Preview"
                                                            className="w-full h-32 object-cover rounded"
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/placeholder.png';
                                                            }}
                                                        />
                                                    )}

                                                    <FormField
                                                        label="Alt Text"
                                                        name={`image-alt-${index}`}
                                                        value={imageData.altText}
                                                        onChange={(val) => updateImageField(index, 'altText', val)}
                                                        placeholder="Description for accessibility"
                                                    />

                                                    <div className="flex items-center gap-4">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={imageData.isPrimary}
                                                                onChange={(e) => updateImageField(index, 'isPrimary', e.target.checked)}
                                                                className="w-4 h-4 rounded bg-[#2a2a2a] border-[#3a3a3a]"
                                                            />
                                                            <span className="text-sm text-gray-300">Primary Image</span>
                                                        </label>

                                                        <FormField
                                                            label="Sort Order"
                                                            name={`image-sort-${index}`}
                                                            type="number"
                                                            value={imageData.sortOrder}
                                                            onChange={(val) => updateImageField(index, 'sortOrder', val)}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {imageFormList.length === 0 && (!item || existingImages.length === 0) && (
                                        <div className="text-center py-8 text-gray-400">
                                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="text-sm">No images added yet. Click "Add Image" to start.</p>
                                        </div>
                                    )}
                                </div>
                            </FormWrapper>
                        )}
                    />
                )}
            </div>

            {/* Inventory Adjustment Modal */}
            {showInventoryModal && inventoryAdjustment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Adjust Inventory</h3>

                        <div className="space-y-4">
                            <FormField
                                label="Transaction Type"
                                name="transactionType"
                                type="select"
                                value={inventoryAdjustment.transactionType}
                                onChange={(val) => setInventoryAdjustment({ ...inventoryAdjustment, transactionType: Number(val) })}
                                options={[
                                    { value: '0', label: 'Restock - Receiving new inventory' },
                                    { value: '1', label: 'Sale - Item sold to customer' },
                                    { value: '2', label: 'Adjustment - Correction/damage/loss' },
                                    { value: '3', label: 'Order - Reserved for order' }
                                ]}
                                hideEmptyOption={true}
                                required
                            />

                            <FormField
                                label="Adjustment Amount"
                                name="amount"
                                type="number"
                                value={inventoryAdjustment.amount}
                                onChange={(val) => setInventoryAdjustment({ ...inventoryAdjustment, amount: val })}
                                placeholder="Enter positive or negative number"
                                required
                            />

                            <div className="bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg p-3">
                                <p className="text-sm text-gray-400">
                                    💡 <strong className="text-white">Tip:</strong> Use positive numbers to increase stock, negative to decrease.
                                    {inventoryAdjustment.transactionType === 0 && inventoryAdjustment.amount > 0 && (
                                        <span className="block mt-1 text-green-400">✓ This will update the Last Restock Date</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowInventoryModal(false);
                                    setInventoryAdjustment(null);
                                }}
                                className="flex-1 px-4 py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInventoryAdjustment}
                                className="flex-1 px-4 py-2 bg-[#4a3a3a] hover:bg-[#5a4a4a] text-white rounded-lg transition font-medium"
                            >
                                Adjust
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}