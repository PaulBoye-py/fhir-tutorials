import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">HL7 FHIR Demo</h1>
        <p className="text-gray-600 text-lg">
          A demonstration application for managing Patient and Practitioner resources using the HL7 FHIR standard
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Link href="/patients" className="card group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2 group-hover:underline">
                Patients
              </h2>
              <p className="text-gray-600 mb-4">
                Search, view, and create patient records
              </p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Search by name or phone number</li>
                <li>• View detailed demographics</li>
                <li>• Create new patient records</li>
              </ul>
            </div>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link href="/practitioners" className="card group cursor-pointer">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2 group-hover:underline">
                Practitioners
              </h2>
              <p className="text-gray-600 mb-4">
                Search, view, and create practitioner records
              </p>
              <ul className="space-y-1 text-sm text-gray-500">
                <li>• Search by name or phone number</li>
                <li>• View qualifications</li>
                <li>• Create new practitioner records</li>
              </ul>
            </div>
            <svg className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      <div className="border-t border-gray-300 pt-8">
        <h3 className="text-xl font-semibold mb-4">About FHIR</h3>
        <p className="text-gray-600 mb-4">
          Fast Healthcare Interoperability Resources (FHIR) is a standard for exchanging healthcare information electronically. 
          This demo showcases basic CRUD operations on Patient and Practitioner resources.
        </p>
        <div className="flex gap-4 text-sm">
          <a 
            href="https://www.hl7.org/fhir/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            FHIR Documentation
          </a>
          <a 
            href="https://www.hl7.org/fhir/patient.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Patient Resource
          </a>
          <a 
            href="https://www.hl7.org/fhir/practitioner.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            Practitioner Resource
          </a>
        </div>
      </div>
    </div>
  );
}