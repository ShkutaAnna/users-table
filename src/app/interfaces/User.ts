export interface UserData extends User {
    address?: Address;
    company?: Company;
    phone: string;
    website: string;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

export interface Address {
    city?: string;
    geo?: Geo;
    street?: string;
    suite?: string;
    zipcode?: string;
}

export interface Company {
    name: string;
    catchPhrase?: string;
}

export interface Geo {
    lat: string;
    lng: string;
}