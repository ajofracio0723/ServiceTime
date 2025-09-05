export interface Service {
  id: string;
  service: string;
  status: string;
  description: string;
  date: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  status: 'active' | 'inactive';
  lastContact: string;
  totalJobs: number;
  address: string;
  services?: Service[];
}
