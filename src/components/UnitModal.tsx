
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnitModalProps {
  onClose: () => void;
}

export const UnitModal = ({ onClose }: UnitModalProps) => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('');

  const unitTypes = ['Unité', 'Poids', 'Volume', 'Longueur', 'Surface', 'Groupé'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle unité:', { name, symbol, type });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle Unité</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'unité *
            </label>
            <Input
              placeholder="Ex: Kilogramme, Litre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbole *
            </label>
            <Input
              placeholder="Ex: kg, L, m..."
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'unité *
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {unitTypes.map((unitType) => (
                  <SelectItem key={unitType} value={unitType}>{unitType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
              Créer l'unité
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
