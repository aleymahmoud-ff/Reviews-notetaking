import React from 'react';

interface InputWithSuggestionsProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
}

const InputWithSuggestions: React.FC<InputWithSuggestionsProps> = ({
  id,
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  required
}) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        list={`${id}-list`}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      <datalist id={`${id}-list`}>
        {suggestions.map((item, index) => (
          <option key={`${item}-${index}`} value={item} />
        ))}
      </datalist>
      {suggestions.length > 0 && (
        <p className="text-xs text-gray-400">
          Start typing to see {suggestions.length} existing {label.toLowerCase()}(s).
        </p>
      )}
    </div>
  );
};

export default InputWithSuggestions;
