// ============================================
// File: components/admin/sections/UsersManagement.tsx
// ============================================
"use client";
import { useEffect, useState } from 'react';
import { BaseCRUDComponent, Column } from '../BaseCRUDComponent';
import { FormWrapper, FormField } from '../FormWrapper';
import { userService, User } from '@/lib/services/adminServices';
import { toast } from 'react-toastify';

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);

    const [formData, setFormData] = useState<Partial<User> & { name?: string; newPassword?: string }>({});

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async (reset = true, pageNum = 1) => {
        if (reset) {
            setIsLoading(true);
            setPage(1);
        }
        try {
            const [response, response2] = await Promise.all([
                userService.getAll(pageNum),
                userService.getAllCount()
            ]);

            // Parse cart JSON strings into objects
            const parsedUsers = (response.data || []).map(user => {
                if (user.cart && typeof user.cart === 'string') {
                    try {
                        const parsedCart = JSON.parse(user.cart);
                        // If cart is empty object, add placeholder data for dropdown visibility
                        if (typeof parsedCart === 'object' && parsedCart !== null && Object.keys(parsedCart).length === 0) {
                            return { ...user, cart: { status: 'Empty cart' } };
                        }
                        return { ...user, cart: parsedCart };
                    } catch (e) {
                        console.error('Failed to parse cart for user', user.id, e);
                        return user;
                    }
                }
                // If no cart at all, add placeholder
                if (!user.cart) {
                    return { ...user, cart: { status: 'No cart data' } };
                }
                return user;
            });

            if (reset) {
                setUsers(parsedUsers);
            } else {
                setUsers(prev => [...prev, ...parsedUsers]);
            }
            setTotalCount(typeof response2.data === 'object' && response2.data !== null && 'count' in response2.data
                ? (response2.data as any).count
                : response2.data || 0);
        } catch (error) {
            console.error('Error loading users:', error);
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
        await loadUsers(false, nextPage);
    };

    const handleDelete = async (id: number | string) => {
        try {
            const response = await userService.delete(Number(id));
            if (response.error) {
                toast.error(`Failed to delete user: ${response.error}`);
                return;
            }
            setUsers(users.filter(u => u.id !== id));
            setTotalCount(prev => prev - 1);
            toast.success('User deleted successfully.');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error?.message || 'Failed to delete user');
        }
    };

    const handleEdit = (item: User) => {
        setFormData({ ...item });
    };

    const handleSave = async (item: User | null, onClose: () => void) => {
        try {
            const email = (formData.email || '').trim();
            if (!item?.id) {
                toast.error('Creating users not supported in this panel.');
                return;
            }
            if (!email) {
                toast.error('Email is required.');
                return;
            }
            const response = await userService.update(item.id, email);
            if (response.error) {
                toast.error(`Failed to update user: ${response.error}`);
                return;
            }
            toast.success('User updated successfully.');
            await loadUsers();
            onClose();
            setFormData({});
        } catch (error: any) {
            console.error('Error saving user:', error);
            toast.error(error?.message || 'Failed to save user');
        }
    };

    const columns: Column<User>[] = [
        { key: 'id', label: 'ID' },
        { key: 'email', label: 'Email' },
        { key: 'cart', label: 'Cart' },
    ];

    return (
        <BaseCRUDComponent
            data={{ items: users, totalCount }}
            columns={columns}
            onDelete={handleDelete}
            onEdit={handleEdit}
            isLoading={isLoading}
            title="Users"
            allowAdd={false}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            renderForm={(item, onClose) => (
                <FormWrapper
                    title="User"
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
                    <FormField
                        label="NewPassword"
                        name="newPassword"
                        value={(formData as any).newPassword || ''}
                        onChange={(val) => setFormData({ ...formData, newPassword: val })}
                        placeholder="New password (leave blank to keep current password)"
                    />
                </FormWrapper>
            )}
        />
    );
}