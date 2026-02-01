'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Bed, Calendar, ArrowLeft, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

interface Booking {
  _id: string;
  bookingId: string;
  room: { _id?: string; name: string; type: string };
  user: { name: string; email: string; phone: string };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  guestDetails: { name: string; email: string; phone: string };
  createdAt: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData || JSON.parse(userData).role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [router, filter]);

  const fetchBookings = async () => {
    try {
      const response = await adminAPI.getAllBookings(filter ? { status: filter } : undefined);
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Demo data
      setBookings([
        { _id: '1', bookingId: 'SE2501ABC', room: { name: 'Deluxe Room', type: 'deluxe' }, user: { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210' }, checkIn: '2025-01-25', checkOut: '2025-01-27', guests: 2, totalPrice: 4998, status: 'confirmed', guestDetails: { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210' }, createdAt: '2025-01-19' },
        { _id: '2', bookingId: 'SE2501DEF', room: { name: 'Standard Room', type: 'standard' }, user: { name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211' }, checkIn: '2025-01-26', checkOut: '2025-01-28', guests: 1, totalPrice: 2998, status: 'pending', guestDetails: { name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211' }, createdAt: '2025-01-19' },
        { _id: '3', bookingId: 'SE2501GHI', room: { name: 'Suite', type: 'suite' }, user: { name: 'Venkat Rao', email: 'venkat@email.com', phone: '9876543212' }, checkIn: '2025-01-20', checkOut: '2025-01-22', guests: 3, totalPrice: 9998, status: 'completed', guestDetails: { name: 'Venkat Rao', email: 'venkat@email.com', phone: '9876543212' }, createdAt: '2025-01-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await adminAPI.updateBookingStatus(id, status);
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update booking status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold">StayEase</span>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" />Dashboard
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <Bed className="w-5 h-5" />Rooms
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white">
            <Calendar className="w-5 h-5" />Bookings
          </Link>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <Link href="/" className="text-gray-400 text-sm hover:text-white">← Back to Website</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1 mb-2 lg:hidden">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field max-w-[200px]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Booking</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Guest</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Room</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Dates</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="font-medium">{booking.bookingId}</div>
                        <div className="text-xs text-gray-500">{formatDate(booking.createdAt)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{booking.guestDetails?.name || booking.user?.name}</div>
                        <div className="text-xs text-gray-500">{booking.guestDetails?.phone || booking.user?.phone}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{booking.room?.name}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm">{formatDate(booking.checkIn)}</div>
                        <div className="text-xs text-gray-500">to {formatDate(booking.checkOut)}</div>
                      </td>
                      <td className="py-4 px-6 font-medium">{formatCurrency(booking.totalPrice)}</td>
                      <td className="py-4 px-6">
                        <span className={`badge ${getStatusColor(booking.status)} inline-flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link href={`/rooms/${booking.room?._id || '1'}`} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View Room">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(booking._id, 'confirmed')}
                              disabled={updating === booking._id}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => updateStatus(booking._id, 'cancelled')}
                              disabled={updating === booking._id}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(booking._id, 'completed')}
                              disabled={updating === booking._id}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
