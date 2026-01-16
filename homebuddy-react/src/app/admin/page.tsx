"use client";
import AdminPanel from '@/components/admin/AdminPanel';
import { withAuth } from '@/contexts/AuthContext';

// Protect the admin panel so only authenticated admins can access it.
// The HOC shows a loader while checking auth and redirects non-admins.
function AdminPage() {
  return <AdminPanel />;
}

export default withAuth(AdminPage, true);