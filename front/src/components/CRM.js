import React, { useEffect, useState } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/crmService";

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateCustomer(editingId, formData);
      setEditingId(null);
    } else {
      await createCustomer(formData);
    }
    setFormData({ name: "", email: "" });
    loadCustomers();
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({ name: customer.name, email: customer.email });
  };

  const handleDelete = async (id) => {
    await deleteCustomer(id);
    loadCustomers();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">CRM - 顧客管理</h1>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="名前"
          className="border p-2 w-full rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="メール"
          className="border p-2 w-full rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {editingId ? "更新する" : "追加する"}
        </button>
      </form>

      {/* 顧客リスト */}
      <ul className="divide-y">
        {customers.map((c) => (
          <li key={c.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-600">{c.email}</p>
            </div>
            <div className="space-x-2">
              <button
                className="px-3 py-1 bg-yellow-500 text-white rounded"
                onClick={() => handleEdit(c)}
              >
                編集
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded"
                onClick={() => handleDelete(c.id)}
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CRM;
