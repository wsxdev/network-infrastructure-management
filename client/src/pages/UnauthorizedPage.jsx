import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Acceso No Autorizado</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        Su rol actual no posee los privilegios requeridos para acceder a esta sección de la Torre de Control (RNF-06).
      </p>
      <Link to="/">
        <Button variant="secondary" size="sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
