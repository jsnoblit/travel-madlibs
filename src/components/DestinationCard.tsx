import React from 'react';
import { Destination } from '../types';
import { Clock, MapPin, Star, Plane } from 'lucide-react';

interface Props {
  destination: Destination;
  onClick: () => void;
}

export default function DestinationCard({ destination, onClick }: Props) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 
                 hover:scale-[1.02] cursor-pointer"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-200 relative">
        {/* Placeholder for future image integration */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <MapPin size={48} />
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{destination.name}</h3>
            <p className="text-gray-600">{destination.region}</p>
          </div>
          <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
            <Star className="text-indigo-600 w-4 h-4 mr-1" />
            <span className="text-indigo-600 font-medium">{destination.matchPercentage}%</span>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{destination.description}</p>

        {/* Transportation Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-gray-800 font-medium mb-2">
            <Plane className="w-5 h-5 text-indigo-600" />
            <span>{destination.transportation.method}</span>
            <span className="text-gray-500">•</span>
            <span>{destination.transportation.duration}</span>
          </div>
          <p className="text-gray-600 text-sm">{destination.transportation.description}</p>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Best time: {destination.bestTimeToVisit}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {destination.highlights.map((highlight, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}