import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import "./PrivateLayout.css";


export default function PrivateLayout() {
    return (
    <div className="layout-container">
     
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};