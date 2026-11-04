import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
