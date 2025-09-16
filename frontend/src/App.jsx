import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // Fetch from your Render backend
    fetch("https://sdf-pt10-group-09.onrender.com/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("Error fetching API:", err);
        setMessage("⚠️ Could not connect to backend");
      });
  }, []);

  return (
    <div className="app">
      <h1>Ajali</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
