import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

export default function SearchableSelect({ 
  options, 
  groups,
  value, 
  onChange, 
  onSearch,
  placeholder = "Select an option...", 
  searchPlaceholder = "Search...",
  loading = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const debounceTimer = useRef(null);

  const allOptions = groups
    ? groups.flatMap((group) => group.options || [])
    : options;

  const selectedOption = allOptions.find(
    (opt) => opt.id === value || opt.value === value,
  );

  // If onSearch is provided, we assume searching is handled by the parent
  const filteredOptions = onSearch
    ? groups
      ? groups.map((group) => ({
          ...group,
          options: group.options || [],
        }))
      : options
    : groups
      ? groups
          .map((group) => ({
            ...group,
            options: (group.options || []).filter(
              (opt) =>
                opt.label.toLowerCase().includes(search.toLowerCase()) ||
                opt.sublabel?.toLowerCase().includes(search.toLowerCase()),
            ),
          }))
          .filter((group) => group.options.length > 0)
      : options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase()) ||
            opt.sublabel?.toLowerCase().includes(search.toLowerCase()),
        );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);

    if (onSearch) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onSearch(query);
      }, 500);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-all"
      >
        <span className={`block truncate ${!selectedOption ? "text-gray-400" : "text-gray-900 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              {loading ? (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
              <input
                autoFocus
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder={searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading && options.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm italic">Searching...</div>
            ) : (groups ? filteredOptions.length === 0 : filteredOptions.length === 0) ? (
              <div className="p-4 text-center text-gray-500 text-sm italic">No results found</div>
            ) : (
              groups ? (
                filteredOptions.map((group, groupIndex) => (
                  <div key={group.label || groupIndex}>
                    <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-50">
                      {group.label}
                    </div>
                    {group.options.map((option) => (
                      <button
                        key={option.id || option.value}
                        type="button"
                        onClick={() => {
                          onChange(option.id || option.value);
                          setIsOpen(false);
                          setSearch("");
                          if (onSearch) onSearch("");
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex flex-col ${
                          (option.id === value || option.value === value)
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <span className="font-medium text-gray-900">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-xs text-gray-500">{option.sublabel}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.id || option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.id || option.value);
                      setIsOpen(false);
                      setSearch("");
                      if (onSearch) onSearch(""); // Reset search on parent if needed
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors flex flex-col ${
                      (option.id === value || option.value === value) ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-gray-500">{option.sublabel}</span>
                    )}
                  </button>
                ))
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
