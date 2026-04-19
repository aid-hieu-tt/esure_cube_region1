import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type CrossFilterState = Record<string, string | null>;

interface CrossFilterContextType {
  filters: CrossFilterState;
  toggleFilter: (dimension: string, value: string) => void;
  clearFilter: (dimension: string) => void;
  clearAllFilters: () => void;
  isFiltered: (dimension: string, value: string) => boolean;
  hasAnyFilter: boolean;
  getDimStyle: (dimension: string, value: string, regularColor: string) => string;
}

const CrossFilterContext = createContext<CrossFilterContextType | null>(null);

export function CrossFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<CrossFilterState>({});

  const toggleFilter = useCallback((dimension: string, value: string) => {
    setFilters((prev) => {
      const isCurrentlySelected = prev[dimension] === value;
      const newFilters = { ...prev };
      
      if (isCurrentlySelected) {
        delete newFilters[dimension];
      } else {
        newFilters[dimension] = value;
      }
      return newFilters;
    });
  }, []);

  const clearFilter = useCallback((dimension: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[dimension];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isFiltered = useCallback((dimension: string, value: string) => {
    return filters[dimension] === value;
  }, [filters]);

  const hasAnyFilter = useMemo(() => Object.keys(filters).length > 0, [filters]);

  // Helper cho UI Dim/Highlight
  const getDimStyle = useCallback((dimension: string, value: string, regularColor: string) => {
    // Không mix dimension khác để tránh tắt màu chéo, chỉ check dimension hiện tại
    const dimValue = filters[dimension];
    if (!dimValue) return regularColor; // dimension này chưa được filter
    if (dimValue === value) return regularColor; // đúng item đang được filter
    
    if (regularColor.startsWith('#')) {
      const base = regularColor.slice(1, 7);
      if (base.length === 6) {
        const r = parseInt(base.slice(0, 2), 16);
        const g = parseInt(base.slice(2, 4), 16);
        const b = parseInt(base.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, 0.2)`;
      }
    }
    // Fallback for non-hex
    return 'rgba(200,200,200,0.3)';
  }, [filters]);

  return (
    <CrossFilterContext.Provider value={{ 
      filters, 
      toggleFilter, 
      clearFilter, 
      clearAllFilters, 
      isFiltered, 
      hasAnyFilter, 
      getDimStyle 
    }}>
      {children}
    </CrossFilterContext.Provider>
  );
}

export function useCrossFilter() {
  const context = useContext(CrossFilterContext);
  if (!context) {
    throw new Error('useCrossFilter must be used within a CrossFilterProvider');
  }
  return context;
}
