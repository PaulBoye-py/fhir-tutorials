'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Patient } from '@/types/fhir';
import patientService from '@/services/patientService';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Fetch patient data with React Query
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: () => patientService.getPatient(params.id as string),
    enabled: !!params.id, // Only run query if id exists
    staleTime: 5 * 60 * 1000, // 5 minutes for detail pages
  });

  const getPatientName = (patient: Patient) => {
    if (!patient.name || patient.name.length === 0) return 'Unknown';
    const name = patient.name[0];
    const prefix = name.prefix?.join(' ');
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    const suffix = name.suffix?.join(', ');
    
    let fullName = `${given} ${family}`.trim();
    if (prefix) fullName = `${prefix} ${fullName}`;
    if (suffix) fullName = `${fullName}, ${suffix}`;
    
    return fullName || 'Unknown';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getPhones = () => {
    return patient?.telecom?.filter((t: import('@/types/fhir').ContactPoint) => t.system === 'phone') || [];
  };

  const getEmails = () => {
    return patient?.telecom?.filter((t: import('@/types/fhir').ContactPoint) => t.system === 'email') || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading patient details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    const errorMessage = error instanceof Error ? error.message : 'Patient not found';
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="border border-red-600 bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            {errorMessage}
          </div>
          <Link 
            href="/patients" 
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/patients" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            ← Back to Patients
          </Link>
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {getPatientName(patient)}
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-mono">ID: {patient.id}</p>
            {patient.active !== undefined && (
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  patient.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {patient.active ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Demographics Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900">
              Demographics
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Gender</div>
                <div className="text-gray-900 capitalize">{patient.gender || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Birth Date</div>
                <div className="text-gray-900">{formatDate(patient.birthDate)}</div>
              </div>
              {patient.maritalStatus && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Marital Status</div>
                  <div className="text-gray-900">
                    {patient.maritalStatus.text || patient.maritalStatus.coding?.[0]?.display || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900">
              Contact Information
            </h2>
            
            {getPhones().length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Phone Numbers</div>
                <div className="space-y-2">
                  {getPhones().map((phone: import('@/types/fhir').ContactPoint, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 text-gray-900">
                      <a 
                        href={`tel:${phone.value}`}
                        className="font-mono text-blue-600 hover:text-blue-800"
                      >
                        {phone.value}
                      </a>
                      {phone.use && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                          {phone.use}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getEmails().length > 0 && (
              <div className="mb-4 last:mb-0">
                <div className="text-sm font-medium text-gray-500 mb-2">Email Addresses</div>
                <div className="space-y-2">
                  {getEmails().map((email: import('@/types/fhir').ContactPoint, idx: number) => (
                    <div key={idx} className="flex flex-wrap items-center gap-2 text-gray-900">
                      <a 
                        href={`mailto:${email.value}`}
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {email.value}
                      </a>
                      {email.use && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                          {email.use}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getPhones().length === 0 && getEmails().length === 0 && (
              <p className="text-gray-500">No contact information available</p>
            )}
          </div>

          {/* Addresses Section */}
          {patient.address && patient.address.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900">
                Addresses
              </h2>
              <div className="space-y-4">
                {patient.address.map((address: import('@/types/fhir').Address, idx: number) => (
                  <div 
                    key={idx} 
                    className="pb-4 last:pb-0 border-b last:border-b-0 border-gray-200"
                  >
                    {address.use && (
                      <div className="text-sm font-medium text-gray-500 capitalize mb-2">
                        {address.use} Address
                      </div>
                    )}
                    <div className="space-y-1 text-gray-900">
                      {address.line?.map((line, lineIdx) => (
                        <div key={lineIdx}>{line}</div>
                      ))}
                      <div>
                        {[address.city, address.state, address.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                      {address.country && <div>{address.country}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Identifiers Section */}
          {patient.identifier && patient.identifier.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900">
                Identifiers
              </h2>
              <div className="space-y-3">
                {patient.identifier.map((identifier: import('@/types/fhir').Identifier, idx: number) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {identifier.type?.text || identifier.system || 'Identifier'}
                      {identifier.use && ` (${identifier.use})`}
                    </div>
                    <div className="font-mono text-gray-900">{identifier.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          {patient.meta && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-900">
                Resource Metadata
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {patient.meta.versionId && (
                  <div>
                    <div className="text-gray-500 font-medium mb-1">Version ID</div>
                    <div className="font-mono text-gray-900">{patient.meta.versionId}</div>
                  </div>
                )}
                {patient.meta.lastUpdated && (
                  <div>
                    <div className="text-gray-500 font-medium mb-1">Last Updated</div>
                    <div className="text-gray-900">{formatDate(patient.meta.lastUpdated)}</div>
                  </div>
                )}
                {patient.meta.source && (
                  <div>
                    <div className="text-gray-500 font-medium mb-1">Source</div>
                    <div className="font-mono text-gray-900">{patient.meta.source}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/patients/${patient.id}/edit`}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Patient
            </Link>
            <button
              onClick={() => router.push('/patients')}
              className="flex-1 sm:flex-none inline-flex justify-center items-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}