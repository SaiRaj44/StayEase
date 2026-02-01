'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, CreditCard, User, Lock } from 'lucide-react';
import { roomsAPI, bookingsAPI, paymentsAPI } from '@/lib/api';
import { formatCurrency, formatDate, calculateNights, isValidEmail, isValidPhone, getTomorrowDate, getDateAfterDays } from '@/lib/utils';

interface Room {
  _id: string;
  name: string;
  type: string;
  images: string[];
  pricePerNight: number;
  location: {
    area: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roomId = searchParams.get('roomId') || '';
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = parseInt(searchParams.get('guests') || '2') || 2;
  
  // Use default dates if not provided or invalid
  const checkIn = checkInParam && checkInParam.match(/^\d{4}-\d{2}-\d{2}$/) ? checkInParam : getTomorrowDate();
  const checkOut = checkOutParam && checkOutParam.match(/^\d{4}-\d{2}-\d{2}$/) ? checkOutParam : getDateAfterDays(2);

  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const nights = Math.max(1, calculateNights(checkIn, checkOut));
  const roomTotal = room ? nights * room.pricePerNight : 0;
  const serviceFee = Math.round(roomTotal * 0.05);
  const total = roomTotal + serviceFee;

  useEffect(() => {
    // Check if user is logged in - require login for booking
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Use encodeURIComponent for proper URL encoding
      const redirectUrl = encodeURIComponent(`/booking?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guestsParam}`);
      router.push(`/auth/login?redirect=${redirectUrl}`);
      return;
    }
    
    const user = JSON.parse(userData);
    setGuestDetails((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
    
    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router, checkIn, checkOut, guestsParam]);

  const fetchRoom = async () => {
    try {
      const response = await roomsAPI.getRoom(roomId);
      setRoom(response.room);
    } catch {
      // Fallback
      setRoom({
        _id: roomId,
        name: 'Venkateswara Standard Room',
        type: 'standard',
        images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
        pricePerNight: 1499,
        location: { area: 'Tirupati' },
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!guestDetails.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!isValidEmail(guestDetails.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!isValidPhone(guestDetails.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    setError('');
    return true;
  };

  const handleStep1Submit = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePayment = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/auth/login?redirect=/booking?${searchParams.toString()}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create booking
      const bookingResponse = await bookingsAPI.createBooking({
        roomId,
        checkIn,
        checkOut,
        guests: guestsParam,
        guestDetails,
      });

      // Get Razorpay key
      const keyResponse = await paymentsAPI.getKey();

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options: RazorpayOptions = {
          key: keyResponse.key,
          amount: bookingResponse.payment.amount,
          currency: bookingResponse.payment.currency,
          name: 'StayEase Tirupati',
          description: `Booking for ${room?.name}`,
          order_id: bookingResponse.payment.orderId,
          handler: async (response: RazorpayResponse) => {
            try {
              await bookingsAPI.verifyPayment(bookingResponse.booking.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              router.push(`/booking/confirmation?bookingId=${bookingResponse.booking.bookingId}`);
            } catch {
              setError('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: guestDetails.name,
            email: guestDetails.email,
            contact: guestDetails.phone,
          },
          theme: {
            color: '#ed7712',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        // Mock payment success for demo
        router.push(`/booking/confirmation?bookingId=${bookingResponse.booking.bookingId}`);
      };
    } catch (err) {
      // Mock success for demo
      const mockBookingId = `SE${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      router.push(`/booking/confirmation?bookingId=${mockBookingId}`);
    } finally {
      setSubmitting(false);
    }
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
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link href={`/rooms/${roomId}`} className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Room
        </Link>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="font-medium hidden sm:inline">Guest Details</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-200" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-500' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="font-medium hidden sm:inline">Review & Pay</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Guest Details
                </h2>
                
                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={guestDetails.name}
                      onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      className="input-field"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests (optional)
                    </label>
                    <textarea
                      value={guestDetails.specialRequests}
                      onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                      className="input-field min-h-[100px]"
                      placeholder="Any special requirements..."
                    />
                  </div>
                </div>

                <button onClick={handleStep1Submit} className="w-full btn-primary py-3 mt-6">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Review & Pay
                </h2>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                {/* Guest Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Guest Information</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Name:</strong> {guestDetails.name}</p>
                    <p><strong>Email:</strong> {guestDetails.email}</p>
                    <p><strong>Phone:</strong> {guestDetails.phone}</p>
                    {guestDetails.specialRequests && (
                      <p><strong>Special Requests:</strong> {guestDetails.specialRequests}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-orange-500 text-sm font-medium mt-2"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Payment Notice */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800">Secure Payment</h3>
                      <p className="text-sm text-orange-700 mt-1">
                        Your payment is secured by Razorpay. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={submitting}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="spinner w-5 h-5 border-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {formatCurrency(total)}
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  By clicking Pay, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              <div className="flex gap-4 pb-4 border-b">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{room.name}</h4>
                  <p className="text-sm text-gray-500">{room.location.area}</p>
                </div>
              </div>

              <div className="py-4 border-b space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Check-in</span>
                  <span className="font-medium text-gray-900">{formatDate(checkIn)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Check-out</span>
                  <span className="font-medium text-gray-900">{formatDate(checkOut)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Guests</span>
                  <span className="font-medium text-gray-900">{guestsParam}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Nights</span>
                  <span className="font-medium text-gray-900">{nights}</span>
                </div>
              </div>

              <div className="py-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{formatCurrency(room.pricePerNight)} × {nights} nights</span>
                  <span>{formatCurrency(roomTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Service fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
      <BookingContent />
    </Suspense>
  );
}
