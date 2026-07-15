import React from 'react';
import { useSelector } from 'react-redux';
import { FolderHeart, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import StatCard from '../ui/StatCard';

const CategoryStats = () => {
  const categories = useSelector((state) => state.categories.items);
  const products = useSelector((state) => state.inventory.items);

  // 1. Total Categories Count
  const totalCategories = categories.length;

  // Compute category statistics from products
  const categoryStats = React.useMemo(() => {
    const stats = {};
    
    // Initialize stats for registered categories
    categories.forEach(cat => {
      stats[cat.name] = { skus: 0, units: 0, value: 0 };
    });

    // Populate counts from items
    products.forEach(p => {
      // Cross reference using casing-insensitive check
      const matchedCat = categories.find(
        c => c.name.toLowerCase() === p.category?.toLowerCase()
      );
      
      const catName = matchedCat ? matchedCat.name : (p.category || 'Uncategorized');
      
      if (!stats[catName]) {
        stats[catName] = { skus: 0, units: 0, value: 0 };
      }
      
      stats[catName].skus += 1;
      stats[catName].units += p.quantity;
      stats[catName].value += (p.quantity * p.unitPrice);
    });

    return stats;
  }, [categories, products]);

  // 2. Most Populated Category (by unique SKU types)
  const topPopulatedCat = React.useMemo(() => {
    let topName = 'N/A';
    let maxSKUs = 0;
    
    Object.entries(categoryStats).forEach(([name, data]) => {
      if (data.skus > maxSKUs) {
        maxSKUs = data.skus;
        topName = name;
      }
    });

    return { name: topName, count: maxSKUs };
  }, [categoryStats]);

  // 3. Highest Valuation Category
  const topValuedCat = React.useMemo(() => {
    let topName = 'N/A';
    let maxValue = 0;
    
    Object.entries(categoryStats).forEach(([name, data]) => {
      if (data.value > maxValue) {
        maxValue = data.value;
        topName = name;
      }
    });

    return { name: topName, value: maxValue };
  }, [categoryStats]);

  // 4. Inactive Categories Count
  // const inactiveCount = categories.filter(c => c.status?.toLowerCase() === 'inactive').length;

  return (
    <div className="category-stats-grid">
      {/* Total Categories */}
      <StatCard
        icon={Layers}
        title="Total Classifications"
        value={totalCategories}
        trend={{ text: 'Standard directories', type: 'blue', label: 'registered' }}
        glowVariant="blue"
      />

      {/* Top Population Card */}
      <StatCard
        icon={FolderHeart}
        title="Top Category (by SKUs)"
        value={topPopulatedCat.name}
        trend={{ 
          text: `${topPopulatedCat.count} unique products`, 
          type: 'green', 
          label: 'most SKU types' 
        }}
        glowVariant="green"
      />

      {/* Top Valuation Card */}
      <StatCard
        icon={TrendingUp}
        title="Top Category (by Valuation)"
        value={topValuedCat.name}
        trend={{ 
          text: `$${topValuedCat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} value`, 
          type: 'orange', 
          label: 'highest assets' 
        }}
        glowVariant="orange"
      />

      {/* Inactive count warnings */}
      {/*
      <StatCard
        icon={AlertTriangle}
        title="Inactive Categories"
        value={inactiveCount}
        trend={{ 
          text: inactiveCount > 0 ? 'Requires validation' : 'All active', 
          type: inactiveCount > 0 ? 'orange' : 'blue', 
          label: 'status level' 
        }}
        glowVariant={inactiveCount > 0 ? 'orange' : 'blue'}
      />
      */}
    </div>
  );
};

export default CategoryStats;
