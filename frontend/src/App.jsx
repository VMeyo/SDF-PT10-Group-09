import { useState } from "react";
import "./App.css";

function App() {
  const [reports, setReports] = useState([
    { id: 1, title: "Road Accident - Nairobi", status: "Pending" },
    { id: 2, title: "Fire Outbreak - Mombasa", status: "Resolved" },
  ]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ajali 🚨</h1>
        <p>Citizen-driven Emergency Reporting System</p>
      </header>

      <main>
        <section className="report-list">
          <h2>Recent Reports</h2>
          <ul>
            {reports.map((report) => (
              <li key={report.id} className="report-card">
                <strong>{report.title}</strong>
                <span className={`status ${report.status.toLowerCase()}`}>
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Ajali | Made with ❤️ in Kenya</p>
      </footer>
    </div>
  );
}

export default App;

