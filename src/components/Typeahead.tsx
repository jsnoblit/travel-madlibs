import React, { useState, useRef, useEffect } from 'react';

interface TypeaheadProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  pillClassName?: string;
}

export default function Typeahead({
  value,
  onChange,
  suggestions,
  placeholder,
  className = '',
  pillClassName = ''
}: TypeaheadProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const filtered = suggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      )
      .slice(0, 6); // Limit to 6 suggestions
    setFilteredSuggestions(filtered);
    setSelectedIndex(-1);
  }, [value, suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          onChange(filteredSuggestions[selectedIndex]);
          setSelectedIndex(-1);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        e.preventDefault();
        inputRef.current?.blur();
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow pill click to register
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={className}
        />
      </div>
      
      {isFocused && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => {
                onChange(suggestion);
                inputRef.current?.blur();
              }}
              className={`
                px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer
                ${pillClassName}
                ${index === selectedIndex ? 'ring-2 ring-offset-2' : ''}
                hover:opacity-90 active:scale-95
              `}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}