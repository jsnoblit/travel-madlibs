import React, { useState } from 'react';
import { TravelQuery } from '../types';
import { ArrowRight } from 'lucide-react';
import Typeahead from './Typeahead';
import { suggestions } from '../data/suggestions';

interface Props {
  onSubmit: (query: TravelQuery) => void;
}

export default function MadLibForm({ onSubmit }: Props) {
  const [query, setQuery] = useState<TravelQuery>({
    tripIdea: '',
    travelCompanion: '',
    location: '',
    comingFrom: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(query);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-full mx-auto text-lg">
      <p className="leading-relaxed">
        I want{' '}
        <Typeahead
          value={query.tripIdea}
          onChange={(value) => setQuery({ ...query, tripIdea: value })}
          suggestions={suggestions.tripIdea}
          placeholder="a relaxing beach vacation"
          className="mx-2 px-3 py-1 w-full bg-blue-50 border-b-2 border-blue-200 focus:border-blue-500 
                     outline-none transition-all duration-300 rounded-md focus:ring-2 focus:ring-blue-200"
          pillClassName="bg-blue-100 text-blue-800 hover:bg-blue-200"
        />
        {' '}with{' '}
        <Typeahead
          value={query.travelCompanion}
          onChange={(value) => setQuery({ ...query, travelCompanion: value })}
          suggestions={suggestions.travelCompanion}
          placeholder="my family"
          className="mx-2 px-3 py-1 w-full bg-green-50 border-b-2 border-green-200 focus:border-green-500 
                     outline-none transition-all duration-300 rounded-md focus:ring-2 focus:ring-green-200"
          pillClassName="bg-green-100 text-green-800 hover:bg-green-200"
        />
        {' '}
        <Typeahead
          value={query.location}
          onChange={(value) => setQuery({ ...query, location: value })}
          suggestions={suggestions.location}
          placeholder="somewhere"
          className="mx-2 px-3 py-1 w-full bg-purple-50 border-b-2 border-purple-200 focus:border-purple-500 
                     outline-none transition-all duration-300 rounded-md focus:ring-2 focus:ring-purple-200"
          pillClassName="bg-purple-100 text-purple-800 hover:bg-purple-200"
        />
      </p>
      <p className="leading-relaxed mt-4">
        Coming from{' '}
        <Typeahead
          value={query.comingFrom}
          onChange={(value) => setQuery({ ...query, comingFrom: value })}
          suggestions={suggestions.comingFrom}
          placeholder="New York City"
          className="mx-2 px-3 py-1 w-full bg-amber-50 border-b-2 border-amber-200 focus:border-amber-500 
                     outline-none transition-all duration-300 rounded-md focus:ring-2 focus:ring-amber-200"
          pillClassName="bg-amber-100 text-amber-800 hover:bg-amber-200"
        />
      </p>
      <button
        type="submit"
        className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 
                   transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
      >
        Find destinations
        <ArrowRight size={20} />
      </button>
    </form>
  );
}