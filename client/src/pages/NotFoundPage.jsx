import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">404 - Página no encontrada</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        La ruta solicitada no existe dentro de la plataforma NOC.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Button>
      </Link>
    </div>
  );
}
