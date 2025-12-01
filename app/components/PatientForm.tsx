'use client';

import { useState } from 'react';
import { Patient } from '@/types/fhir';
import patientService from '@/services/patientService';
import { useRouter } from 'next/navigation';

export default function PatientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    try {
      const created = await patientService.createNew(patient);
      if (created?.id) {
        router.push(`/patients/${created.id}`);
      } else {
        router.push('/patients');
      }
    } catch (err) {
      setError('Failed to create patient. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-6">Create New Patient</h2>
      </div>

      {error && (
        <div className="border border-red-600 bg-red-50 text-red-600 px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="givenName" className="label">
              Given Name *
            </label>
            <input
              type="text"
              id="givenName"
              name="givenName"
              value={formData.givenName}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="familyName" className="label">
              Family Name *
            </label>
            <input
              type="text"
              id="familyName"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="label">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="unknown">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="birthDate" className="label">
              Birth Date *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
              className="input"
            />
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 mt-6">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 mt-6">
          <h3 className="font-semibold mb-4">Address</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="addressLine" className="label">
                Street Address
              </label>
              <input
                type="text"
                id="addressLine"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="state" className="label">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postalCode" className="label">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="country" className="label">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Creating...' : 'Create Patient'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/patients')}
          className="btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}