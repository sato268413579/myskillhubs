import React, { useState } from "react";

const MyCustomApp: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submittedData, setSubmittedData] = useState<{ name: string; email: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedData({ name, email });
    setName("");
    setEmail("");
  };

  return (
    <div style={{ padding: "12px", fontFamily: "sans-serif" }}>
      <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>3D内フォーム</h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          type="email"
          placeholder="メール"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "6px", borderRadius: "4px", backgroundColor: "#4f46e5", color: "white", border: "none" }}>
          送信
        </button>
      </form>

      {submittedData && (
        <div style={{ marginTop: "10px", fontSize: "14px" }}>
          <strong>送信内容:</strong>
          <p>名前: {submittedData.name}</p>
          <p>メール: {submittedData.email}</p>
        </div>
      )}
    </div>
  );
};

export default MyCustomApp;
