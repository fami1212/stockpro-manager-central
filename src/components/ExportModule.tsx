import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { exportToExcel, exportToCSV, formatDataForExport } from '@/utils/exportData';
import { toast } from 'sonner';

export const ExportModule = () => {
  const { products, sales, clients } = useApp();
  const [selectedType, setSelectedType] = useState<'products' | 'sales' | 'clients' | 'suppliers'>('products');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');

  const handleExport = () => {
    try {
      let data: any[] = [];
      let filename = '';

      switch (selectedType) {
        case 'products':
          data = formatDataForExport(products, 'products');
          filename = `Produits_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'sales':
          data = formatDataForExport(sales, 'sales');
          filename = `Ventes_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'clients':
          data = formatDataForExport(clients, 'clients');
          filename = `Clients_${new Date().toISOString().split('T')[0]}`;
          break;
        default:
          toast.error('Type de données non supporté');
          return;
      }

      if (data.length === 0) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      const config = {
        filename,
        sheetName: selectedType.charAt(0).toUpperCase() + selectedType.slice(1),
        data
      };

      if (exportFormat === 'excel') {
        exportToExcel(config);
      } else {
        exportToCSV(config);
      }

      toast.success(`Export ${exportFormat.toUpperCase()} réussi !`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const getDataCount = () => {
    switch (selectedType) {
      case 'products':
        return products.length;
      case 'sales':
        return sales.length;
      case 'clients':
        return clients.length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Export de Données</h2>
        <p className="text-muted-foreground">
          Exportez vos données en Excel ou CSV
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'export</CardTitle>
          <CardDescription>
            Sélectionnez le type de données et le format d'export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="dataType">Type de données</Label>
              <Select
                value={selectedType}
                onValueChange={(value: any) => setSelectedType(value)}
              >
                <SelectTrigger id="dataType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Produits ({products.length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="sales">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Ventes ({sales.length})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="clients">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Clients ({clients.length})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getDataCount()} enregistrement(s) disponible(s)
              </p>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Format d'export</Label>
              <Select
                value={exportFormat}
                onValueChange={(value: any) => setExportFormat(value)}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel (.xlsx)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>CSV (.csv)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {exportFormat === 'excel' ? 'Compatible avec Excel, LibreOffice' : 'Format universel, compatible avec tous les tableurs'}
              </p>
            </div>
          </div>

          {/* Export Preview */}
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-2">Aperçu de l'export</h4>
            <div className="space-y-1 text-sm">
              <p>📁 Nom du fichier: <code className="text-xs bg-background px-2 py-1 rounded">
                {selectedType}_{new Date().toISOString().split('T')[0]}.{exportFormat === 'excel' ? 'xlsx' : 'csv'}
              </code></p>
              <p>📊 Nombre de lignes: <strong>{getDataCount()}</strong></p>
              <p>📝 Format: <strong>{exportFormat.toUpperCase()}</strong></p>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={getDataCount() === 0}
              className="gap-2"
              size="lg"
            >
              <Download className="w-4 h-4" />
              Exporter maintenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils d'utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Les exports Excel (.xlsx) conservent la mise en forme et sont recommandés pour l'analyse</li>
            <li>• Les exports CSV (.csv) sont plus légers et universellement compatibles</li>
            <li>• Les données sont exportées avec les colonnes les plus pertinentes</li>
            <li>• Vous pouvez ouvrir les fichiers avec Excel, Google Sheets, LibreOffice, etc.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
