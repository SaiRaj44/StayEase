'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, MapPin, Users, Star, Calendar, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { roomsAPI, reviewsAPI } from '@/lib/api';
import { formatCurrency, getRoomTypeLabel, amenityIcons, getTomorrowDate, getDateAfterDays } from '@/lib/utils';

interface Room {
  _id: string;
  name: string;
  type: string;
  description: string;
  images: string[];
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  location: {
    area: string;
    address: string;
  };
  averageRating?: number;
  totalReviews?: number;
  isAvailable?: boolean;
}

function RoomsContent() {
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    area: searchParams.get('area') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    guests: searchParams.get('guests') || '',
    checkIn: searchParams.get('checkIn') || getTomorrowDate(),
    checkOut: searchParams.get('checkOut') || getDateAfterDays(2),
  });

  const areas = ['Tirupati', 'Tirumala', 'Alipiri', 'Kapila Theertham', 'Chandragiri', 'Sri Kalahasti'];
  const roomTypes = ['standard', 'deluxe', 'suite', 'premium'];
  const priceRanges = [
    { label: 'Under ₹2,000', min: 0, max: 2000 },
    { label: '₹2,000 - ₹4,000', min: 2000, max: 4000 },
    { label: '₹4,000 - ₹6,000', min: 4000, max: 6000 },
    { label: 'Above ₹6,000', min: 6000, max: 20000 },
  ];

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Auto-apply filters when any filter changes
  useEffect(() => {
    if (allRooms.length > 0) {
      applyFiltersLocally();
    }
  }, [filters, allRooms]);

  const fetchRooms = async () => {
    setLoading(true);
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
              isAvailable: true,
            };
          } catch {
            return { ...room, averageRating: 0, totalReviews: 0, isAvailable: true };
          }
        })
      );
      
      setAllRooms(roomsWithRatings);
      setRooms(roomsWithRatings);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      const sampleRooms = [
        {
          _id: '1',
          name: 'Venkateswara Standard Room',
          type: 'standard',
          description: 'Comfortable standard room perfect for pilgrims visiting Tirumala.',
          images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
          pricePerNight: 1499,
          maxGuests: 2,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service'],
          location: { area: 'Tirupati', address: 'Near Railway Station' },
          averageRating: 4.5,
          totalReviews: 28,
          isAvailable: true,
        },
        {
          _id: '2',
          name: 'Padmavathi Deluxe Room',
          type: 'deluxe',
          description: 'Spacious deluxe room with modern amenities and elegant decor.',
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
          pricePerNight: 2499,
          maxGuests: 3,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Breakfast'],
          location: { area: 'Tirupati', address: 'Gandhi Road' },
          averageRating: 4.8,
          totalReviews: 45,
          isAvailable: true,
        },
        {
          _id: '3',
          name: 'Tirumala View Suite',
          type: 'suite',
          description: 'Luxurious suite with breathtaking views of the Tirumala hills.',
          images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
          pricePerNight: 4999,
          maxGuests: 4,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Temple View', 'Balcony'],
          location: { area: 'Alipiri', address: 'Alipiri Road' },
          averageRating: 4.9,
          totalReviews: 62,
          isAvailable: true,
        },
        {
          _id: '4',
          name: 'Govinda Premium Room',
          type: 'premium',
          description: 'Our finest accommodation featuring world-class amenities.',
          images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
          pricePerNight: 7999,
          maxGuests: 2,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Temple View', 'Balcony', 'Safe Locker'],
          location: { area: 'Tirumala', address: 'Near Temple' },
          averageRating: 5.0,
          totalReviews: 15,
          isAvailable: true,
        },
        {
          _id: '5',
          name: 'Sacred Hills Suite',
          type: 'suite',
          description: 'Elegant suite with panoramic views and premium services.',
          images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
          pricePerNight: 5499,
          maxGuests: 4,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Temple View'],
          location: { area: 'Tirumala', address: 'Near Bus Stand' },
          averageRating: 4.7,
          totalReviews: 33,
          isAvailable: true,
        },
        {
          _id: '6',
          name: 'Lakshmi Standard Room',
          type: 'standard',
          description: 'Clean and comfortable room for budget-conscious travelers.',
          images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
          pricePerNight: 1299,
          maxGuests: 2,
          amenities: ['WiFi', 'AC', 'TV', 'Hot Water'],
          location: { area: 'Tirupati', address: 'Near Bus Stand' },
          averageRating: 4.2,
          totalReviews: 18,
          isAvailable: true,
        },
      ];
      setAllRooms(sampleRooms);
      setRooms(sampleRooms);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersLocally = useCallback(() => {
    let filtered = [...allRooms];
    
    if (filters.type) {
      filtered = filtered.filter(room => room.type === filters.type);
    }
    if (filters.area) {
      filtered = filtered.filter(room => room.location.area === filters.area);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(room => room.pricePerNight >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(room => room.pricePerNight <= parseInt(filters.maxPrice));
    }
    if (filters.guests) {
      filtered = filtered.filter(room => room.maxGuests >= parseInt(filters.guests));
    }
    
    setRooms(filtered);
  }, [allRooms, filters]);

  const clearFilters = () => {
    setFilters({
      type: '',
      area: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      checkIn: getTomorrowDate(),
      checkOut: getDateAfterDays(2),
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Dates */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          Dates
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Check-in</label>
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })}
              min={getTomorrowDate()}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 text-gray-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Check-out</label>
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => setFilters({ ...filters, checkOut: e.target.value })}
              min={filters.checkIn}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 text-gray-900 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Guests */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-500" />
          Guests
        </h3>
        <select
          value={filters.guests}
          onChange={(e) => setFilters({ ...filters, guests: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500 text-gray-900 bg-white"
        >
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={num}>{num}+ Guests</option>
          ))}
        </select>
      </div>

      {/* Room Type */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Room Type</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="roomType"
              checked={filters.type === ''}
              onChange={() => setFilters({ ...filters, type: '' })}
              className="w-4 h-4 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">All Types</span>
          </label>
          {roomTypes.map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="roomType"
                checked={filters.type === type}
                onChange={() => setFilters({ ...filters, type: type })}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{getRoomTypeLabel(type)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              checked={!filters.minPrice && !filters.maxPrice}
              onChange={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
              className="w-4 h-4 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">Any Price</span>
          </label>
          {priceRanges.map((range) => (
            <label key={range.label} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="priceRange"
                checked={filters.minPrice === range.min.toString() && filters.maxPrice === range.max.toString()}
                onChange={() => setFilters({ ...filters, minPrice: range.min.toString(), maxPrice: range.max.toString() })}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Location
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="location"
              checked={filters.area === ''}
              onChange={() => setFilters({ ...filters, area: '' })}
              className="w-4 h-4 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">All Areas</span>
          </label>
          {areas.map((area) => (
            <label key={area} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="location"
                checked={filters.area === area}
                onChange={() => setFilters({ ...filters, area })}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">{area}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <div className="pt-4 border-t">
        <button 
          onClick={clearFilters} 
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Clear All Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
            <p className="text-gray-600 mt-1">
              {rooms.length} rooms found
            </p>
          </div>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Left Sidebar - Filters (Desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-orange-500" />
                  Filters
                </h2>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          {/* Room Grid - 3 columns */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <p className="text-gray-600 text-lg mb-4">No rooms match your filters.</p>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters to find more rooms.</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    href={`/rooms/${room._id}?checkIn=${filters.checkIn}&checkOut=${filters.checkOut}&guests=${filters.guests || 2}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={room.images[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                        alt={room.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                          {getRoomTypeLabel(room.type)}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(room.pricePerNight)}
                        </span>
                        <span className="text-gray-500 text-xs">/night</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors line-clamp-1">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {room.location.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {room.maxGuests}
                        </span>
                        {room.totalReviews && room.totalReviews > 0 ? (
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-gray-900">{room.averageRating?.toFixed(1)}</span>
                          </span>
                        ) : null}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
      <RoomsContent />
    </Suspense>
  );
}
