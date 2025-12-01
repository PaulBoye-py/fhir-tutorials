import axios from 'axios';

const baseUrl = `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Patient`;

const fhirApi = axios.create({ baseURL: baseUrl, headers: {
    'Cache-Control' : 'no-cache',
} });

const isPhoneNumber = (searchTerm: string) => {
  if (parseInt(searchTerm)) {
    return true
  }
  return false
}

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
    console.error('Error fetching patients:', message);
    throw error;
  }
};

const getPatient = async (id : any) => {
  try {
    const response = await fhirApi.get(`/${id}`);
    return response.data; // return the patient data from the response
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching patient:', message);
  }
};

const updatePatient = async (id: any, updatedPatient: object) => {
  try {
    const response = await fhirApi.put(`/${id}`, updatedPatient);
    return response.data; // Return the updated patient data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error updating patient:', message);
    throw error;
  }
};

const createNew = async (patientData: object) => {
  try {
    const response = await fhirApi.post('', patientData); 
    return response.data; // Return the created patient data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating patient:', message);
    throw error;
  }
};

// Correct export statement
const patientService = {
    getAll,
    getPatient,
    updatePatient,
    createNew,
  };
  
  export default patientService;