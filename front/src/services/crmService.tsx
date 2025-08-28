import API_BASE_URL from "../config/api";

export interface Deal {
  id: number;
  customer_id: number;
  title: string;
  amount?: number | null;
  status?: string | null;
  closed_at?: string | null;
  created_at: string;
}

export interface ContactLog {
  id: number;
  customer_id: number;
  contact_type: string;      // "call" | "email" | "meeting" | "note" など
  note?: string | null;
  contact_date: string;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;

  company?: string | null;
  department?: string | null;
  position?: string | null;
  phone?: string | null;
  title?: string | null;
  mobile?: string | null;
  address?: string | null;
  note?: string | null;
  tags?: string[];

  deals?: Deal[];
  contacts?: ContactLog[];

  created_at?: string;
  updated_at?: string | null;
}

export type CustomerInput = Omit<Customer, "id" | "deals" | "contacts" | "created_at" | "updated_at">;

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(`${API_BASE_URL}/customers`);
  if (!res.ok) throw new Error("failed to fetch customers");
  const data = await res.json();  // 一度だけ呼ぶ
  console.log(data);
  return data;
};

export const getCustomerDetail = async (id: number): Promise<Customer> => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`);
  if (!res.ok) throw new Error("failed to fetch customer detail");
  return res.json();
};

export const createCustomer = async (data: CustomerInput): Promise<Customer> => {
  const res = await fetch(`${API_BASE_URL}/customers/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("failed to create customer");
  return res.json();
};

export const updateCustomer = async (id: number, data: Partial<CustomerInput>): Promise<Customer> => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("failed to update customer");
  return res.json();
};

export const deleteCustomer = async (id: number): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("failed to delete customer");
  return res.json();
};

// --- 履歴API ---
export const addDeal = async (customerId: number, payload: Omit<Deal, "id" | "customer_id" | "created_at">) => {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/deals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed to add deal");
  return res.json() as Promise<Deal>;
};

export const listDeals = async (customerId: number) => {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/deals`);
  if (!res.ok) throw new Error("failed to list deals");
  return res.json() as Promise<Deal[]>;
};

export const addContact = async (customerId: number, payload: Omit<ContactLog, "id" | "customer_id" | "created_at">) => {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed to add contact");
  return res.json() as Promise<ContactLog>;
};

export const listContacts = async (customerId: number) => {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/contacts`);
  if (!res.ok) throw new Error("failed to list contacts");
  return res.json() as Promise<ContactLog[]>;
};
