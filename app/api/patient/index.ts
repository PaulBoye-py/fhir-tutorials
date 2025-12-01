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

const getAll = async (page : number, searchTerm : string | undefined) => {
  let searchParams: {
    phone? : string | undefined,
    name? : string | undefined,
  } = {};

  if (searchTerm) {
    if (isPhoneNumber(searchTerm)) {
      searchParams.phone = searchTerm;
    } else {
      searchParams.name = searchTerm;
    }
  }

  try {
    const response = await fhirApi.get('', { 
      params: {
        _sort: '-_lastUpdated',
        _count: 15,
        _offset: page * 15, // Pagination logic - can also use skip
        // name: searchTerm ? searchTerm : undefined,
        ...searchParams,
      }
    });

    // Check if response is in JSON format
    if (response.headers['content-type'] && response.headers['content-type'].includes('application/fhir+json')) {
      console.log(response.data);
      return response.data;
    } else {
      console.error('Unexpected response format:', response.data);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error fetching patients:', message);
  }
};

const getPatient = async (id : any) => {
  try {
    const response = await fhirApi.get(`/${id}`);
    return response.data; // Return the patient data from the response
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
  }
};

const createNew = async (patientData: object) => {
  try {
    const response = await fhirApi.post('', patientData); 
    return response.data; // Return the created patient data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating patient:', message);
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