import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold">StayEase</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your comfortable stay in the divine city of Tirupati. Experience warmth, 
              hospitality, and easy access to Tirumala temple.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rooms" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Our Rooms
                </Link>
              </li>
              <li>
                <Link href="/#amenities" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Amenities
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-gray-400 hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Useful Info</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Temple Darshan Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Near Railway Station, Tirupati, Andhra Pradesh - 517501
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-orange-500">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <a href="mailto:info@stayease.com" className="text-gray-400 hover:text-orange-500">
                  info@stayease.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} StayEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
