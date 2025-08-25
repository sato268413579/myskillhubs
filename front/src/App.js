import React, { useState } from "react";
import Login from "./components/Login.tsx";
import Service from "./components/Service.tsx";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {loggedIn ? <Service /> : <Login setLoggedIn={setLoggedIn} />}
    </div>
  );
};

export default App;
