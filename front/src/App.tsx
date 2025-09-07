import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "./pages/Login";
import Service from "./pages/Service";
import CRM from "./pages/CRM";
import Tasks from "./pages/TaskManager";
import TrendSearch from "./pages/TrendSearch";

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null); // null = チェック中

  useEffect(() => {
    const cookie = Cookies.get("loggedIn");
    setLoggedIn(cookie === "true");
  }, []);

  // クッキー確認中は何も描画しない
  if (loggedIn === null) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
      <Route path="/" element={loggedIn ? <Service /> : <Navigate to="/login" />} />
      <Route path="/service/crm" element={loggedIn ? <CRM /> : <Navigate to="/login" />} />
      <Route path="/service/tasks" element={loggedIn ? <Tasks /> : <Navigate to="/login" />} />
      <Route path="/service/aiSearch" element={loggedIn ? <TrendSearch /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
