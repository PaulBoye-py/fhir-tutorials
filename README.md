# **FHIR Tutorials – Next.js 14 Patient & Practitioner Portal**

*A hands-on project demonstrating how to build a FHIR-enabled patient portal using Next.js, TypeScript, and the HAPI FHIR Server.*

![FHIR + Next.js Banner](./public/banner.png)

---

## **Overview**

This project is a practical implementation of a **FHIR (Fast Healthcare Interoperability Resources)** client application built with **Next.js 14**.

It demonstrates how to:

* Search and fetch **Patient** resources
* Search and fetch **Practitioner** resources
* Implement pagination with FHIR Bundles
* Understand and use FHIR REST APIs
* Build a clean service layer to communicate with a FHIR server
* Display structured healthcare data in a modern web interface

The backend is powered by the **HAPI FHIR Public Test Server**, using the R4 version of the FHIR specification.

---

## **Tech Stack**

* **Next.js 14** (App Router)
* **TypeScript**
* **Axios**
* **HAPI FHIR Server (R4)**
* **Tailwind CSS**
* **FHIR JSON Resources**

---

## 🔗 **Live FHIR Server (used in this project)**

```
https://hapi.fhir.org/baseR4
```

---

## 📁 **Project Structure**

```
fhir-tutorials/
├── app/
│   ├── patients/
│   │   └── [id]/
│   ├── practitioners/
│   │   └── [id]/
│   └── layout.tsx
├── services/
│   ├── patientService.ts
│   ├── practitionerService.ts
├── types/
│   ├── fhir.ts
├── public/
└── README.md
```

---

## **Environment Setup**

Create a `.env.local` file:

```
NEXT_PUBLIC_FHIR_BASE_URL=https://hapi.fhir.org/baseR4
```

---

# **FHIR Service Layer**

The service layer abstracts communication with the FHIR server.

---

## **Patient Service (`services/patientService.ts`)**

### Features

* Search patients by name or phone
* Get total count via `_summary=count`
* Pagination implemented via `_offset`
* Fetch and update patient data

### Code (final version incorporating your latest changes)

```ts
import axios from 'axios';

const baseUrl = `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Patient`;

const fhirApi = axios.create({ baseURL: baseUrl, headers: {
    'Cache-Control' : 'no-cache',
} });

const isPhoneNumber = (searchTerm: string) => {
  return /^\d+$/.test(searchTerm);
};

const getAll = async (page: number, searchTerm?: string) => {
  let searchParams: any = {};

  if (searchTerm) {
    if (isPhoneNumber(searchTerm)) searchParams.phone = searchTerm;
    else searchParams.name = searchTerm;
  }

  try {
    const countResponse = await fhirApi.get('', { 
      params: { _summary: 'count', ...searchParams }
    });

    const totalCount = countResponse.data?.total || 0;

    const dataResponse = await fhirApi.get('', { 
      params: {
        _count: 15,
        _offset: (page - 1) * 15,
        ...searchParams
      }
    });

    if (dataResponse.headers['content-type']?.includes('application/fhir+json')) {
      return {
        ...dataResponse.data,
        total: totalCount,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};
```

---

## **Practitioner Service (`services/practitionerService.ts`)**

### Features

* FHIR-compliant type definitions using your `Practitioner` model
* Search by phone or name
* Pagination
* Create & update practitioners

```ts
import axios from 'axios';
import { Practitioner } from '@/types/fhir';

const baseUrl = `${process.env.NEXT_PUBLIC_FHIR_BASE_URL}/Practitioner`;

const fhirApi = axios.create({
  baseURL: baseUrl,
  headers: {
    'Cache-Control': 'no-cache',
    'Accept': 'application/fhir+json',
  },
});
```

*(Full file omitted here for brevity since your version is already correct.)*

---

# **Screenshots**

Add your screenshots here:

```
/public/screenshots/search.png
/public/screenshots/patient-details.png
/public/screenshots/practitioner-list.png
```

```md
![Patient Search](./public/screenshots/search.png)
```

---

# **Testing with HAPI FHIR**

Examples:

```
/Patient?name=smith
/Patient?phone=0703...
/Practitioner?name=adam
```

---

# **FHIR Concepts Used**

* Resource Type
* Patient & Practitioner
* Bundle (searchset)
* Pagination via `_count` and `_offset`
* Searching using:

  * `?name=`
  * `?phone=`
  * `_summary=count`

---

# 🚀 **Running the Project**

```bash
npm install
npm run dev
```

App runs on:

```
http://localhost:3000
```

---

# **Contributing**

Contributions are welcome!

---

# 📄 **License**

MIT License

---

# ⭐ **If you find this helpful, please star the repo!**

👉 [https://github.com/PaulBoye-py/fhir-tutorials](https://github.com/PaulBoye-py/fhir-tutorials)

---

