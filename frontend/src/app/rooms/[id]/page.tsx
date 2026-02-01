'use client';

import { useState, useEffect, Suspense, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Users, Star, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { roomsAPI } from '@/lib/api';
import { formatCurrency, getRoomTypeLabel, amenityIcons, calculateNights, getTomorrowDate, getDateAfterDays } from '@/lib/utils';
import ReviewList from '@/components/ReviewList';

interface Room {
  _id: string;
  name: string;
  type: string;
  description: string;
  images: string[];
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  houseRules: string[];
  cancellationPolicy: string;
  location: {
    area: string;
    address: string;
  };
}

function RoomDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || getTomorrowDate());
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || getDateAfterDays(2));
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests') || '2'));
  const [availability, setAvailability] = useState<{ available: boolean; nights: number; totalPrice: number } | null>(null);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (room && checkIn && checkOut) {
      checkAvailability();
    }
  }, [room, checkIn, checkOut]);

  const fetchRoom = async () => {
    setLoading(true);
    try {
      const response = await roomsAPI.getRoom(id);
      setRoom(response.room);
    } catch (error) {
      console.error('Error fetching room:', error);
      // Sample data fallback
      setRoom({
        _id: id,
        name: 'Venkateswara Standard Room',
        type: 'standard',
        description: 'Comfortable standard room perfect for pilgrims visiting Tirumala. Features a clean and cozy environment with all essential amenities for a pleasant stay. Located in the heart of Tirupati with easy access to bus stands and railway station. Enjoy a peaceful rest after your spiritual journey with our well-maintained rooms featuring comfortable beds, modern bathroom facilities, and round-the-clock room service.',
        images: [
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
        pricePerNight: 1499,
        maxGuests: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Parking'],
        houseRules: [
          'Check-in: 12:00 PM',
          'Check-out: 11:00 AM',
          'No smoking inside the room',
          'Valid ID proof required at check-in',
        ],
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in. After that, the first night is non-refundable.',
        location: {
          area: 'Tirupati',
          address: 'Near Tirupati Railway Station, Tirupati, Andhra Pradesh 517501',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!room) return;
    try {
      const response = await roomsAPI.checkAvailability(room._id, checkIn, checkOut);
      setAvailability({
        available: response.available,
        nights: response.nights,
        totalPrice: response.totalPrice,
      });
    } catch {
      // Calculate locally if API fails
      const nights = calculateNights(checkIn, checkOut);
      setAvailability({
        available: true,
        nights,
        totalPrice: nights * (room?.pricePerNight || 0),
      });
    }
  };

  const handleBookNow = () => {
    const params = new URLSearchParams({
      roomId: room?._id || '',
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/booking?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h2>
          <Link href="/rooms" className="btn-primary">
            Browse Rooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/rooms" className="inline-flex items-center text-gray-600 hover:text-orange-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative rounded-2xl overflow-hidden mb-6">
              <img
                src={room.images[currentImage] || room.images[0]}
                alt={room.name}
                className="w-full h-[400px] object-cover"
              />
              {room.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === room.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-4">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium">
                  {getRoomTypeLabel(room.type)}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {room.images.length > 1 && (
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {room.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Room Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{room.name}</h1>
                  <div className="flex items-center gap-4 text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {room.location.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Up to {room.maxGuests} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      4.8 (120 reviews)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-500">
                    {formatCurrency(room.pricePerNight)}
                  </div>
                  <div className="text-gray-500">per night</div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{room.description}</p>

              <div className="text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                {room.location.address}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <span className="text-2xl">{amenityIcons[amenity] || '✓'}</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">House Rules</h2>
              <ul className="space-y-2">
                {room.houseRules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancellation Policy</h2>
              <p className="text-gray-700">{room.cancellationPolicy}</p>
            </div>

            {/* Reviews Section */}
            <ReviewList roomId={room._id} />
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(room.pricePerNight)}
                <span className="text-base font-normal text-gray-500"> / night</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-6">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                4.8 · 120 reviews
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={getTomorrowDate()}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {availability && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>{formatCurrency(room.pricePerNight)} × {availability.nights} nights</span>
                    <span>{formatCurrency(availability.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 mb-2">
                    <span>Service fee</span>
                    <span>{formatCurrency(Math.round(availability.totalPrice * 0.05))}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-bold text-lg pt-2  border-t">
                    <span>Total</span>
                    <span>{formatCurrency(Math.round(availability.totalPrice * 1.05))}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                disabled={!availability?.available}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availability?.available ? 'Book Now' : 'Not Available'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                You won&apos;t be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
      <RoomDetailContent id={id} />
    </Suspense>
  );
}
