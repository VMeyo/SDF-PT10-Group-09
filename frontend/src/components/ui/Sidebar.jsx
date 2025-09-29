import React from "react";

const Sidebar = ({ onSelect }) => {
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <ul className="space-y-4">
        <li
          className="cursor-pointer hover:text-yellow-400"
          onClick={() => onSelect("dashboard")}
        >
          Dashboard
        </li>
        <li
          className="cursor-pointer hover:text-yellow-400"
          onClick={() => onSelect("profile")}
        >
          Profile
        </li>
        <li
          className="cursor-pointer hover:text-yellow-400"
          onClick={() => onSelect("incidents")}
        >
          Incidents
        </li>
        <li
          className="cursor-pointer hover:text-yellow-400"
          onClick={() => onSelect("reports")}
        >
          Reports
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
