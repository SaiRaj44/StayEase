'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Download, Home } from 'lucide-react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'SE2501XXXXXX';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for choosing StayEase. Your booking has been confirmed.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
            <p className="text-2xl font-bold text-orange-500">{bookingId}</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              What&apos;s Next?
            </h3>
            <ul className="text-sm text-orange-700 space-y-2">
              <li>• A confirmation email has been sent to your email address</li>
              <li>• Please carry a valid ID proof for check-in</li>
              <li>• Check-in time is 12:00 PM</li>
              <li>• Contact us for any darshan assistance</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/user/bookings" className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              View Booking
            </Link>
            <Link href="/" className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? Contact us at{' '}
            <a href="tel:+919876543210" className="text-orange-500">
              +91 98765 43210
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
