
import { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CategoryModalProps {
  onClose: () => void;
}

export const CategoryModal = ({ onClose }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('blue');

  const colors = [
    { name: 'blue', label: 'Bleu', class: 'bg-blue-500' },
    { name: 'green', label: 'Vert', class: 'bg-green-500' },
    { name: 'purple', label: 'Violet', class: 'bg-purple-500' },
    { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { name: 'red', label: 'Rouge', class: 'bg-red-500' },
    { name: 'yellow', label: 'Jaune', class: 'bg-yellow-500' },
    { name: 'pink', label: 'Rose', class: 'bg-pink-500' },
    { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle catégorie:', {
      name,
      description,
      color: selectedColor
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Nouvelle Catégorie</h3>
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
              Nom de la catégorie *
            </label>
            <Input
              placeholder="Ex: Électronique, Alimentaire..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Description de la catégorie..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Couleur
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    selectedColor === color.name 
                      ? 'border-gray-900 ring-2 ring-gray-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${color.class}`}></div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Couleur sélectionnée: {colors.find(c => c.name === selectedColor)?.label}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              Créer la catégorie
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
