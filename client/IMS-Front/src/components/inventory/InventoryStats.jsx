import React from 'react';
import { useSelector } from 'react-redux';
import { Layers, CheckCircle, AlertTriangle, XOctagon, DollarSign } from 'lucide-react';
import StatCard from '../ui/StatCard';

const InventoryStats = () => {
  const { items } = useSelector((state) => state.inventory);

  // Compute metrics from items database
  const totalProducts = items.length;
  const inStock = items.filter((item) => item.quantity > 20).length;
  const lowStock = items.filter((item) => item.quantity > 0 && item.quantity <= 20).length;
  const outOfStock = items.filter((item) => item.quantity === 0).length;
  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  return (
    <div className="grid-container">
      {/* 1. Total Products Card */}
      <StatCard 
        icon={Layers}
        title="Total SKU Products"
        value={totalProducts}
        trend={{ text: '+4.2%', type: 'blue', label: 'vs last week' }}
        glowVariant="blue"
      />

      {/* 2. In Stock Card */}
      <StatCard 
        icon={CheckCircle}
        title="Active In-Stock SKUs"
        value={inStock}
        trend={{ text: '85% active', type: 'green', label: 'nominal level' }}
        glowVariant="green"
      />

      {/* 3. Low Stock Warning Card */}
      <StatCard 
        icon={AlertTriangle}
        title="Low Stock warnings"
        value={lowStock}
        trend={{ text: 'Requires action', type: 'orange', label: 'under threshold' }}
        glowVariant="orange"
      />

      {/* 4. Out of Stock Depleted Card */}
      <StatCard 
        icon={XOctagon}
        title="Depleted Out-of-Stock"
        value={outOfStock}
        trend={{ text: 'Urgent reorder', type: 'red', label: 'zero units' }}
        glowVariant="red"
      />

      {/* 5. Inventory Asset Value Card */}
      <StatCard 
        icon={DollarSign}
        title="Total Net Inventory Value"
        value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
        trend={{ text: '+12.4%', type: 'orange', label: 'vs last month' }}
        glowVariant="orange"
      />
    </div>
  );
};

export default InventoryStats;
