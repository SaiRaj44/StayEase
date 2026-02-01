// Seed data for StayEase - Run with: node src/utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Room = require('../models/Room');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const rooms = [
  {
    name: 'Venkateswara Standard Room',
    type: 'standard',
    description: 'Comfortable standard room perfect for pilgrims visiting Tirumala. Features a clean and cozy environment with all essential amenities for a pleasant stay. Located in the heart of Tirupati with easy access to bus stands and railway station.',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ],
    pricePerNight: 1499,
    maxGuests: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'No smoking inside the room',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Tirupati',
      address: 'Near Tirupati Railway Station, Tirupati, Andhra Pradesh 517501'
    }
  },
  {
    name: 'Padmavathi Deluxe Room',
    type: 'deluxe',
    description: 'Spacious deluxe room with modern amenities and elegant decor. Enjoy a comfortable stay with premium bedding, work desk, and a beautiful view of the city. Ideal for families and couples seeking comfort during their pilgrimage.',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
    ],
    pricePerNight: 2499,
    maxGuests: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Breakfast'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'No smoking inside the room',
      'Pets not allowed',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Tirupati',
      address: 'Gandhi Road, Near APSRTC Bus Stand, Tirupati, Andhra Pradesh 517501'
    }
  },
  {
    name: 'Tirumala View Suite',
    type: 'suite',
    description: 'Luxurious suite with breathtaking views of the Tirumala hills. Features a separate living area, premium bathroom with bathtub, and exclusive amenities. Perfect for those seeking a memorable and comfortable pilgrimage experience.',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'
    ],
    pricePerNight: 4999,
    maxGuests: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Breakfast', 'Temple View', 'Balcony', 'Safe Locker'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'No smoking inside the room',
      'No parties or events',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Alipiri',
      address: 'Alipiri Road, Near Alipiri Footpath, Tirupati, Andhra Pradesh 517501'
    }
  },
  {
    name: 'Govinda Premium Room',
    type: 'premium',
    description: 'Our finest accommodation featuring world-class amenities and impeccable service. Experience the ultimate in luxury with a king-size bed, premium toiletries, 24/7 butler service, and exclusive access to our rooftop restaurant.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800'
    ],
    pricePerNight: 7999,
    maxGuests: 2,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Mini Fridge', 'Breakfast', 'Temple View', 'Balcony', 'Safe Locker', 'Laundry', 'Parking'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'No smoking inside the room',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Tirumala',
      address: 'Near Tirumala Temple, Tirumala, Andhra Pradesh 517504'
    }
  },
  {
    name: 'Kapila Family Room',
    type: 'deluxe',
    description: 'Specially designed family room near the serene Kapila Theertham. Features two double beds, a cozy seating area, and kid-friendly amenities. Enjoy the peaceful atmosphere and proximity to the sacred waterfall.',
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'
    ],
    pricePerNight: 3299,
    maxGuests: 5,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Parking', 'Breakfast'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'Family-friendly environment',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Kapila Theertham',
      address: 'Kapila Theertham Road, Tirupati, Andhra Pradesh 517501'
    }
  },
  {
    name: 'Chandragiri Heritage Stay',
    type: 'suite',
    description: 'Experience the royal heritage at our Chandragiri suite. Located near the historic Chandragiri Fort, this room combines traditional architecture with modern comforts. Perfect for history enthusiasts and those seeking a unique stay.',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    ],
    pricePerNight: 4499,
    maxGuests: 3,
    amenities: ['WiFi', 'AC', 'TV', 'Hot Water', 'Room Service', 'Breakfast', 'Parking', 'Balcony'],
    houseRules: [
      'Check-in: 12:00 PM',
      'Check-out: 11:00 AM',
      'No smoking inside the room',
      'Valid ID proof required at check-in'
    ],
    location: {
      area: 'Chandragiri',
      address: 'Near Chandragiri Fort, Chandragiri, Andhra Pradesh 517101'
    }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Room.deleteMany({});
    await User.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create rooms
    await Room.insertMany(rooms);
    console.log(`Created ${rooms.length} rooms`);
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@stayease.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      isVerified: true
    });
    console.log('Created admin user:', admin.email);
    
    // Create test user
    const user = await User.create({
      name: 'Test User',
      email: 'user@stayease.com',
      phone: '9876543211',
      password: 'user123',
      role: 'user',
      isVerified: true
    });
    console.log('Created test user:', user.email);
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@stayease.com / admin123');
    console.log('User: user@stayease.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
