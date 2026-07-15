import React from 'react';
import { useSelector } from 'react-redux';
import { Star, ShieldAlert, BadgeDollarSign, Truck } from 'lucide-react';
import StatCard from '../ui/StatCard';

const SupplierStats = () => {
  const suppliers = useSelector((state) => state.suppliers.items);
  const products = useSelector((state) => state.inventory.items);

  // 1. Total Suppliers Count
  const totalSuppliers = suppliers.length;

  // Compute supplier statistics from products
  const supplierStats = React.useMemo(() => {
    const stats = {};
    
    // Initialize statistics
    suppliers.forEach(sup => {
      stats[sup.name] = { skus: 0, units: 0, value: 0 };
    });

    products.forEach(p => {
      // Find corresponding supplier matching name (casing-insensitive)
      const matchedSup = suppliers.find(
        s => s.name.toLowerCase() === p.supplier?.toLowerCase()
      );
      
      const supName = matchedSup ? matchedSup.name : (p.supplier || 'Unknown');
      
      if (!stats[supName]) {
        stats[supName] = { skus: 0, units: 0, value: 0 };
      }
      
      stats[supName].skus += 1;
      stats[supName].units += p.quantity;
      stats[supName].value += (p.quantity * p.unitPrice);
    });

    return stats;
  }, [suppliers, products]);

  // 2. Top Rated Supplier (by performance rating)
  /*
  const topRatedSupplier = React.useMemo(() => {
    if (suppliers.length === 0) return { name: 'N/A', rating: 0 };
    
    let top = suppliers[0];
    suppliers.forEach(s => {
      if (s.rating > top.rating) {
        top = s;
      }
    });
    return top;
  }, [suppliers]);
  */

  // 3. Highest Valuation Supplier
  const topValuedSupplier = React.useMemo(() => {
    let topName = 'N/A';
    let maxValue = 0;
    
    Object.entries(supplierStats).forEach(([name, data]) => {
      if (data.value > maxValue) {
        maxValue = data.value;
        topName = name;
      }
    });

    return { name: topName, value: maxValue };
  }, [supplierStats]);

  // 4. Inactive count warnings
  // const inactiveCount = suppliers.filter(s => s.status?.toLowerCase() === 'inactive').length;

  return (
    <div className="supplier-stats-grid">
      {/* Total Suppliers */}
      <StatCard
        icon={Truck}
        title="Active Partnerships"
        value={totalSuppliers}
        trend={{ text: 'Verified vendors', type: 'blue', label: 'in registry' }}
        glowVariant="blue"
      />

      {/* Top Rated Partner */}
      {/*
      <StatCard
        icon={Star}
        title="Top Rated Vendor"
        value={topRatedSupplier.name}
        trend={{ 
          text: `Score: ${topRatedSupplier.rating || 0} / 5.0`, 
          type: 'green', 
          label: 'highest performance' 
        }}
        glowVariant="green"
      />
      */}

      {/* Highest Valuation Supplier */}
      <StatCard
        icon={BadgeDollarSign}
        title="Highest Valuation Vendor"
        value={topValuedSupplier.name}
        trend={{ 
          text: `$${topValuedSupplier.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} net assets`, 
          type: 'orange', 
          label: 'supplied valuation' 
        }}
        glowVariant="orange"
      />

      {/* Inactive count warnings */}
      {/*
      <StatCard
        icon={ShieldAlert}
        title="Inactive Partnerships"
        value={inactiveCount}
        trend={{ 
          text: inactiveCount > 0 ? 'Requires revision' : 'Fully nominal', 
          type: inactiveCount > 0 ? 'orange' : 'blue', 
          label: 'operational status' 
        }}
        glowVariant={inactiveCount > 0 ? 'orange' : 'blue'}
      />
      */}
    </div>
  );
};

export default SupplierStats;
