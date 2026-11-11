import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { InventoryPage } from './pages/InventoryPage';
import { TopologyPage } from './pages/TopologyPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Enrutamiento principal de la aplicación NOC ESPOCH.
 * Acceso directo al Inventario de Dispositivos (RF-03.02) dentro de la Torre de Control.
 */
export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/topology" element={<TopologyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Ruta opcional de login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Fallback 404 a inventario */}
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
}

export default App;
