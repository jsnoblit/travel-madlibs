import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import MadLibForm from './components/MadLibForm';
import DestinationCard from './components/DestinationCard';
import DestinationDetailsModal from './components/DestinationDetailsModal';
import TravelProfileButton from './components/TravelProfileButton';
import { generateTravelRecommendations } from './services/api';
import { TravelQuery, Destination } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [travelProfile, setTravelProfile] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const handleSubmit = async (query: TravelQuery) => {
    if (!query.tripIdea || !query.travelCompanion || !query.location || !query.comingFrom) {
      setError('Please fill in all fields before searching.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await generateTravelRecommendations({
        ...query,
        travelProfile: travelProfile || undefined
      });
      if (response.error) {
        setError(response.error);
      } else {
        setDestinations(response.destinations);
        setSummary(response.summary || null);
        setHasSearched(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = () => {
    setDestinations([]);
    setSummary(null);
    setHasSearched(false);
    setError(null);
    setSelectedDestination(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[420px] mx-auto px-4 py-12">
        <div className="text-center mb-12 relative">
          <div className="absolute right-0 top-0">
            <TravelProfileButton
              onSave={setTravelProfile}
              currentProfile={travelProfile}
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Compass className="w-10 h-10 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">TravelMadLibs</h1>
          </div>
          <p className="text-xl text-gray-600">
            Discover your perfect destination through the power of words
          </p>
        </div>

        {!hasSearched && (
          <div className="mb-16">
            <MadLibForm onSubmit={handleSubmit} />
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Finding perfect destinations for you...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={handleNewSearch}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {hasSearched && !loading && !error && (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Your Perfect Destinations
                </h2>
                <button
                  onClick={handleNewSearch}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 
                           text-gray-700 shadow-sm transition-colors duration-200"
                >
                  New Search
                </button>
              </div>
              {summary && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-indigo-700 text-sm">
                  {summary}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-8">
              {destinations.map((destination, index) => (
                <DestinationCard
                  key={index}
                  destination={destination}
                  onClick={() => setSelectedDestination(destination)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <DestinationDetailsModal
        destination={selectedDestination!}
        isOpen={selectedDestination !== null}
        onClose={() => setSelectedDestination(null)}
      />
    </div>
  );
}

export default App;