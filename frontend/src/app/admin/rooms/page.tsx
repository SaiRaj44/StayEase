'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Plus, Edit, Trash2, Eye, Users, Star, ArrowLeft, LayoutDashboard, Calendar } from 'lucide-react';
import { roomsAPI, adminAPI, reviewsAPI } from '@/lib/api';
import { formatCurrency, getRoomTypeLabel } from '@/lib/utils';

interface Room {
  _id: string;
  name: string;
  type: string;
  images: string[];
  pricePerNight: number;
  maxGuests: number;
  isActive: boolean;
  location: { area: string };
  averageRating?: number;
  totalReviews?: number;
}

export default function AdminRoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getRooms();
      
      // Fetch ratings for each room
      const roomsWithRatings = await Promise.all(
        (response.rooms || []).map(async (room: Room) => {
          try {
            const reviewsRes = await reviewsAPI.getRoomReviews(room._id);
            return {
              ...room,
              averageRating: reviewsRes.averageRating || 0,
              totalReviews: reviewsRes.totalReviews || 0,
            };
          } catch {
            return { ...room, averageRating: 0, totalReviews: 0 };
          }
        })
      );
      
      setRooms(roomsWithRatings);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Demo data
      setRooms([
        {
          _id: '1',
          name: 'Venkateswara Standard Room',
          type: 'standard',
          images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
          pricePerNight: 1499,
          maxGuests: 2,
          isActive: true,
          location: { area: 'Tirupati' },
          averageRating: 4.5,
          totalReviews: 28,
        },
        {
          _id: '2',
          name: 'Padmavathi Deluxe Room',
          type: 'deluxe',
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
          pricePerNight: 2499,
          maxGuests: 3,
          isActive: true,
          location: { area: 'Tirupati' },
          averageRating: 4.8,
          totalReviews: 45,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    setDeleting(roomId);
    try {
      await adminAPI.deleteRoom(roomId);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room');
    } finally {
      setDeleting(null);
    }
  };

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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-500 transition-colors">
            <Home className="w-5 h-5" />
            Rooms
          </Link>
          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Calendar className="w-5 h-5" />
            Bookings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-1">{rooms.length} rooms total</p>
          </div>
          <Link
            href="/admin/rooms/new?new=true"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Room
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Room</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Location</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Price</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Capacity</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Rating</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={room.images[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100'}
                        alt={room.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium text-gray-900">{room.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {getRoomTypeLabel(room.type)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{room.location.area}</td>
                  <td className="py-4 px-6 font-medium text-orange-500">{formatCurrency(room.pricePerNight)}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {room.maxGuests}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {room.totalReviews && room.totalReviews > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{room.averageRating?.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({room.totalReviews})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No reviews</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {room.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/rooms/${room._id}`}
                        className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Room"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/rooms/${room._id}`}
                        className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Room"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(room._id)}
                        disabled={deleting === room._id}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
