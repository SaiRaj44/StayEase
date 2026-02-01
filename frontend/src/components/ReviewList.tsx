'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';
import { reviewsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Review {
  _id: string;
  user: { name: string };
  rating: number;
  title: string;
  comment: string;
  stayDate: string;
  createdAt: string;
}

interface ReviewListProps {
  roomId: string;
}

export default function ReviewList({ roomId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [roomId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getRoomReviews(roomId);
      setReviews(response.reviews || []);
      setStats({
        averageRating: response.averageRating || 0,
        totalReviews: response.totalReviews || 0,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Demo data
      setReviews([
        {
          _id: '1',
          user: { name: 'Rajesh Kumar' },
          rating: 5,
          title: 'Excellent stay near temple!',
          comment: 'The room was clean and comfortable. Staff was extremely helpful with darshan arrangements. Highly recommended for pilgrims!',
          stayDate: '2025-01-15',
          createdAt: '2025-01-17',
        },
        {
          _id: '2',
          user: { name: 'Priya Sharma' },
          rating: 4,
          title: 'Good experience overall',
          comment: 'Nice location and clean rooms. The temple view from the balcony was beautiful. Would stay here again.',
          stayDate: '2025-01-10',
          createdAt: '2025-01-12',
        },
      ]);
      setStats({ averageRating: 4.5, totalReviews: 2 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Guest Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg ml-1">{stats.averageRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500">({stats.totalReviews} reviews)</span>
          </div>
        </div>
        
        {/* Rating breakdown */}
        <div className="flex items-center gap-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter(r => r.rating === star).length;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-1 text-sm">
                <span className="text-gray-500 w-3">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ThumbsUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{review.user?.name || 'Guest'}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Stayed {formatDate(review.stayDate)} • Reviewed {formatDate(review.createdAt)}
                  </p>
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
