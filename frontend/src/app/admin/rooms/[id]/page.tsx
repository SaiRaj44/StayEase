'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { adminAPI, roomsAPI } from '@/lib/api';

interface RoomForm {
  name: string;
  type: string;
  description: string;
  pricePerNight: number;
  pricePerExtraGuest: number;
  maxGuests: number;
  images: string[];
  amenities: string[];
  location: {
    area: string;
    address: string;
  };
  isActive: boolean;
}

const roomTypes = ['standard', 'deluxe', 'suite', 'premium'];
const areas = ['Tirupati', 'Tirumala', 'Alipiri', 'Kapila Theertham', 'Chandragiri', 'Sri Kalahasti'];
const availableAmenities = ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Breakfast', 'Temple View', 'Balcony', 'Safe Locker', 'Parking', 'Swimming Pool'];

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
  const roomId = params.id as string;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<RoomForm>({
    name: '',
    type: 'standard',
    description: '',
    pricePerNight: 1499,
    pricePerExtraGuest: 500,
    maxGuests: 2,
    images: [''],
    amenities: ['WiFi', 'AC'],
    location: {
      area: 'Tirupati',
      address: '',
    },
    isActive: true,
  });

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

    if (!isNew && roomId) {
      fetchRoom();
    }
  }, [router, isNew, roomId]);

  const fetchRoom = async () => {
    try {
      const response = await roomsAPI.getRoom(roomId);
      const room = response.room;
      setForm({
        name: room.name || '',
        type: room.type || 'standard',
        description: room.description || '',
        pricePerNight: room.pricePerNight || 1499,
        pricePerExtraGuest: room.pricePerExtraGuest || 500,
        maxGuests: room.maxGuests || 2,
        images: room.images?.length ? room.images : [''],
        amenities: room.amenities || [],
        location: {
          area: room.location?.area || 'Tirupati',
          address: room.location?.address || '',
        },
        isActive: room.isActive ?? true,
      });
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...form,
        images: form.images.filter(img => img.trim() !== ''),
      };

      if (isNew) {
        await adminAPI.createRoom(data);
      } else {
        await adminAPI.updateRoom(roomId, data);
      }
      
      router.push('/admin/rooms');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...form.images];
    newImages[index] = value;
    setForm({ ...form, images: newImages });
  };

  const addImage = () => {
    setForm({ ...form, images: [...form.images, ''] });
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages.length ? newImages : [''] });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = form.amenities.includes(amenity)
      ? form.amenities.filter(a => a !== amenity)
      : [...form.amenities, amenity];
    setForm({ ...form, amenities: newAmenities });
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
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-3xl">
          <Link 
            href="/admin/rooms" 
            className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isNew ? 'Add New Room' : 'Edit Room'}
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Venkateswara Standard Room"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={form.maxGuests}
                    onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) })}
                    className="input-field"
                    min={1}
                    max={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Night (₹)</label>
                  <input
                    type="number"
                    value={form.pricePerNight}
                    onChange={(e) => setForm({ ...form, pricePerNight: parseInt(e.target.value) })}
                    className="input-field"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Guest Price (₹)</label>
                  <input
                    type="number"
                    value={form.pricePerExtraGuest}
                    onChange={(e) => setForm({ ...form, pricePerExtraGuest: parseInt(e.target.value) })}
                    className="input-field"
                    min={0}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="input-field min-h-[100px]"
                    placeholder="Describe the room..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <select
                    value={form.location.area}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, area: e.target.value } })}
                    className="input-field"
                  >
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.location.address}
                    onChange={(e) => setForm({ ...form, location: { ...form.location, address: e.target.value } })}
                    className="input-field"
                    placeholder="e.g., Near Railway Station"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              
              <div className="space-y-3">
                {form.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="flex items-center gap-2 text-orange-500 font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Image URL
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map(amenity => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.amenities.includes(amenity)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Room Status</h2>
                  <p className="text-sm text-gray-500">Toggle room availability</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="spinner w-4 h-4 border-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isNew ? 'Create Room' : 'Save Changes'}
                  </>
                )}
              </button>
              <Link href="/admin/rooms" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
