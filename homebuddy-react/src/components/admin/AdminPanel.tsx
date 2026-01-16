// ============================================
// File: components/admin/AdminPanel.tsx
// ============================================
"use client";
import { useState } from 'react';
import {
    Users,
    UserCog,
    Star,
    ShoppingCart,
    FolderTree,
    Package,
    Grid3x3,
    ChevronRight
} from 'lucide-react';
import AdminsManagement from './sections/AdminsManagement';
import UsersManagement from './sections/UsersManagement';
import ReviewsManagement from './sections/ReviewsManagement';
import OrdersManagement from './sections/OrdersManagement';
import GroupsManagement from './sections/GroupsManagement';
import VariantsManagement from './sections/VariantsManagement';
import CategoriesManagement from './sections/CategoriesManagement';

type Section =
    | 'Admins'
    | 'Users'
    | 'Reviews'
    | 'Orders'
    | 'Groups'
    | 'Variants'
    | 'Categories';

interface MenuItem {
    id: Section;
    label: string;
    icon: any;
    description: string;
}

const menuItems: MenuItem[] = [
    {
        id: 'Admins',
        label: 'Admins',
        icon: UserCog,
        description: 'Manage admin users and permissions',
    },
    {
        id: 'Users',
        label: 'Users',
        icon: Users,
        description: 'View and manage customer accounts',
    },
    {
        id: 'Reviews',
        label: 'Reviews',
        icon: Star,
        description: 'Moderate product reviews',
    },
    {
        id: 'Orders',
        label: 'Orders',
        icon: ShoppingCart,
        description: 'Track and manage customer orders',
    },
    {
        id: 'Groups',
        label: 'Product Groups',
        icon: FolderTree,
        description: 'Organize products into groups',
    },
    {
        id: 'Variants',
        label: 'Variants',
        icon: Package,
        description: 'Manage product variants and inventory',
    },
    {
        id: 'Categories',
        label: 'Categories',
        icon: Grid3x3,
        description: 'View product categories',
    },
];

export default function AdminPanel() {
    const [activeSection, setActiveSection] = useState<Section>('Admins');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const renderSection = () => {
        switch (activeSection) {
            case 'Admins':
                return <AdminsManagement />;
            case 'Users':
                return <UsersManagement />;
            case 'Reviews':
                return <ReviewsManagement />;
            case 'Orders':
                return <OrdersManagement />;
            case 'Groups':
                return <GroupsManagement />;
            case 'Variants':
                return <VariantsManagement />;
            case 'Categories':
                return <CategoriesManagement />;
            default:
                return <AdminsManagement />;
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex marginTopNav">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'
                    } bg-[#2a2a2a] border-r border-[#3a3a3a] transition-all duration-300 flex flex-col`}
            >
                {/* Header */}
                <div className="p-6 border-b border-[#3a3a3a]">
                    <div className="flex items-center justify-between">
                        {isSidebarOpen && (
                            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-[#3a3a3a] rounded-lg transition text-gray-400 hover:text-white"
                        >
                            <ChevronRight
                                className={`w-5 h-5 transition-transform ${isSidebarOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                    ? 'bg-[#4a3a3a] text-white'
                                    : 'text-gray-400 hover:bg-[#3a3a3a] hover:text-white'
                                    }`}
                                title={!isSidebarOpen ? item.label : undefined}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {isSidebarOpen && (
                                    <div className="text-left flex-1">
                                        <div className="font-medium">{item.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                {isSidebarOpen && (
                    <div className="p-4 border-t border-[#3a3a3a] text-xs text-gray-500">
                        Admin Dashboard v1.0
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {menuItems.find((item) => item.id === activeSection)?.label}
                        </h1>
                        <p className="text-gray-400">
                            {menuItems.find((item) => item.id === activeSection)?.description}
                        </p>
                    </div>

                    {/* Section Content */}
                    {renderSection()}
                </div>
            </main>
        </div>
    );
}