import API_BASE_URL from "../config/api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  // 必要に応じて追加
}

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch(`${API_BASE_URL}/customers`);
  return res.json();
};

export const createCustomer = async (
  data: Omit<Customer, "id">
): Promise<Customer> => {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateCustomer = async (
  id: number,
  data: Partial<Customer>
): Promise<Customer> => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteCustomer = async (id: number): Promise<{ success: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
