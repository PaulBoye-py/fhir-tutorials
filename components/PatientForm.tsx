'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Patient } from '@/types/fhir';
import patientService from '@/services/patientService';

export default function PatientForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    gender: 'unknown' as 'male' | 'female' | 'other' | 'unknown',
    birthDate: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // Use React Query mutation for creating patient
  const createMutation = useMutation({
    mutationFn: (patient: Patient) => patientService.createNew(patient),
    onSuccess: (data) => {
      // Invalidate patients list cache
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      
      // Navigate to the created patient or list
      if (data?.id) {
        router.push(`/patients/${data.id}`);
      } else {
        router.push('/patients');
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patient: Patient = {
      resourceType: 'Patient',
      active: true,
      name: [
        {
          use: 'official',
          family: formData.familyName,
          given: [formData.givenName],
        },
      ],
      gender: formData.gender,
      birthDate: formData.birthDate,
      telecom: [],
      address: [],
    };

    if (formData.phone) {
      patient.telecom?.push({
        system: 'phone',
        value: formData.phone,
        use: 'mobile',
      });
    }

    if (formData.email) {
      patient.telecom?.push({
        system: 'email',
        value: formData.email,
        use: 'home',
      });
    }

    if (formData.addressLine || formData.city || formData.state) {
      patient.address?.push({
        use: 'home',
        type: 'both',
        line: formData.addressLine ? [formData.addressLine] : undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
      });
    }

    createMutation.mutate(patient);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/patients" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            ← Back to Patients
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Create New Patient
          </h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to add a new patient to the system.
          </p>
        </div>

        {/* Error Message */}
        {createMutation.isError && (
          <div className="mb-6 border border-red-600 bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {createMutation.error instanceof Error 
              ? createMutation.error.message 
              : 'Failed to create patient. Please try again.'}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 md:p-6 space-y-6">
            
            {/* Basic Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="givenName" className="block text-sm font-medium text-gray-700 mb-1">
                      Given Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="givenName"
                      name="givenName"
                      value={formData.givenName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Family Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="familyName"
                      name="familyName"
                      value={formData.familyName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unknown">Unknown</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Home Address Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Home Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="addressLine" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="addressLine"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CA"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="94102"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {createMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Patient'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/patients')}
              disabled={createMutation.isPending}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}