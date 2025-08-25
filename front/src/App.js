import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.tsx";
import Service from "./components/Service.tsx";
import CRM from "./components/CRM.tsx";
import Tasks from "./services/tasks/List";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

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
    </Routes>
  );
};

export default App;
