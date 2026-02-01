'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Star, Wifi, Car, Coffee, Shield, ChevronDown, ArrowRight, Send, Users } from 'lucide-react';
import { getTomorrowDate, getDateAfterDays } from '@/lib/utils';
import { reviewsAPI } from '@/lib/api';

interface Review {
  _id: string;
  user: { name: string };
  rating: number;
  title: string;
  comment: string;
  stayDate: string;
}

export default function HomePage() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(getTomorrowDate());
  const [checkOut, setCheckOut] = useState(getDateAfterDays(2));
  const [guests, setGuests] = useState(2);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Try to get reviews from multiple rooms
      const response = await reviewsAPI.getRoomReviews('all');
      if (response.reviews?.length > 0) {
        setReviews(response.reviews.slice(0, 3));
      }
    } catch {
      // Fallback reviews
      setReviews([
        {
          _id: '1',
          user: { name: 'Rajesh Kumar' },
          rating: 5,
          title: 'Excellent stay!',
          comment: 'Very close to the temple and staff was extremely helpful with darshan arrangements.',
          stayDate: '2025-01-15',
        },
        {
          _id: '2',
          user: { name: 'Priya Sharma' },
          rating: 5,
          title: 'Clean and comfortable',
          comment: 'The temple view from our suite was breathtaking. Will definitely come back!',
          stayDate: '2025-01-10',
        },
        {
          _id: '3',
          user: { name: 'Venkat Rao' },
          rating: 4,
          title: 'Great location',
          comment: 'Good location and comfortable rooms. The staff helped us with VIP darshan tickets.',
          stayDate: '2025-01-05',
        },
      ]);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/rooms?${params.toString()}`);
  };

  const scrollToRooms = () => {
    const roomsSection = document.getElementById('rooms-section');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending email (in production, connect to backend)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Open mailto link as fallback
    const mailtoLink = `mailto:developer@stayease.com?subject=Contact from ${contactForm.name}&body=${encodeURIComponent(contactForm.message)}%0A%0AFrom: ${contactForm.email}`;
    window.open(mailtoLink, '_blank');
    
    setSending(false);
    setSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  const roomTypes = [
    {
      type: 'standard',
      name: 'Standard Room',
      price: '₹1,499',
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600',
      features: ['Comfortable bed', 'AC & WiFi', 'Daily housekeeping'],
    },
    {
      type: 'deluxe',
      name: 'Deluxe Room',
      price: '₹2,499',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
      features: ['Spacious room', 'Mini fridge', 'Breakfast included'],
    },
    {
      type: 'suite',
      name: 'Suite',
      price: '₹4,999',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600',
      features: ['Temple view', 'Living area', 'Premium amenities'],
    },
    {
      type: 'premium',
      name: 'Premium Room',
      price: '₹7,999',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      features: ['Luxury experience', '24/7 butler', 'Exclusive access'],
    },
  ];

  const amenities = [
    { icon: Wifi, name: 'Free WiFi', desc: 'High-speed internet' },
    { icon: Car, name: 'Free Parking', desc: 'Secure parking space' },
    { icon: Coffee, name: 'Breakfast', desc: 'Complimentary breakfast' },
    { icon: Shield, name: 'Temple Assist', desc: 'Darshan guidance' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <MapPin className="w-4 h-4" />
              Tirupati & Tirumala, Andhra Pradesh
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Divine Stay
              <span className="block text-gradient mt-2">Near Tirumala Temple</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Experience comfort and spirituality at StayEase. Premium rooms with easy 
              access to the sacred Tirumala Venkateswara Temple.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Check-in */}
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
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

                {/* Check-out */}
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
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

                {/* Guests - Simple Dropdown */}
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1 text-orange-500" />
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3.5"
                  >
                    Search Rooms
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="animate-fade-in-up stagger-3 mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
              <div className="text-white/70">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">4.8</div>
              <div className="text-white/70 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">6</div>
              <div className="text-white/70">Room Types</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator - Now functional */}
        <button 
          onClick={scrollToRooms}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:scale-110 transition-transform"
          aria-label="Scroll to rooms"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </button>
      </section>

      {/* Room Types Section */}
      <section id="rooms-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Room Types
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From comfortable standard rooms to luxurious suites, find the perfect 
              accommodation for your spiritual journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomTypes.map((room) => (
              <Link
                key={room.type}
                href={`/rooms?type=${room.type}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-900">
                      {room.price}<span className="text-gray-500 text-xs">/night</span>
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {room.name}
                  </h3>
                  <ul className="space-y-2">
                    {room.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center text-orange-500 font-medium text-sm group-hover:gap-2 transition-all">
                    View Rooms
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything You Need for a 
                <span className="text-orange-500"> Comfortable Stay</span>
              </h2>
              <p className="text-gray-600 mb-8">
                We understand the needs of pilgrims and travelers. Our amenities are 
                designed to make your stay as comfortable and convenient as possible.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <amenity.icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{amenity.name}</h3>
                      <p className="text-sm text-gray-600">{amenity.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/rooms" className="inline-flex items-center gap-2 btn-primary mt-8">
                Explore All Rooms
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"
                alt="Comfortable room"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-gray-900">4.8/5</span>
                </div>
                <p className="text-sm text-gray-600">Rated by 500+ happy guests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Dynamic */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Guests Say
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Don&apos;t just take our word for it. Here&apos;s what our guests have to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gray-600" />
                  ))}
                </div>
                <h4 className="font-semibold text-white mb-2">{review.title}</h4>
                <p className="text-gray-300 mb-4">&ldquo;{review.comment}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">{review.user?.name || 'Guest'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"
                alt="About StayEase"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About <span className="text-orange-500">StayEase Tirupati</span>
              </h2>
              <p className="text-gray-600 mb-4">
                StayEase Tirupati is your trusted accommodation partner in the divine city of 
                Tirupati. Located conveniently near major landmarks, we offer easy access to 
                the sacred Tirumala Venkateswara Temple.
              </p>
              <p className="text-gray-600 mb-6">
                Our mission is to provide pilgrims and travelers with comfortable, clean, and 
                affordable accommodation. With our 24/7 support and temple darshan assistance, 
                we ensure your spiritual journey is hassle-free.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                  Strategic location near railway station & bus stand
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                  Temple darshan token assistance available
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</span>
                  24/7 front desk and customer support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Have questions? We&apos;re here to help. Reach out to us anytime.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8">
            {sent && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-6 text-center">
                ✓ Message sent! We&apos;ll get back to you soon.
              </div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="input-field" 
                  placeholder="Your name" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="input-field" 
                  placeholder="your@email.com" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="input-field min-h-[120px]" 
                  placeholder="Your message..." 
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={sending}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="spinner w-5 h-5 border-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Don&apos;t miss out on the best rooms. Book now and enjoy a comfortable stay in Tirupati.
          </p>
          <Link
            href="/rooms"
            className="inline-flex items-center gap-2 bg-white text-orange-500 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse All Rooms
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
