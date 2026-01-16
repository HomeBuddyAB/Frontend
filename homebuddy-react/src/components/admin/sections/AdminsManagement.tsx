"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { adminService, Admin } from '@/lib/services/adminServices';
import { Key, Eye, EyeOff } from 'lucide-react';
import { ApiResponse } from '@/lib/api-client';
import { toast } from 'react-toastify';
import FullScreenPopup from '@/components/Popups/FullScreenPopup';

export default function AdminsManagement() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState<Partial<Admin>>({});
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);

    // Shared state used in both delete confirmation (current password) and password change modal
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                adminService.getAll(pageNum),
                adminService.getAllCount()
            ]);
            if (reset) {
                setAdmins(response.data || []);
            } else {
                setAdmins(prev => [...prev, ...(response.data || [])]);
            }
            // Handle if response2.data is an object with count property or just a number
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading admins:', error);
            toast.error('Failed to load admins');
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
        await loadAdmins(false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        try {
            const req = await adminService.delete(id);
            if (req.error) {
                throw new Error(req.error || 'Failed to delete admin');
            }
            setAdmins(admins.filter(a => a.id !== id));
            toast.success('Admin deleted successfully');
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Failed to delete admin');
        }
    };

    const handleSave = async (item: Admin | null, onClose: () => void) => {
        try {
            if (item?.id) {
                toast.warning('Edit functionality not available. Use password change instead.');
                return;
            } else {
                if (!formData.username) {
                    toast.error('Username is required');
                    return;
                }
                try {
                    const req = await adminService.create(formData.username, (formData as any).password);
                    if (req.error) {
                        throw new Error(req.error || 'Failed to create admin');
                    }
                    await loadAdmins();
                    toast.success('Admin created successfully');
                    onClose();
                    setFormData({});
                } catch (error) {
                    console.error('Error creating admin:', error);
                    toast.error('Failed to create admin');
                }
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            toast.error('Failed to save admin');
        }
    };

    const handlePasswordChange = async () => {
        try {
            if (!selectedAdminId) {
                toast.error('No admin selected');
                return;
            }
            const current = currentPassword.trim();
            const next = newPassword.trim();
            if (!current || !next) {
                toast.error('Please enter both current and new password');
                return;
            }
            const response = await adminService.updatePassword(selectedAdminId, current, next) as ApiResponse;
            if (response.error) {
                throw new Error(response.error || 'Failed to update password');
            }
            toast.success('Password updated successfully');
            setShowPasswordModal(false);
            setSelectedAdminId(null);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            console.error('Error updating password:', error);
            toast.error(`Failed to update password: ${error.message}`);
        }
    };

    const columns: Column<Admin>[] = [
        { key: 'id', label: 'ID' },
        // Display username even if API provides either `username` or `userName`
        { key: 'userName', label: 'Username', render: (a) => (a as any).userName ?? a.username }
    ];

    return (
        <>
            <BaseCRUDComponent
                data={{ items: admins, totalCount }}
                columns={columns}
                onDelete={handleDelete}
                isLoading={isLoading}
                title="Admins"
                allowEdit={false}
                onLoadMore={handleLoadMore}
                isLoadingMore={isLoadingMore}
                onDeleteWithExtra={async (admin: Admin, extra?: { currentPassword?: string }) => {
                    try {
                        const response = await adminService.delete(admin.id, String(extra?.currentPassword || ''));
                        if (response.error) {
                            throw new Error(response.error || 'Failed to delete admin');
                        }
                        setAdmins(prev => prev.filter(a => a.id !== admin.id));
                        // Clear shared password state after use
                        setCurrentPassword('');
                        toast.success('Admin deleted successfully');
                    } catch (error: any) {
                        console.error('Error deleting admin:', error);
                        toast.error(error.message || 'Failed to delete admin');
                        throw error;
                    }
                }}
                renderDeleteForm={(admin: Admin, submit: (extra?: any) => void, cancel: () => void) => (
                    <FormWrapper
                        title="Delete Admin"
                        onClose={cancel}
                        onSave={() => {
                            const pwd = currentPassword.trim();
                            if (!pwd) {
                                toast.error('Please enter your current password.');
                                return;
                            }
                            submit({ currentPassword: pwd });
                        }}
                        isEdit
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-gray-400">
                                You are about to permanently delete admin <span className="font-semibold text-white">“{admin.username ?? admin.id}”</span>. This action cannot be undone.
                            </p>
                            {/* BUGFIX: use controlled value + correct onChange signature (string, not event); remove DOM querying */}
                            <FormField
                                label="Current Password"
                                name="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(val) => setCurrentPassword(val)}
                                required
                            />
                            <div className="bg-red-900/20 border border-red-800/40 text-red-300 text-xs rounded p-3">
                                Warning: Deleting an admin removes their access immediately.
                            </div>
                        </div>
                    </FormWrapper>
                )}
                customActions={(item: Admin) => (
                    <button
                        onClick={() => {
                            setSelectedAdminId(item.id);
                            setShowPasswordModal(true);
                        }}
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition"
                        title="Change Password"
                    >
                        <Key className="w-4 h-4" />
                    </button>
                )}
                renderForm={(item: Admin | null, onClose: () => void) => (
                    <FormWrapper
                        title="Admin"
                        onClose={onClose}
                        onSave={() => handleSave(item, onClose)}
                        isEdit={!!item}
                    >
                        <FormField
                            label="Username"
                            name="username"
                            value={formData.username}
                            onChange={(val) => setFormData({ ...formData, username: val })}
                            required
                        />
                        {!item && (
                            <FormField
                                label="Password"
                                name="password"
                                type="password"
                                value={(formData as any).password}
                                onChange={(val) => setFormData({ ...formData, password: val } as any)}
                                required
                            />
                        )}
                    </FormWrapper>
                )}
            />

            <FullScreenPopup
                open={showPasswordModal}
                onClose={() => {
                    setShowPasswordModal(false);
                    setSelectedAdminId(null);
                    setCurrentPassword('');
                    setNewPassword('');
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                }}
            >
                <FormWrapper
                    title="Change Password"
                    onClose={() => {
                        setShowPasswordModal(false);
                        setSelectedAdminId(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setShowCurrentPassword(false);
                        setShowNewPassword(false);
                    }}
                    onSave={handlePasswordChange}
                    isEdit
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">
                            You are about to change the password for admin with the ID: <span className="font-semibold text-white">“{admins.find(a => a.id === selectedAdminId)?.username ?? selectedAdminId}”</span>.
                        </p>
                        {/* Current Password with toggle */}
                        <div className="relative">
                            <FormField
                                label="Current Password"
                                name="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder='Current Password'
                                value={currentPassword}
                                onChange={(val) => setCurrentPassword(val)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-200 transition"
                            >
                                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {/* New Password with toggle */}
                        <div className="relative">
                            <FormField
                                label="New Password"
                                name="newPassword"
                                placeholder='New password'
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(val) => {
                                    setNewPassword(val);
                                }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewPassword(!showNewPassword);
                                }}
                                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-200 transition"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-800/40 text-yellow-300 text-xs rounded p-3">
                            Tip: Use a strong password with at least 12 characters, including letters, numbers, and symbols.
                        </div>
                    </div>
                </FormWrapper>
            </FullScreenPopup>
        </>
    );
}