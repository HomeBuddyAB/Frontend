"use client";

import { useEffect, useState } from "react";
import { dashboardService, type DashboardSummary } from "@/lib/services/adminServices";
import { toast } from "react-toastify";
import { ShoppingCart, Users, Package, Star } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

function StatCard({ label, value, description, icon, accentColor = "#F4A261" }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1f1f1f] border border-[#3a3a3a] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </p>
          {description && (
            <p className="mt-2 text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className="pointer-events-none absolute -right-6 -bottom-8 h-24 w-24 rounded-full opacity-10 blur-xl"
        style={{ background: accentColor }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await dashboardService.getSummary();
        if (res.error) {
          toast.error(`Failed to load dashboard: ${res.error}`);
          return;
        }
        if (isMounted) {
          setData(res.data ?? null);
        }
      } catch (err: any) {
        console.error("Failed to load dashboard summary", err);
        toast.error(err?.message || "Failed to load dashboard");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded bg-[#2a2a2a] animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#1f1f1f] border border-[#2f2f2f] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-[#3a3a3a] bg-[#1f1f1f] p-6 text-sm text-gray-400">
        No dashboard data is available yet. Create some orders, products and customers to see live stats.
      </div>
    );
  }

  const totalRevenueFormatted = `$${(data.orders.totalRevenue ?? 0).toFixed(2)}`;
  const averageRatingFormatted =
    data.reviews.total > 0 ? data.reviews.averageRating.toFixed(1) : "–";

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">
          Store overview
        </h2>
        <p className="text-sm text-gray-400">
          High‑level metrics for orders, customers, catalog and reviews.
        </p>
      </div>

      {/* Top row: orders & revenue */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Orders"
          value={data.orders.total}
          description={`Orders created since launch. Today: ${data.orders.today}`}
          accentColor="#F4A261"
          icon={<ShoppingCart className="h-6 w-6" />}
        />
        <StatCard
          label="Total Revenue"
          value={totalRevenueFormatted}
          description="Excluding cancelled orders."
          accentColor="#6A994E"
        />
        <StatCard
          label="Customers"
          value={data.customers.total}
          description="Registered user accounts."
          accentColor="#4D908E"
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          label="Reviews"
          value={data.reviews.total}
          description={`Average rating: ${averageRatingFormatted}/5`}
          accentColor="#E76F51"
          icon={<Star className="h-6 w-6" />}
        />
      </div>

      {/* Catalog & inventory */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Product Groups"
          value={data.catalog.productGroups}
          description="Distinct product groups in the catalog."
          accentColor="#F4A261"
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          label="Variants"
          value={data.catalog.variants}
          description="Individual SKUs across all groups."
          accentColor="#BBD686"
        />
        <StatCard
          label="Inventory Alerts"
          value={`${data.catalog.lowStockVariants} low • ${data.catalog.outOfStockVariants} out`}
          description="Based on current inventory levels."
          accentColor="#FF6B6B"
        />
      </div>
    </div>
  );
}

