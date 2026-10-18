"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  id: number;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  disabled?: boolean;
  label?: string;
}

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione opções...",
  maxSelections = 3,
  disabled = false,
  label,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(option.name)
  );

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleSelect = (optionName: string) => {
    if (selectedValues.includes(optionName)) {
      onChange(selectedValues.filter((value) => value !== optionName));
    } else if (selectedValues.length < maxSelections) {
      onChange([...selectedValues, optionName]);
    }
    setSearchTerm("");
  };

  const handleRemove = (optionName: string) => {
    onChange(selectedValues.filter((value) => value !== optionName));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSelectMore = selectedValues.length < maxSelections;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className={`
          min-h-[42px] w-full px-3 py-2 border border-neutral-300 rounded-md
          bg-white cursor-pointer transition-colors
          ${disabled ? 'bg-neutral-100 cursor-not-allowed' : 'hover:border-neutral-400'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}
        `}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((option) => (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                >
                  {option.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(option.name);
                    }}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                    disabled={disabled}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-neutral-500 text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-neutral-200">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar"
              className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option.name);
                const isDisabled = !isSelected && !canSelectMore;
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.name)}
                    disabled={isDisabled}
                    className={`
                      w-full px-3 py-2 text-left text-sm transition-colors
                      ${isSelected 
                        ? 'bg-blue-50 text-blue-900' 
                        : isDisabled 
                          ? 'text-neutral-400 cursor-not-allowed'
                          : 'hover:bg-neutral-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.name}</span>
                      {isSelected && (
                        <span className="text-blue-600 text-xs">✓</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-neutral-500">
                Nenhum resultado encontrado.
              </div>
            )}
          </div>
          
          {!canSelectMore && (
            <div className="p-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600">
              Máximo de {maxSelections} categorias selecionadas
            </div>
          )}
        </div>
      )}
    </div>
  );
} 