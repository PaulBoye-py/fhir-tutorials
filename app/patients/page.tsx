'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Patient, Bundle } from '@/types/fhir';
import patientService from '@/services/patientService';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Create debounced search function
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPage(1); // Reset to first page on new search
    }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Main query for fetching patients
  const { data, isLoading, error, isPlaceholderData } = useQuery<Bundle>({
    queryKey: ['patients', page, debouncedSearchTerm],
    queryFn: () => patientService.getAll(page, debouncedSearchTerm || undefined),
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new page
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Prefetch next page for smooth pagination
  useEffect(() => {
    const total = data?.total ?? 0;
    const hasNextPage = total > page * 15;

    if (hasNextPage && !isPlaceholderData) {
      queryClient.prefetchQuery({
        queryKey: ['patients', page + 1, debouncedSearchTerm],
        queryFn: () => patientService.getAll(page + 1, debouncedSearchTerm || undefined),
      });
    }
  }, [page, debouncedSearchTerm, data, isPlaceholderData, queryClient]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    debouncedSearch.flush(); // Immediately execute if form submitted
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value); // Trigger debounced search
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setPage(1);
    debouncedSearch.cancel(); // Cancel any pending debounced calls
  };

  const getPatientName = (patient: Patient) => {
    if (!patient.name || patient.name.length === 0) return 'Unknown';
    const name = patient.name[0];
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    return `${given} ${family}`.trim() || 'Unknown';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Extract data from query result
  const patients = data?.entry?.map(e => e.resource as Patient) || [];
  const total = data?.total ?? 0;
  const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patients</h1>
          <Link 
            href="/patients/new" 
            className="inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
          >
            Create New Patient
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Search by name or phone..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSearch} 
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm md:text-base font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="border border-red-600 bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {errorMessage}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && patients.length === 0 && (
          <div className="text-center py-12 border border-gray-300 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No patients found</p>
            <p className="text-sm text-gray-500 mt-2">
              {searchTerm ? 'Try a different search term' : 'Create your first patient to get started'}
            </p>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && !error && patients.length > 0 && (
          <>
            <div className={`hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm ${isPlaceholderData ? 'opacity-50' : ''}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Birth Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getPatientName(patient)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 capitalize">
                            {patient.gender || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(patient.birthDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 font-mono">
                            {patient.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className={`md:hidden space-y-4 ${isPlaceholderData ? 'opacity-50' : ''}`}>
              {patients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {getPatientName(patient)}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">ID: {patient.id}</p>
                    </div>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      View →
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Gender</p>
                      <p className="text-gray-900 capitalize">{patient.gender || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Birth Date</p>
                      <p className="text-gray-900">{formatDate(patient.birthDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                {total > 0 ? (
                  <>Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, total)} of {total} results</>
                ) : (
                  <>Showing page {page}</>
                )}
              </div>
              <div className="flex justify-center items-center gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  Page {page}
                </span>
                <Button
                  onClick={() => setPage(p => p + 1)}
                  disabled={isPlaceholderData || patients.length < 15}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}