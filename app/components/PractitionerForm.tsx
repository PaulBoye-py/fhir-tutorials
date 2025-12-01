'use client';

import { useState } from 'react';
import { Practitioner } from '@/types/fhir';
import practitionerService from '@/services/practitionerService';
import { useRouter } from 'next/navigation';

export default function PractitionerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    prefix: '',
    suffix: '',
    gender: 'unknown' as 'male' | 'female' | 'other' | 'unknown',
    birthDate: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    qualificationCode: '',
    qualificationDisplay: '',
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

    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      active: true,
      name: [
        {
          use: 'official',
          family: formData.familyName,
          given: [formData.givenName],
          prefix: formData.prefix ? [formData.prefix] : undefined,
          suffix: formData.suffix ? [formData.suffix] : undefined,
        },
      ],
      gender: formData.gender,
      birthDate: formData.birthDate || undefined,
      telecom: [],
      address: [],
      qualification: [],
    };

    if (formData.phone) {
      practitioner.telecom?.push({
        system: 'phone',
        value: formData.phone,
        use: 'work',
      });
    }

    if (formData.email) {
      practitioner.telecom?.push({
        system: 'email',
        value: formData.email,
        use: 'work',
      });
    }

    if (formData.addressLine || formData.city || formData.state) {
      practitioner.address?.push({
        use: 'work',
        type: 'both',
        line: formData.addressLine ? [formData.addressLine] : undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
      });
    }

    if (formData.qualificationCode && formData.qualificationDisplay) {
      practitioner.qualification?.push({
        code: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
              code: formData.qualificationCode,
              display: formData.qualificationDisplay,
            },
          ],
          text: formData.qualificationDisplay,
        },
      });
    }

    try {
      const created = await practitionerService.createNew(practitioner);
      if (created?.id) {
        router.push(`/practitioners/${created.id}`);
      } else {
        router.push('/practitioners');
      }
    } catch (err) {
      setError('Failed to create practitioner. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold mb-6">Create New Practitioner</h2>
      </div>

      {error && (
        <div className="border border-red-600 bg-red-50 text-red-600 px-4 py-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prefix" className="label">
              Prefix (Dr., Prof., etc.)
            </label>
            <input
              type="text"
              id="prefix"
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              className="input"
              placeholder="Dr."
            />
          </div>

          <div>
            <label htmlFor="suffix" className="label">
              Suffix (MD, PhD, etc.)
            </label>
            <input
              type="text"
              id="suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              className="input"
              placeholder="MD"
            />
          </div>
        </div>

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
              Birth Date
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
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
          <h3 className="font-semibold mb-4">Practice Address</h3>
          
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

        <div className="border-t border-gray-300 pt-4 mt-6">
          <h3 className="font-semibold mb-4">Qualification</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="qualificationCode" className="label">
                Qualification Code
              </label>
              <input
                type="text"
                id="qualificationCode"
                name="qualificationCode"
                value={formData.qualificationCode}
                onChange={handleChange}
                className="input"
                placeholder="MD"
              />
            </div>

            <div>
              <label htmlFor="qualificationDisplay" className="label">
                Qualification Display Name
              </label>
              <input
                type="text"
                id="qualificationDisplay"
                name="qualificationDisplay"
                value={formData.qualificationDisplay}
                onChange={handleChange}
                className="input"
                placeholder="Doctor of Medicine"
              />
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
          {loading ? 'Creating...' : 'Create Practitioner'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/practitioners')}
          className="btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}