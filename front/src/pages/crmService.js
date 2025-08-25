import API_BASE_URL from "../config/api";

export const getCustomers = async () => {
  const res = await fetch(`${API_BASE_URL}/customers`);
  return res.json();
};

export const createCustomer = async (data) => {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateCustomer = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
