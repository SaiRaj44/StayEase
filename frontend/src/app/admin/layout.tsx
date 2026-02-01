import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - StayEase Tirupati",
  description: "Admin dashboard for StayEase hotel management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100">
      {children}
    </div>
  );
}
