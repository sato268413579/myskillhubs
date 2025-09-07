import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/login";
import Cookies from "js-cookie";

interface Props {
  setLoggedIn: (value: boolean) => void;
}

const Login: React.FC<Props> = ({ setLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      if (res.message === "ログイン成功") {
        // クッキーに2時間の有効期限でログイン状態を保持
        Cookies.set("loggedIn", "true", { expires: 1 / 12 }); // 1/12日 = 2時間
        setLoggedIn(true);
        navigate("/"); // ← ログイン成功後にサービス一覧へ遷移
      } else {
        setError(res.message);
      }
    } catch {
      setError("ログインに失敗しました");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザ名"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            type="password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="current-password"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;