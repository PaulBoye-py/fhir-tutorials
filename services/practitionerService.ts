import axios from 'axios';
import { Practitioner, Bundle } from '@/types/fhir';

const baseUrl = `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Practitioner`;

const fhirApi = axios.create({
  baseURL: baseUrl,
  headers: {
    'Cache-Control': 'no-cache',
    'Accept': 'application/fhir+json',
  },
});

const isPhoneNumber = (searchTerm: string) => {
  return /^\d+$/.test(searchTerm);
};

const getAll = async (page: number, searchTerm: string | undefined) => {
  let searchParams: {
    phone?: string | undefined,
    name?: string | undefined,
  } = {};

  if (searchTerm) {
    if (isPhoneNumber(searchTerm)) {
      searchParams.phone = searchTerm;
    } else {
      searchParams.name = searchTerm;
    }
  }

  try {
    // First request: Get total count
    const countResponse = await fhirApi.get('', { 
      params: {
        _summary: 'count',
        ...searchParams,
      }
    });

    const totalCount = countResponse.data?.total || 0;

    // Second request: Get actual patient data
    const dataResponse = await fhirApi.get('', { 
      params: {
        _count: 15,
        _offset: (page - 1) * 15, // Convert 1-based page to 0-based offset
        ...searchParams,
      }
    });

    if (dataResponse.headers['content-type']?.includes('application/fhir+json')) {
      console.log('FHIR Response:', dataResponse.data);
      console.log('Total Count:', totalCount);
      
      // Merge the total count into the data response
      return {
        ...dataResponse.data,
        total: totalCount,
      };
    } else {
      console.error('Unexpected response format:', dataResponse.data);
      return null;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching practitioners:', message);
    throw error;
  }
};

const getPractitioner = async (id: string): Promise<Practitioner | null> => {
  try {
    const response = await fhirApi.get<Practitioner>(`/${id}`);
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching practitioner:', message);
    throw error;
  }
};

const updatePractitioner = async (id: string, updatedPractitioner: Practitioner): Promise<Practitioner | null> => {
  try {
    const response = await fhirApi.put<Practitioner>(`/${id}`, updatedPractitioner);
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating practitioner:', message);
    throw error;
  }
};

const createNew = async (practitionerData: Practitioner): Promise<Practitioner | null> => {
  try {
    const response = await fhirApi.post<Practitioner>('', practitionerData);
    return response.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating practitioner:', message);
    throw error;
  }
};

const practitionerService = {
  getAll,
  getPractitioner,
  updatePractitioner,
  createNew,
};

export default practitionerService;