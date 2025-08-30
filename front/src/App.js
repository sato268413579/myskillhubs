import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Login from "./components/Login.tsx";
import Service from "./components/Service.tsx";
import CRM from "./components/CRM.tsx";
import Tasks from "./components/TaskManager.tsx";
import TrendSearch from "./components/TrendSearch.tsx";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(null); // null = チェック中

  useEffect(() => {
    const cookie = Cookies.get("loggedIn");
    if (cookie === "true") {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  // クッキー確認中は何も描画しない
  if (loggedIn === null) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
      <Route
        path="/"
        element={loggedIn ? <Service /> : <Navigate to="/login" />}
      />
      <Route
        path="/service/crm"
        element={loggedIn ? <CRM /> : <Navigate to="/login" />}
      />
      <Route
        path="/service/tasks"
        element={loggedIn ? <Tasks /> : <Navigate to="/login" />}
      />
      <Route
        path="/service/aiSearch"
        element={loggedIn ? <TrendSearch /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default App;