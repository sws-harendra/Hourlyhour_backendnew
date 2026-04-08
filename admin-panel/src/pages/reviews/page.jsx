import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, MessageSquare, User, Briefcase, Calendar, Search } from "lucide-react";
import { ReviewService } from "../../services/review.service";

const ReviewsPage = () => {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("providerId");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await ReviewService.getAllReviews();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch = 
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.provider?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    
    const matchesProvider = !providerId || r.providerId.toString() === providerId;
    
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Reviews & Ratings</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {providerId ? "Viewing reviews for selected provider" : "Monitor service provider performance and customer feedback"}
                </p>
              </div>
            </div>
            {providerId && (
              <button
                onClick={() => (window.location.href = "/reviews")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Show All Reviews
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, provider or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      Order #{review.bookingId} • {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Customer</p>
                        <p className="text-sm font-medium text-slate-700">{review.user?.name || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Provider</p>
                        <p className="text-sm font-medium text-slate-700">{review.provider?.name || "N/A"}</p>
                      </div>
                    </div>

                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 italic">
                        "{review.comment || "No comment provided"}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
