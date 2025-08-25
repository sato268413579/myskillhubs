import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Service from "./components/Service";

// 詳細ページ用のダミーコンポーネント
const ServiceDetail = ({ id }: { id: string }) => {
  return <div>サービス詳細ページ: {id}</div>;
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
        <Route
          path="/"
          element={loggedIn ? <Service /> : <Navigate to="/login" />}
        />
        <Route
          path="/service/:id"
          element={loggedIn ? <ServiceDetail id={":id"} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
