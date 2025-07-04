
import { useState, useMemo } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
  searchTerm?: string;
  searchFields?: (keyof T)[];
  filters?: Record<string, any>;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
  searchTerm = '',
  searchFields = [],
  filters = {}
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const itemValue = item[key as keyof T];
          return itemValue === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, searchFields, filters]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  return {
    currentData,
    currentPage,
    totalPages,
    totalItems: filteredData.length,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setCurrentPage
  };
}
