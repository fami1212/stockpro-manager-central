
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', ventes: 4000 },
  { name: 'Fév', ventes: 3000 },
  { name: 'Mar', ventes: 5000 },
  { name: 'Avr', ventes: 4500 },
  { name: 'Mai', ventes: 6000 },
  { name: 'Jun', ventes: 5500 },
  { name: 'Jul', ventes: 7000 },
];

export const SalesChart = () => {
  return (
    <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des ventes</h3>
      <div className="h-48 lg:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#666" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="ventes" 
              stroke="#1e40af" 
              strokeWidth={3}
              dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
