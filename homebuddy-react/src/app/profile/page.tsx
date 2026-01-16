"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import AccountSettings from "@/components/Profile/AccountSettings";
import DangerZone from "@/components/Profile/DangerZone";
import OrderHistory from "@/components/Profile/OrderHistory";
import { userService } from "@/services/user.service";
import Waves from "@/components/Waves";
import AnimatedContent from "@/components/AnimatedContent";

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Redirect based on authentication and role
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/");
      } else if (user.role === "Admin") {
        router.push("/admin");
      } else {
        setEmail(user.email);
      }
    }
  }, [user, isLoading, router]);

  // Fetch order history
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (user && user.role !== "Admin" && email) {
        setOrdersLoading(true);
        const response = await userService.getOrderHistory(email);
        if (response.data) {
          setOrderHistory(response.data);
        } else {
          console.error("Failed to fetch order history:", response.error);
          setOrderHistory([]);
        }
        setOrdersLoading(false);
      }
    };

    if (email) {
      fetchOrderHistory();
    }
  }, [email, user]);

  // Show a loading state or redirecting state
  if (isLoading || !user || user.role === "Admin") {
    return (
      <div className="min-h-screen bg-[#171010] flex items-center justify-center">
        {/* Optional: Add a loader here */}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen min-w-8/10 overflow-hidden bg-[#171010]"
    >
      {/* Waves background */}
      <section className="relative flex items-center py-24 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <Waves
            lineColor="#362222"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={0}
            xGap={12}
            yGap={36}
          />
        </div>
        <div className=""></div>
        {/* Main Content */}
        <div className="space-y-8 md:space-y-12 max-w-7xl mx-auto px-4 md:px-6 relative z-10 min-w-7/10">
          <ProfileHeader />
          <AnimatedContent delay={0.2} distance={30}>
            <AccountSettings email={email} setEmail={setEmail} />
          </AnimatedContent>
          <AnimatedContent delay={0.3} distance={30}>
            <OrderHistory orders={orderHistory} isLoading={ordersLoading} />
          </AnimatedContent>
          <AnimatedContent delay={0.4} distance={30}>
            <DangerZone />
          </AnimatedContent>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
