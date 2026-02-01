'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, XCircle, CheckCircle, Clock, AlertCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingsAPI } from '@/lib/api';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import ReviewForm from '@/components/ReviewForm';

interface Booking {
  _id: string;
  bookingId: string;
  room: {
    _id: string;
    name: string;
    type: string;
    images: string[];
    pricePerNight: number;
    location: {
      area: string;
    };
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  hasReview?: boolean;
}

const ITEMS_PER_PAGE = 5;

export default function UserBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/user/bookings');
      return;
    }
    fetchBookings();
  }, [router]);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Sample data for demo
      setBookings([
        {
          _id: '1',
          bookingId: 'SE2501ABC123',
          room: {
            _id: '1',
            name: 'Venkateswara Standard Room',
            type: 'standard',
            images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
            pricePerNight: 1499,
            location: { area: 'Tirupati' },
          },
          checkIn: '2025-01-15',
          checkOut: '2025-01-17',
          guests: 2,
          totalPrice: 2998,
          status: 'completed',
          createdAt: '2025-01-10',
          hasReview: false,
        },
        {
          _id: '2',
          bookingId: 'SE2501DEF456',
          room: {
            _id: '2',
            name: 'Padmavathi Deluxe Room',
            type: 'deluxe',
            images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
            pricePerNight: 2499,
            location: { area: 'Tirupati' },
          },
          checkIn: '2025-01-25',
          checkOut: '2025-01-27',
          guests: 2,
          totalPrice: 4998,
          status: 'confirmed',
          createdAt: '2025-01-19',
        },
        {
          _id: '3',
          bookingId: 'SE2501GHI789',
          room: {
            _id: '3',
            name: 'Tirumala View Suite',
            type: 'suite',
            images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
            pricePerNight: 4999,
            location: { area: 'Alipiri' },
          },
          checkIn: '2025-02-01',
          checkOut: '2025-02-03',
          guests: 3,
          totalPrice: 9998,
          status: 'confirmed',
          createdAt: '2025-01-18',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancelling(bookingId);
    try {
      await bookingsAPI.cancelBooking(bookingId, 'User requested cancellation');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const handleReviewSuccess = () => {
    setReviewBooking(null);
    fetchBookings();
    alert('Thank you for your review!');
  };

  const canReview = (booking: Booking) => {
    return booking.status === 'completed' && !booking.hasReview;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Pagination
  const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = bookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <span className="text-gray-500">{bookings.length} total bookings</span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-600 mb-6">Start exploring rooms and make your first booking!</p>
            <Link href="/rooms" className="btn-primary">
              Browse Rooms
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-32 md:h-auto">
                      <img
                        src={booking.room?.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'}
                        alt={booking.room?.name || 'Room'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.room?.name || 'Room'}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.room?.location?.area || 'Tirupati'}
                          </p>
                        </div>
                        <span className={`badge ${getStatusColor(booking.status)} flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500">Booking ID</p>
                          <p className="font-medium text-gray-900">{booking.bookingId}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check-in</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Check-out</p>
                          <p className="font-medium text-gray-900">{formatDate(booking.checkOut)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold text-orange-500">{formatCurrency(booking.totalPrice)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/rooms/${booking.room?._id}`}
                          className="text-sm text-orange-500 font-medium hover:underline"
                        >
                          View Room
                        </Link>
                        {canReview(booking) && (
                          <button
                            onClick={() => setReviewBooking(booking)}
                            className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Write Review
                          </button>
                        )}
                        {booking.hasReview && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Reviewed
                          </span>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancelling === booking._id}
                            className="text-sm text-red-500 font-medium hover:underline disabled:opacity-50"
                          >
                            {cancelling === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-500 mt-4">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, bookings.length)} of {bookings.length} bookings
            </p>
          </>
        )}
      </div>

      {/* Review Form Modal */}
      {reviewBooking && (
        <ReviewForm
          bookingId={reviewBooking._id}
          roomName={reviewBooking.room?.name || 'Room'}
          onSuccess={handleReviewSuccess}
          onClose={() => setReviewBooking(null)}
        />
      )}
    </div>
  );
}
