import React, { useEffect, useState } from "react";
import {
  getCustomers,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addDeal,
  addContact,
  Customer,
  CustomerInput,
  Deal,
  ContactLog,
} from "../services/crmService";

const emptyForm: CustomerInput = {
  name: "",
  email: "",
  company: "",
  department: "",
  title: "",
  phone: "",
  mobile: "",
  address: "",
  note: "",
  tags: [],
};

const CRM: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<CustomerInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [detail, setDetail] = useState<Customer | null>(null); // 詳細表示用

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const loadDetail = async (id: number) => {
    const d = await getCustomerDetail(id);
    setDetail(d);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      // tags の前処理（文字列から配列に）
      tags: (formData.tags || []).map((t) => (t || "").trim()).filter(Boolean),
    } as CustomerInput;

    if (editingId) {
      await updateCustomer(editingId, payload);
      setEditingId(null);
    } else {
      await createCustomer(payload);
    }
    setFormData(emptyForm);
    await loadCustomers();
  };

  const handleEdit = async (c: Customer) => {
    setEditingId(c.id);
    setFormData({
      name: c.name || "",
      email: c.email || "",
      company: c.company || "",
      department: c.department || "",
      title: c.title || "",
      phone: c.phone || "",
      mobile: c.mobile || "",
      address: c.address || "",
      note: c.note || "",
      tags: c.tags || [],
    });
    await loadDetail(c.id);
  };

  const handleDelete = async (id: number) => {
    await deleteCustomer(id);
    if (detail?.id === id) setDetail(null);
    await loadCustomers();
  };

  const handleAddDeal = async (customerId: number) => {
    const title = window.prompt("取引タイトル");
    if (!title) return;
    const amountStr = window.prompt("金額（数値、任意）");
    const status = window.prompt('ステータス（open / won / lost など、任意）') || undefined;
    const amount = amountStr ? Number(amountStr) : undefined;
    await addDeal(customerId, { title, amount, status });
    if (detail?.id === customerId) await loadDetail(customerId);
  };

  const handleAddContact = async (customerId: number) => {
    const contact_type = window.prompt('種別（call / email / meeting / note など）') || "note";
    const note = window.prompt("内容（任意）") || undefined;
    await addContact(customerId, { contact_type, note, contact_date: new Date().toISOString() });
    if (detail?.id === customerId) await loadDetail(customerId);
  };

  // tags 入力はカンマ区切り
  const tagsText = (formData.tags || []).join(", ");
  const setTagsText = (text: string) =>
    setFormData({ ...formData, tags: text.split(",").map((t) => t.trim()).filter(Boolean) });

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-4">CRM - 顧客管理</h1>

      {/* フォーム（基本情報＋メモ＆タグ） */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="名前*"
          className="border p-2 w-full rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="メール*"
          className="border p-2 w-full rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="会社名"
          className="border p-2 w-full rounded"
          value={formData.company || ""}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
        />
        <input
          type="text"
          placeholder="部署"
          className="border p-2 w-full rounded"
          value={formData.department || ""}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />
        <input
          type="text"
          placeholder="役職"
          className="border p-2 w-full rounded"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="電話"
          className="border p-2 w-full rounded"
          value={formData.phone || ""}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="携帯"
          className="border p-2 w-full rounded"
          value={formData.mobile || ""}
          onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
        />
        <input
          type="text"
          placeholder="住所"
          className="border p-2 w-full rounded md:col-span-2"
          value={formData.address || ""}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <textarea
          placeholder="メモ"
          className="border p-2 w-full rounded md:col-span-2"
          rows={3}
          value={formData.note || ""}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
        <input
          type="text"
          placeholder="タグ（カンマ区切り：例）VIP, リピート）"
          className="border p-2 w-full rounded md:col-span-2"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
        />

        <div className="md:col-span-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {editingId ? "更新する" : "追加する"}
          </button>
          {editingId && (
            <button
              type="button"
              className="ml-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => { setEditingId(null); setFormData(emptyForm); }}
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      {/* 顧客リスト */}
      <ul className="divide-y">
        {customers.map((c) => (
          <li key={c.id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{c.name} <span className="text-sm text-gray-500">({c.company || "-"})</span></p>
                <p className="text-sm text-gray-600">{c.email}</p>
                <p className="text-xs text-gray-500">{c.department || ""} {c.title || ""}</p>
                {c.tags && c.tags.length > 0 && (
                  <p className="mt-1 text-xs">
                    {c.tags.map((t) => (
                      <span key={t} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded bg-gray-100 border text-gray-700">
                        #{t}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <div className="space-x-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={() => loadDetail(c.id)}
                >
                  詳細
                </button>
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
            </div>

            {/* 詳細（履歴一覧と追加） */}
            {detail?.id === c.id && (
              <div className="mt-3 p-3 bg-gray-50 rounded border">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => handleAddDeal(c.id)}
                  >
                    取引を追加
                  </button>
                  <button
                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                    onClick={() => handleAddContact(c.id)}
                  >
                    コンタクトを追加
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">取引履歴</h3>
                    <ul className="text-sm space-y-1">
                      {(detail.deals || []).map((d: Deal) => (
                        <li key={d.id} className="p-2 bg-white rounded border">
                          <div className="flex justify-between">
                            <span>{d.title}</span>
                            <span>{d.status || "-"}</span>
                          </div>
                          <div className="text-xs text-gray-500">¥{d.amount ?? "-"} / {new Date(d.created_at).toLocaleString()}</div>
                        </li>
                      ))}
                      {(!detail.deals || detail.deals.length === 0) && <li className="text-gray-500">なし</li>}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">コンタクト履歴</h3>
                    <ul className="text-sm space-y-1">
                      {(detail.contacts || []).map((l: ContactLog) => (
                        <li key={l.id} className="p-2 bg-white rounded border">
                          <div className="flex justify-between">
                            <span>{l.contact_type}</span>
                            <span className="text-xs text-gray-500">{new Date(l.contact_date).toLocaleString()}</span>
                          </div>
                          {l.note && <div className="text-xs text-gray-700 mt-1">{l.note}</div>}
                        </li>
                      ))}
                      {(!detail.contacts || detail.contacts.length === 0) && <li className="text-gray-500">なし</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CRM;
