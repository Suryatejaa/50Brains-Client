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
  notes?: string;
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

const defaultEquipmentCategories = [
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'value' | 'date'>('name');
  const [equipmentCategories, setEquipmentCategories] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
    serialNumber: '',
    purchaseDate: '',
    insuranceValue: 0,
    notes: '',
    specifications: {},
    images: []
  });

  // Validation functions based on backend schema
  const validateEquipment = (data: Partial<Equipment>): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Name validation (min 2, max 200 characters)
    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Equipment name must be at least 2 characters long';
    } else if (data.name.length > 200) {
      errors.name = 'Equipment name cannot exceed 200 characters';
    }

    // Category validation (must be one of the valid categories)
    if (!data.category) {
      errors.category = 'Category is required';
    } else if (!defaultEquipmentCategories.includes(data.category)) {
      errors.category = 'Please select a valid category';
    }

    // Brand validation (max 100 characters)
    if (data.brand && data.brand.length > 100) {
      errors.brand = 'Brand name cannot exceed 100 characters';
    }

    // Model validation (max 100 characters)
    if (data.model && data.model.length > 100) {
      errors.model = 'Model name cannot exceed 100 characters';
    }

    // Description validation (max 1000 characters)
    if (data.description && data.description.length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters';
    }

    // Serial number validation (max 100 characters, cannot be empty if provided)
    if (data.serialNumber && data.serialNumber.trim() === '') {
      errors.serialNumber = 'Serial number cannot be empty';
    } else if (data.serialNumber && data.serialNumber.length > 100) {
      errors.serialNumber = 'Serial number cannot exceed 100 characters';
    }

    // Location validation (max 200 characters)
    if (data.location && data.location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    // Notes validation (max 500 characters)
    if (data.notes && data.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }

    // Condition validation (must be one of the valid enum values)
    const validConditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR'];
    if (data.condition && !validConditions.includes(data.condition)) {
      errors.condition = 'Please select a valid condition';
    }

    // Price validations (must be non-negative)
    if (data.purchasePrice && data.purchasePrice < 0) {
      errors.purchasePrice = 'Purchase price cannot be negative';
    }

    if (data.currentValue && data.currentValue < 0) {
      errors.currentValue = 'Current value cannot be negative';
    }

    if (data.insuranceValue && data.insuranceValue < 0) {
      errors.insuranceValue = 'Insurance value cannot be negative';
    }

    return errors;
  };

  const loadCategories = async () => {
    try {
      console.log('Loading user equipment categories...');
      const response = await apiClient.get('/api/user/equipment/categories');
      console.log('Categories API response:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        // Backend returns categories with counts, extract just the category names
        const categories = response.data.map((item: any) => item.category).filter(Boolean);
        console.log('User has equipment in categories:', categories);
        setEquipmentCategories(categories);
      } else {
        // If API response is invalid, set empty array (user has no equipment yet)
        console.log('No user categories found or invalid response');
        setEquipmentCategories([]);
      }
    } catch (error) {
      console.error('Failed to load user equipment categories:', error);
      // If API fails, set empty array
      setEquipmentCategories([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadEquipment();
      loadStats();
      loadCategories();
    }
  }, [isAuthenticated, filter, sortBy]);

  // Debug: Log success message changes
  useEffect(() => {
    console.log('Success message changed:', successMessage);
  }, [successMessage]);

  // Debug: Log equipment state changes
  useEffect(() => {
    console.log('Equipment state changed:', equipment.length, 'items');
  }, [equipment]);

  const loadEquipment = async () => {
    try {
      console.log('Loading equipment with filter:', filter, 'sortBy:', sortBy);
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...(filter !== 'all' && { category: filter }),
        sortBy
      });

      console.log('API URL:', `/api/user/equipment?${params}`);
      const response = await apiClient.get(`/api/user/equipment?${params}`);
      console.log('Equipment API response:', response);

      if (response.success) {
        // Backend returns { equipment, pagination } structure
        const equipmentData = (response.data as any)?.equipment || [];
        console.log('Setting equipment state with:', equipmentData.length, 'items');
        setEquipment(equipmentData);
      } else {
        console.log('Equipment API failed:', response);
        setError('Failed to load equipment');
      }
    } catch (error: any) {
      console.log('Equipment API error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load equipment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/user/equipment/stats');
      if (response.success) {
        setStats(response.data as EquipmentStats);
      }
    } catch (error) {
      console.error('Failed to load equipment stats:', error);
    }
  };

  const saveEquipment = async () => {
    try {
      setSaving(true);
      // Clear previous validation errors
      setValidationErrors({});

      // Validate the equipment data
      const errors = validateEquipment(newEquipment);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSaving(false);
        return;
      }

      // Filter out empty/undefined fields and userID to avoid sending them
      const equipmentData = Object.fromEntries(
        Object.entries({
          ...newEquipment,
          purchasePrice: Number(newEquipment.purchasePrice) || 0,
          currentValue: Number(newEquipment.currentValue) || 0,
          insuranceValue: Number(newEquipment.insuranceValue) || 0,
        }).filter(([key, value]) => {
          // Exclude userID and empty values
          if (key === 'userID' || key === 'userId' || key === 'id') return false;
          if (key === 'createdAt' || key === 'updatedAt') return false;
          // Keep required fields and non-empty values
          if (key === 'name' || key === 'category') return true;
          if (value === null || value === undefined) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          if (typeof value === 'number' && value === 0 && key !== 'purchasePrice' && key !== 'currentValue' && key !== 'insuranceValue') return false;
          return true;
        })
      );
      console.log('Equipment data:', equipmentData);
      let response;
      if (editingItem) {
        response = await apiClient.put(`/api/user/equipment/${editingItem.id}`, equipmentData);
      } else {
        response = await apiClient.post('/api/user/equipment', equipmentData);
      }
      console.log('Response:', response);
      if (response.success) {
        console.log('Equipment saved successfully:', response);

        // Show success message
        setError(null); // Clear any previous errors
        setSuccessMessage(null); // Clear any previous success messages
        setShowAddModal(false);
        setEditingItem(null);
        setValidationErrors({});

        // Reset form
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
          serialNumber: '',
          purchaseDate: '',
          insuranceValue: 0,
          notes: '',
          specifications: {}
        });

        // Add the new equipment directly to state if it's a new item
        if (!editingItem && response.data) {
          console.log('Adding new equipment directly to state:', response.data);
          const newEquipmentItem = response.data as Equipment;
          setEquipment(prev => [...prev, newEquipmentItem]);
        }

        // Refresh data
        console.log('Refreshing equipment data...');
        await loadEquipment();
        console.log('Refreshing stats...');
        await loadStats();
        console.log('Refreshing categories...');
        await loadCategories(); // Refresh categories too
        console.log('All data refreshed successfully');

        // Show success feedback immediately
        console.log('Setting success message immediately...');
        setSuccessMessage('✅ Equipment saved successfully!');
        console.log('Success message set, will clear in 3 seconds');

        setTimeout(() => {
          console.log('Clearing success message');
          setSuccessMessage(null);
        }, 3000); // Clear success message after 3 seconds
      } else {
        setSuccessMessage(null); // Clear any success message
        setError('Failed to save equipment');
      }
    } catch (error: any) {
      console.log('Error object:', error);
      console.log('Error message:', error.message);
      console.log('Error errors:', error.errors);
      console.log('Error success:', error.success);

      // Handle backend validation errors for custom APIError
      if (error.errors && Array.isArray(error.errors)) {
        const backendErrors: Record<string, string> = {};

        // Parse backend validation errors
        error.errors.forEach((errorMsg: string) => {
          // Extract field name from error message (e.g., "serialNumber" is not allowed to be empty)
          const fieldMatch = errorMsg.match(/"([^"]+)"/);
          if (fieldMatch) {
            const fieldName = fieldMatch[1];
            // Convert camelCase to display name
            const displayName = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            // Extract the actual error message after the field name
            const errorPart = errorMsg.split('"')[2]?.trim() || 'is invalid';
            backendErrors[fieldName] = `${displayName} ${errorPart}`;
          } else {
            // If we can't parse the field name, add to general errors
            backendErrors['general'] = errorMsg;
          }
        });

        console.log('Parsed backend errors:', backendErrors);
        setValidationErrors(backendErrors);
      } else {
        console.log('Not a validation error, showing general error');
        const errorMessage = error.message || 'Failed to save equipment';
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment item?')) return;

    try {
      const response = await apiClient.delete(`/api/user/equipment/${id}`);
      if (response.success) {
        setEquipment(prev => prev.filter(item => item.id !== id));
        await loadStats();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete equipment';
      setError(errorMessage);
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const response = await apiClient.patch(`/api/user/equipment/${id}/availability`, { isAvailable });
      if (response.success) {
        setEquipment(prev => prev.map(item =>
          item.id === id ? { ...item, isAvailable } : item
        ));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update availability';
      setError(errorMessage);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  // TODO: remove decimal places
  // TODO: add k for thousands
  // TODO: add m for millions
  // TODO: add commas for large numbers

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return '₹0';

    if (amount >= 1000000) {
      return '₹' + (amount / 1000000).toFixed(1) + 'm';
    } else if (amount >= 1000) {
      return '₹' + (amount / 1000).toFixed(1) + 'k';
    } else {
      return '₹' + amount.toFixed(2);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
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

  const showFieldError = (fieldName: string) => {
    return validationErrors[fieldName] ? (
      <p className="text-red-500 text-xs mt-1">{validationErrors[fieldName]}</p>
    ) : null;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-1">
          <div className="content-container py-1">
            <div className="mx-auto max-w-4xl text-center">
              <div className="card-glass p-1">
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
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-heading mb-2 text-3xl font-bold">
                    Equipment Management
                  </h1>
                  <p className="text-muted">
                    Manage your professional equipment inventory
                  </p>
                </div>

                <div className="mt-1 sm:mt-0">
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-2">
                <div className="card-glass p-1">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-none">
                      <span className="text-xl">📦</span>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalItems}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-1">
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

                <div className="card-glass p-1">
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

                <div className="card-glass p-1">
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

                <div className="card-glass p-1">
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

                <div className="card-glass p-1">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm rounded-none border transition-colors ${filter === 'all'
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
                    className={`px-4 py-2 text-sm rounded-none border transition-colors ${filter === category
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
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

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 rounded-none border border-green-200 bg-green-50 p-4">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Equipment Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {filteredEquipment.map((item) => (
                  <div key={item.id} className="card-glass p-3 hover:shadow-lg transition-shadow flex flex-col h-full">
                    {/* Equipment Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {item.name}
                        </h3>
                        {(item.brand || item.model) && (
                          <p className="text-sm text-gray-600 truncate">
                            {item.brand} {item.model}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-2">
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
                    {(item.purchasePrice || item.currentValue) && (
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        {item.purchasePrice ? (
                          <div>
                            <span className="text-gray-500 text-xs">Purchase:</span>
                            <p className="font-semibold text-sm">{formatCurrency(item.purchasePrice)}</p>
                          </div>
                        ) : (
                          <div></div>
                        )}
                        {item.currentValue ? (
                          <div>
                            <span className="text-gray-500 text-xs">Current:</span>
                            <p className="font-semibold text-green-600 text-sm">{formatCurrency(item.currentValue)}</p>
                          </div>
                        ) : (
                          <div></div>
                        )}
                      </div>
                    )}

                    {/* Additional Details */}
                    {(item.serialNumber || item.location || item.purchaseDate || (item.insuranceValue && item.insuranceValue > 0) || item.notes) && (
                      <div className="text-xs text-gray-500 space-y-1 mb-3 flex-grow">
                        {item.serialNumber && (
                          <div>S/N: {item.serialNumber}</div>
                        )}
                        {item.location && (
                          <div>📍 {item.location}</div>
                        )}
                        {item.purchaseDate && (
                          <div>📅 {getEquipmentAge(item.purchaseDate)} old</div>
                        )}
                        {item.insuranceValue && item.insuranceValue > 0 && (
                          <div>🛡️ Insured: {formatCurrency(item.insuranceValue)}</div>
                        )}
                        {item.nextServiceDue && new Date(item.nextServiceDue) > new Date() && (
                          <div className="text-orange-600">🔧 Service due: {formatDate(item.nextServiceDue)}</div>
                        )}
                        {item.notes && (
                          <div className="text-gray-600 mt-2 p-2 bg-gray-50 rounded text-xs">
                            📝 {item.notes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Spacer to push buttons to bottom */}
                    <div className="flex-grow"></div>

                    {/* Actions */}
                    <div className="flex space-x-1 border-t pt-2 mt-auto">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewEquipment(item);
                          setShowAddModal(true);
                        }}
                        className="btn-sm flex-1 rounded-none bg-gray-300 text-gray-700 hover:bg-gray-400"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleAvailability(item.id, !item.isAvailable)}
                        className={`btn-sm flex-1 ${item.isAvailable
                          ? 'bg-red-300 text-black hover:bg-red-400'
                          : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                      >
                        {item.isAvailable ? 'Mark In Use' : 'Mark Available'}
                      </button>

                      <button
                        onClick={() => deleteEquipment(item.id)}
                        className="btn-sm flex-1 rounded-none bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Equipment Modal */}
            {showAddModal && (
              <div className="fixed inset-1 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-none p-3 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingItem ? 'Edit Equipment' : 'Add New Equipment'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingItem(null);
                        setValidationErrors({});
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
                          serialNumber: '',
                          purchaseDate: '',
                          insuranceValue: 0,
                          notes: '',
                          specifications: {},
                          images: []
                        });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* General validation errors */}
                  {validationErrors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {validationErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Equipment Name *
                      </label>
                      <input
                        type="text"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))}
                        className={`input w-full ${validationErrors.name ? 'border-red-500' : ''}`}
                        placeholder="e.g., Sony A7S III Camera"
                        maxLength={200}
                      />
                      {showFieldError('name')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={newEquipment.category}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, category: e.target.value }))}
                        className={`input w-full ${validationErrors.category ? 'border-red-500' : ''}`}
                      >
                        <option value="">Select Category</option>
                        {defaultEquipmentCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {showFieldError('category')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={newEquipment.brand}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, brand: e.target.value }))}
                        className={`input w-full ${validationErrors.brand ? 'border-red-500' : ''}`}
                        placeholder="e.g., Sony, Canon, RED"
                        maxLength={100}
                      />
                      {showFieldError('brand')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        value={newEquipment.model}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, model: e.target.value }))}
                        className={`input w-full ${validationErrors.model ? 'border-red-500' : ''}`}
                        placeholder="e.g., A7S III, 5D Mark IV"
                        maxLength={100}
                      />
                      {showFieldError('model')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Condition
                      </label>
                      <select
                        value={newEquipment.condition}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, condition: e.target.value as any }))}
                        className={`input w-full ${validationErrors.condition ? 'border-red-500' : ''}`}
                      >
                        {Object.entries(conditionConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                      {showFieldError('condition')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={newEquipment.serialNumber}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className={`input w-full ${validationErrors.serialNumber ? 'border-red-500' : ''}`}
                        placeholder="Serial number"
                        maxLength={100}
                      />
                      {showFieldError('serialNumber')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Price (₹)
                      </label>
                      <input
                        type="number"
                        value={newEquipment.purchasePrice}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                        className={`input w-full ${validationErrors.purchasePrice ? 'border-red-500' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {showFieldError('purchasePrice')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Value (₹)
                      </label>
                      <input
                        type="number"
                        value={newEquipment.currentValue}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
                        className={`input w-full ${validationErrors.currentValue ? 'border-red-500' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {showFieldError('currentValue')}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={newEquipment.purchaseDate}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Value (₹)
                      </label>
                      <input
                        type="number"
                        value={newEquipment.insuranceValue}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, insuranceValue: Number(e.target.value) }))}
                        className={`input w-full ${validationErrors.insuranceValue ? 'border-red-500' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      {showFieldError('insuranceValue')}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newEquipment.location}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))}
                        className={`input w-full ${validationErrors.location ? 'border-red-500' : ''}`}
                        placeholder="e.g., Studio A, Home Office"
                        maxLength={200}
                      />
                      {showFieldError('location')}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={newEquipment.description}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, description: e.target.value }))}
                        className={`input w-full h-24 resize-none ${validationErrors.description ? 'border-red-500' : ''}`}
                        placeholder="Describe the equipment, specifications, included accessories..."
                        maxLength={1000}
                      />
                      {showFieldError('description')}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={newEquipment.notes}
                        onChange={(e) => setNewEquipment(prev => ({ ...prev, notes: e.target.value }))}
                        className={`input w-full h-16 resize-none ${validationErrors.notes ? 'border-red-500' : ''}`}
                        placeholder="Additional notes, maintenance history, etc..."
                        maxLength={500}
                      />
                      {showFieldError('notes')}
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
                      disabled={!newEquipment.name || !newEquipment.category || saving}
                    >
                      {saving ? 'Saving...' : (editingItem ? 'Update Equipment' : 'Add Equipment')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded-none p-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
