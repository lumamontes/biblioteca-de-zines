import { memo } from 'react';

interface SearchInputProps {
  onSearch: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
}

export const SearchInput = memo<SearchInputProps>(({ 
  onSearch, 
  defaultValue = '', 
  placeholder = 'Buscar zine ou autor' 
}) => (
  <div className="w-full">
    <label htmlFor="zine-search" className="sr-only">
      {placeholder}
    </label>
    <input
      id="zine-search"
      type="search"
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full border border-neutral-200 rounded-lg px-4 py-3 bg-white focus:ring-2 transition-all duration-200"
      onChange={(e) => onSearch(e.target.value)}
      autoComplete="off"
    />
  </div>
));

SearchInput.displayName = 'SearchInput';
