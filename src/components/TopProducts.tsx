
export const TopProducts = () => {
  const products = [
     { name: 'iPhone 15 Pro', sales: 145, revenue: '145 000 CFA' },
     { name: 'Samsung Galaxy S24', sales: 98, revenue: '78 400 CFA' },
     { name: 'MacBook Air M2', sales: 67, revenue: '80 400 CFA' },
     { name: 'iPad Pro', sales: 54, revenue: '43 200 CFA' },
     { name: 'AirPods Pro', sales: 123, revenue: '36 900 CFA' },
   ];

  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits les plus vendus</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sales} ventes</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-600 ml-2">{product.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
