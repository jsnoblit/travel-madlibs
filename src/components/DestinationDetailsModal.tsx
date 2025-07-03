import React, { useState, useEffect } from 'react';
import { X, Calendar, Globe, MapPin, Clock, PlaneLanding, DollarSign, Utensils, Languages, Building2, RefreshCw } from 'lucide-react';
import { Destination, Hotel } from '../types';
import { fetchHybridHotels } from '../services/api';

interface Props {
  destination: Destination;
  tripIdea: string;
  onClose: () => void;
  isOpen: boolean;
}

export default function DestinationDetailsModal({ destination, tripIdea, onClose, isOpen }: Props) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelError, setHotelError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && destination) {
      loadHotels();
    }
  }, [isOpen, destination]);

  const loadHotels = async () => {
    setLoadingHotels(true);
    setHotelError(null);
    try {
      const recommendations = await fetchHybridHotels(destination.name, destination.region, tripIdea);
      setHotels(recommendations);
    } catch (error) {
      setHotelError('Unable to load hotel recommendations');
    } finally {
      setLoadingHotels(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{destination.name}</h2>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {destination.region}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 px-3 py-1 rounded-full">
                  <span className="text-indigo-600 font-medium">{destination.matchPercentage}% Match</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700">{destination.description}</p>
            </div>

            {/* Best Time & Weather */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <Calendar className="w-5 h-5" />
                  Best Time to Visit
                </h3>
                <p className="text-gray-700">{destination.bestTimeToVisit}</p>
                {destination.weatherInfo && (
                  <p className="text-gray-600 mt-2">{destination.weatherInfo}</p>
                )}
              </div>

              {destination.languages && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <Languages className="w-5 h-5" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.languages.map((language, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transportation */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                <PlaneLanding className="w-5 h-5" />
                Getting There
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{destination.transportation.method}</span>
                  <span className="text-gray-500">•</span>
                  <span>{destination.transportation.duration}</span>
                </div>
                <p className="text-gray-600">{destination.transportation.description}</p>
              </div>
            </div>

            {/* Recommended Hotels */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Building2 className="w-5 h-5" />
                  Recommended Hotels
                </h3>
                {/* Refresh button removed per UX update */}
              </div>

              {loadingHotels ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Finding top hotels in {destination.name}...</p>
                </div>
              ) : hotelError ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-red-700">
                  <p>{hotelError}</p>
                  <button
                    onClick={loadHotels}
                    className="mt-2 text-sm font-medium hover:text-red-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {hotels.map((hotel, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors flex gap-4"
                    >
                      {hotel.image && (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-60 h-40 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {hotel.name}
                              {hotel.rankingPercentage && (
                                <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                                  {hotel.rankingPercentage}%
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">{hotel.address}</p>
                          </div>
                          <div className="text-right">
                            {hotel.rating && (
                              <p className="text-sm font-medium text-gray-900">{hotel.rating}</p>
                            )}
                            {hotel.priceRange && (
                              <p className="text-sm text-gray-600 mt-1">{hotel.priceRange}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                          <p className="text-indigo-700 italic whitespace-pre-line font-medium">
                            {hotel.haiku.split('\n').join('\n')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget Information */}
            {destination.budgetEstimate && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <DollarSign className="w-5 h-5" />
                  Budget Estimate
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Accommodations</p>
                    <p className="text-gray-600">{destination.budgetEstimate.accommodationRange}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">Meals</p>
                    <p className="text-gray-600">{destination.budgetEstimate.mealCosts}</p>
                  </div>
                </div>
                <p className="mt-3 text-gray-700">
                  Overall budget estimate: {destination.budgetEstimate.budget} {destination.budgetEstimate.currency}
                </p>
              </div>
            )}

            {/* Local Cuisine */}
            {destination.localCuisine && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <Utensils className="w-5 h-5" />
                  Local Cuisine
                </h3>
                <div className="flex flex-wrap gap-2">
                  {destination.localCuisine.map((dish, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Notes */}
            {destination.culturalNotes && (
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <Globe className="w-5 h-5" />
                  Cultural Notes
                </h3>
                <p className="text-gray-700">{destination.culturalNotes}</p>
              </div>
            )}

            {/* Visa Requirements */}
            {destination.visaRequirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Travel Requirements</h3>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800">
                  {destination.visaRequirements}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 bg-white rounded-b-xl border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg 
                       hover:bg-indigo-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}