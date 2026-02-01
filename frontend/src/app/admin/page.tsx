'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardStats {
  todayCheckIns: number;
  todayCheckOuts: number;
  availableRooms: number;
  totalRooms: number;
  monthlyRevenue: number;
  totalUsers: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

interface Booking {
  _id: string;
  bookingId: string;
  user: { name: string; email: string };
  room: { name: string };
  checkIn: string;
  totalPrice: number;
  status: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  bookingsCount?: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // Check admin auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.stats);
      setRecentBookings(response.recentBookings || []);
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Demo data
      setStats({
        todayCheckIns: 3,
        todayCheckOuts: 2,
        availableRooms: 4,
        totalRooms: 6,
        monthlyRevenue: 125000,
        totalUsers: 125,
        pendingBookings: 1,
        confirmedBookings: 8,
        completedBookings: 45,
        cancelledBookings: 3,
      });
      setRecentBookings([
        {
          _id: '1',
          bookingId: 'SE2501ABC123',
          user: { name: 'Rajesh Kumar', email: 'rajesh@email.com' },
          room: { name: 'Venkateswara Standard' },
          checkIn: '2025-01-20',
          totalPrice: 2998,
          status: 'confirmed',
        },
        {
          _id: '2',
          bookingId: 'SE2501DEF456',
          user: { name: 'Priya Sharma', email: 'priya@email.com' },
          room: { name: 'Padmavathi Deluxe' },
          checkIn: '2025-01-21',
          totalPrice: 4998,
          status: 'pending',
        },
      ]);
      setUsers([
        {
          _id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh@email.com',
          phone: '9876543210',
          role: 'user',
          isBlocked: false,
          createdAt: '2025-01-10',
          bookingsCount: 3,
        },
        {
          _id: '2',
          name: 'Priya Sharma',
          email: 'priya@email.com',
          phone: '9876543211',
          role: 'user',
          isBlocked: false,
          createdAt: '2025-01-12',
          bookingsCount: 1,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      // API call would go here
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isBlocked: block } : u
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? recentBookings 
    : recentBookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 z-40">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold">StayEase</span>
        </Link>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'overview' ? 'bg-orange-500' : 'hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Home className="w-5 h-5" />
            Rooms
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Calendar className="w-5 h-5" />
            Bookings
          </Link>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-orange-500' : 'hover:bg-gray-800'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {activeTab === 'overview' ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
              </div>
            </div>

            {/* Stats Grid - Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Link href="/admin/bookings?status=pending" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Pending Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pendingBookings || 0}</p>
              </Link>

              <Link href="/admin/bookings?status=confirmed" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Confirmed Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.confirmedBookings || 0}</p>
              </Link>

              <Link href="/admin/rooms" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Available Rooms</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.availableRooms || 0}<span className="text-lg text-gray-500">/{stats?.totalRooms || 0}</span></p>
              </Link>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-sm text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-white/80" />
                </div>
                <p className="text-sm text-white/80 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
              </div>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.cancelledBookings || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings with Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                  <div className="flex gap-2">
                    {['all', 'pending', 'confirmed', 'completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          filterStatus === status
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Booking ID</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Guest</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Room</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Check-in</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{booking.bookingId}</td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{booking.user?.name}</p>
                            <p className="text-xs text-gray-500">{booking.user?.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{booking.room?.name}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{formatDate(booking.checkIn)}</td>
                        <td className="py-4 px-6 text-sm font-medium text-orange-500">{formatCurrency(booking.totalPrice)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/admin/bookings?id=${booking._id}`}
                            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Users Tab */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">Manage all registered users</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">User</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Phone</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Role</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Bookings</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Joined</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{user.phone}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{user.bookingsCount || 0}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{formatDate(user.createdAt)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleBlockUser(user._id, !user.isBlocked)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isBlocked
                                  ? 'text-green-500 hover:bg-green-50'
                                  : 'text-red-500 hover:bg-red-50'
                              }`}
                              title={user.isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
