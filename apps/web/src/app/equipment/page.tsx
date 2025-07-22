'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  description?: string;
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR';
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  isAvailable: boolean;
  isIncludedInBids: boolean;
  specifications?: Record<string, string>;
  images?: string[];
  lastServiceDate?: string;
  nextServiceDue?: string;
  location?: string;
  serialNumber?: string;
  insuranceValue?: number;
  createdAt: string;
  updatedAt: string;
}

interface EquipmentStats {
  totalItems: number;
  totalValue: number;
  availableItems: number;
  categoriesCount: number;
  avgAge: number;
  maintenanceDue: number;
}

const equipmentCategories = [
  'Cameras',
  'Lenses',
  'Audio Equipment',
  'Lighting',
  'Stabilizers',
  'Drones',
  'Tripods & Supports',
  'Monitors',
  'Storage & Memory',
  'Accessories',
  'Post-Production',
  'Other'
];

const conditionConfig = {
  NEW: { color: 'bg-green-100 text-green-800', icon: '✨', label: 'New' },
  EXCELLENT: { color: 'bg-blue-100 text-blue-800', icon: '⭐', label: 'Excellent' },
  GOOD: { color: 'bg-yellow-100 text-yellow-800', icon: '👍', label: 'Good' },
  FAIR: { color: 'bg-orange-100 text-orange-800', icon: '⚠️', label: 'Fair' },
  NEEDS_REPAIR: { color: 'bg-red-100 text-red-800', icon: '🔧', label: 'Needs Repair' }
};

export default function EquipmentPage() {
  const { user, isAuthenticated } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'value' | 'date'>('name');

  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: '',
    category: '',
    brand: '',
    model: '',
    description: '',
    condition: 'GOOD',
    purchasePrice: 0,
    currentValue: 0,
    isAvailable: true,
    isIncludedInBids: true,
    location: '',
    serialNumber: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadEquipment();
      loadStats();
    }
  }, [isAuthenticated, filter, sortBy]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        ...(filter !== 'all' && { category: filter }),
        sortBy
      });
      
      const response = await apiClient.get(`/api/crew/equipment?${params}`);
      
      if (response.success) {
        setEquipment((response.data as any)?.equipment || []);
      } else {
        setError('Failed to load equipment');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/crew/equipment/stats');
      if (response.success) {
        setStats(response.data as EquipmentStats);
      }
    } catch (error) {
      console.error('Failed to load equipment stats:', error);
    }
  };

  const saveEquipment = async () => {
    try {
      const equipmentData = {
        ...newEquipment,
        purchasePrice: Number(newEquipment.purchasePrice) || 0,
        currentValue: Number(newEquipment.currentValue) || 0
      };

      let response;
      if (editingItem) {
        response = await apiClient.patch(`/api/crew/equipment/${editingItem.id}`, equipmentData);
      } else {
        response = await apiClient.post('/api/crew/equipment', equipmentData);
      }
      
      if (response.success) {
        await loadEquipment();
        await loadStats();
        setShowAddModal(false);
        setEditingItem(null);
        setNewEquipment({
          name: '',
          category: '',
          brand: '',
          model: '',
          description: '',
          condition: 'GOOD',
          purchasePrice: 0,
          currentValue: 0,
          isAvailable: true,
          isIncludedInBids: true,
          location: '',
          serialNumber: ''
        });
      } else {
        setError('Failed to save equipment');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save equipment');
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment item?')) return;
    
    try {
      const response = await apiClient.delete(`/api/crew/equipment/${id}`);
      if (response.success) {
        setEquipment(prev => prev.filter(item => item.id !== id));
        await loadStats();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete equipment');
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const response = await apiClient.patch(`/api/crew/equipment/${id}`, { isAvailable });
      if (response.success) {
        setEquipment(prev => prev.map(item => 
          item.id === id ? { ...item, isAvailable } : item
        ));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update availability');
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEquipmentAge = (purchaseDate: string) => {
    const now = new Date();
    const purchase = new Date(purchaseDate);
    const diffInMonths = (now.getFullYear() - purchase.getFullYear()) * 12 + (now.getMonth() - purchase.getMonth());
    
    if (diffInMonths < 12) return `${diffInMonths} months`;
    const years = Math.floor(diffInMonths / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="card-glass p-8">
                <div className="mb-6">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📹</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Equipment Management
                  </h1>
                  <p className="text-gray-600">
                    Please sign in to manage your equipment inventory
                  </p>
                </div>
                
                <Link href={"/auth/login" as any} className="btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-heading mb-2 text-3xl font-bold">
                    Equipment Management
                  </h1>
                  <p className="text-muted">
                    Manage your professional equipment inventory
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    Add Equipment
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-none">
                      <span className="text-xl">📦</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalItems}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-none">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-none">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.availableItems}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-none">
                      <span className="text-xl">📂</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.categoriesCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-none">
                      <span className="text-xl">📅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Avg Age</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgAge.toFixed(1)}y
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-none">
                      <span className="text-xl">🔧</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Maintenance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.maintenanceDue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm rounded-none border transition-colors ${
                    filter === 'all'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Equipment
                </button>
                {equipmentCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 text-sm rounded-none border transition-colors ${
                      filter === category
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input w-auto"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="value">Value</option>
                  <option value="date">Date Added</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Equipment Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card-glass p-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredEquipment.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📹</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'all' ? 'No equipment added yet' : `No ${filter} equipment`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? 'Start building your equipment inventory to showcase your capabilities' 
                      : `You don't have any ${filter} equipment in your inventory`
                    }
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                >
                  Add Your First Equipment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="card-glass p-3 hover:shadow-lg transition-shadow">
                    {/* Equipment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.brand} {item.model}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${conditionConfig[item.condition].color}`}>
                          {conditionConfig[item.condition].icon} {conditionConfig[item.condition].label}
                        </span>
                      </div>
                    </div>

                    {/* Category and Availability */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {item.category}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        {item.isAvailable ? (
                          <span className="text-green-600 text-xs">✅ Available</span>
                        ) : (
                          <span className="text-red-600 text-xs">❌ In Use</span>
                        )}
                        
                        {item.isIncludedInBids && (
                          <span className="text-purple-600 text-xs">📋 In Bids</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Value Information */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {item.purchasePrice && (
                        <div>
                          <span className="text-gray-500">Purchase:</span>
                          <p className="font-semibold">{formatCurrency(item.purchasePrice)}</p>
                        </div>
                      )}
                      {item.currentValue && (
                        <div>
                          <span className="text-gray-500">Current:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(item.currentValue)}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Details */}
                    <div className="text-xs text-gray-500 space-y-1 mb-4">
                      {item.serialNumber && (
                        <div>S/N: {item.serialNumber}</div>
                      )}
                      {item.location && (
                        <div>📍 {item.location}</div>
                      )}
                      {item.purchaseDate && (
                        <div>📅 {getEquipmentAge(item.purchaseDate)} old</div>
                      )}
                      {item.nextServiceDue && new Date(item.nextServiceDue) > new Date() && (
                        <div className="text-orange-600">🔧 Service due: {formatDate(item.nextServiceDue)}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewEquipment(item);
                          setShowAddModal(true);
                        }}
                        className="btn-ghost-sm flex-1"
                      >
                        Edit
                      </button>
                      
                      <button
                        onClick={() => toggleAvailability(item.id, !item.isAvailable)}
                        className={`btn-sm flex-1 ${
                          item.isAvailable 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {item.isAvailable ? 'Mark In Use' : 'Mark Available'}
                      </button>
                      
                      <button
                        onClick={() => deleteEquipment(item.id)}
                        className="btn-secondary-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Equipment Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-none p-3 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                        setNewEquipment({
                          name: '',
                          category: '',
                          brand: '',
                          model: '',
                          description: '',
                          condition: 'GOOD',
                          purchasePrice: 0,
                          currentValue: 0,
                          isAvailable: true,
                          isIncludedInBids: true,
                          location: '',
                          serialNumber: ''
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Name *
                      </label>
                      <input
                        type="text"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                        className="input w-full"
                        placeholder="e.g., Sony A7S III Camera"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={newEquipment.category}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, category: e.target.value }))}
                        className="input w-full"
                      >
                        <option value="">Select Category</option>
                        {equipmentCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={newEquipment.brand}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                        className="input w-full"
                        placeholder="e.g., Sony, Canon, RED"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={newEquipment.model}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                        className="input w-full"
                        placeholder="e.g., A7S III, 5D Mark IV"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <select
                        value={newEquipment.condition}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, condition: e.target.value as any }))}
                        className="input w-full"
                      >
                        {Object.entries(conditionConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={newEquipment.serialNumber}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="input w-full"
                        placeholder="Serial number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Price ($)
                      </label>
                      <input
                        type="number"
                        value={newEquipment.purchasePrice}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                        className="input w-full"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Value ($)
                      </label>
                      <input
                        type="number"
                        value={newEquipment.currentValue}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
                        className="input w-full"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newEquipment.location}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                        className="input w-full"
                        placeholder="e.g., Studio A, Home Office"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newEquipment.description}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, description: e.target.value }))}
                        className="input w-full h-24 resize-none"
                        placeholder="Describe the equipment, specifications, included accessories..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex space-x-6">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newEquipment.isAvailable}
                            onChange={(e) => setNewEquipment(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Currently Available
                          </span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newEquipment.isIncludedInBids}
                            onChange={(e) => setNewEquipment(prev => ({ ...prev, isIncludedInBids: e.target.checked }))}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Include in Project Bids
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                      }}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEquipment}
                      className="btn-primary flex-1"
                      disabled={!newEquipment.name || !newEquipment.category}
                    >
                      {editingItem ? 'Update Equipment' : 'Add Equipment'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-none p-3">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={"/my-bids" as any} className="btn-secondary text-center">
                  📋 View My Bids
                </Link>
                <Link href={"/marketplace" as any} className="btn-secondary text-center">
                  🔍 Browse Projects
                </Link>
                <Link href={"/profile" as any} className="btn-secondary text-center">
                  👤 Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
