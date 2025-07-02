import React, { useState } from 'react';
import { Brain } from 'lucide-react';

interface TravelProfileButtonProps {
  onSave: (profile: string) => void;
  currentProfile?: string;
}

export default function TravelProfileButton({ onSave, currentProfile }: TravelProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(currentProfile || '');

  const handleSave = () => {
    onSave(profile);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setProfile(currentProfile || '');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-colors duration-200 ${
          currentProfile ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-600 hover:bg-gray-50'
        }`}
        title="Travel Profile"
      >
        <Brain className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Travel Profile</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>
          
          <textarea
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="Paste your travel profile here..."
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}