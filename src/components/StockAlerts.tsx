
export const StockAlerts = () => {
  const alerts = [
    { product: 'iPhone 15 Pro', stock: 5, threshold: 10 },
    { product: 'Samsung Galaxy S24', stock: 2, threshold: 15 },
    { product: 'MacBook Air M2', stock: 1, threshold: 5 },
    { product: 'iPad Pro', stock: 3, threshold: 8 },
  ];

  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes Stock Bas</h3>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400 space-y-2 sm:space-y-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{alert.product}</p>
              <p className="text-xs text-gray-600">Seuil: {alert.threshold} unités</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm font-bold text-red-600">{alert.stock} restant</span>
              <p className="text-xs text-red-500">Stock bas!</p>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base">
        Réapprovisionner
      </button>
    </div>
  );
};
