"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Minus,
  Image as ImageIcon,
  Tag,
  Star,
  Clock,
  DollarSign,
  Package,
  Hash,
  ChevronDown,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

export default function UploadNewProduct() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    section: '',
    category: '',
    price: '',
    images: [],
    variants: [],
    stock: '',
    featured: false,
    flashSale: {
      active: false,
      discountPercentage: '',
      startDate: '',
      endDate: ''
    },
    tags: []
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [currentVariant, setCurrentVariant] = useState({ name: '', options: [] });
  const [currentOption, setCurrentOption] = useState('');
  const [Productdiscount, setProductDiscout] = useState(0)
  const [newCategory, setNewCategory] = useState({
    name: '',
    image: null,
    imagePreview: ''
  });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Enhanced image upload states
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const categoryFileInputRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced image upload handler
  const handleImageUpload = async (files, type = 'product') => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const newErrors = {};


    // Client-side validation
    fileArray.forEach((file, index) => {
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const maxFileSize = 10 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        newErrors[file.name] = `File type not allowed: ${file.type}`;
        return;
      }

      if (file.size > maxFileSize) {
        newErrors[file.name] = `File too large (max 10MB)`;
        return;
      }

      validFiles.push(file);
    });

    if (Object.keys(newErrors).length > 0) {
      setUploadErrors(prev => ({ ...prev, ...newErrors }));
      setTimeout(() => {
        setUploadErrors(prev => {
          const updated = { ...prev };
          Object.keys(newErrors).forEach(key => delete updated[key]);
          return updated;
        });
      }, 5000);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises = validFiles.map(file => uploadSingleFile(file, type));
    
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      
      if (type === 'product') {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...successfulUploads.map(result => result.url)]
        }));
      } else if (type === 'category') {
        if (successfulUploads.length > 0) {
          setNewCategory(prev => ({
            ...prev,
            image: successfulUploads[0].url,
            imagePreview: successfulUploads[0].url
          }));
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);
    }
  };

  const uploadSingleFile = async (file, type) => {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('files', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({ success: true, url: response.message[0] });
        } else {
          const error = `Upload failed: ${xhr.statusText}`;
          setUploadErrors(prev => ({ ...prev, [file.name]: error }));
          resolve({ success: false, error });
        }
      });

      xhr.addEventListener('error', () => {
        const error = 'Upload failed: Network error';
        setUploadErrors(prev => ({ ...prev, [file.name]: error }));
        resolve({ success: false, error });
      });

      xhr.open('POST', '/api/image-upload');
      xhr.send(formData);
    });
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e, type = 'product') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files, type);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCategoryImageUpload = (files) => {
    handleImageUpload(files, 'category');
  };

  const removeCategoryImage = () => {
    setNewCategory(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  // Update the createNewCategory function in your UploadNewProduct component
  const createNewCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.image) {
      alert('Please provide both category name and image');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.name,
          image: newCategory.image
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add new category to the list and select it
        const updatedCategories = [...categories, data.category];
        setCategories(updatedCategories);
        setFormData(prev => ({ ...prev, category: data.category._id }));
        setNewCategory({ name: '', image: null, imagePreview: '' });
        setShowNewCategory(false);
        setCategoryDropdownOpen(false);
        
        // Show success message
        alert('Category created successfully!');
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('An error occurred while creating the category');
    } finally {
      setLoading(false);
    }
  };

  // Rest of the functions remain the same...
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    if (currentVariant.name.trim() && currentVariant.options.length > 0) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...currentVariant }]
      }));
      setCurrentVariant({ name: '', options: [] });
    }
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addOption = () => {
    if (currentOption.trim() && !currentVariant.options.includes(currentOption.trim())) {
      setCurrentVariant(prev => ({
        ...prev,
        options: [...prev.options, currentOption.trim()]
      }));
      setCurrentOption('');
    }
  };

  const removeOption = (index) => {
    setCurrentVariant(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // Update the handleSubmit function in your UploadNewProduct component
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate category is selected
    if (!formData.category) {
      alert('Please select a category');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.section || !formData.price || formData.images.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Prepare the data for API
      const productData = {
        name: formData.name,
        description: formData.description,
        section: formData.section,
        discountPercentage: Productdiscount,
        category: formData.category, // This should now have the correct category ID
        price: formData.price,
        images: formData.images,
        stock: formData.stock || 0,
        featured: formData.featured,
        tags: formData.tags,
        variants: formData.variants,
        flashSale: formData.flashSale.active ? {
          active: true,
          discountPercentage: formData.flashSale.discountPercentage,
          startDate: formData.flashSale.startDate,
          endDate: formData.flashSale.endDate
        } : { active: false }
      };

      const response = await fetch('/api/product/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product uploaded successfully!');
        // Reset form
        setFormData({
          name: '',
          description: '',
          section: '',
          category: '',
          price: '',
          images: [],
          variants: [],
          stock: '',
          featured: false,
          flashSale: {
            active: false,
            discountPercentage: '',
            startDate: '',
            endDate: ''
          },
          tags: []
        });
        setProductDiscout(0)
      } else {
        alert(data.error || 'Failed to upload product');
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      alert('An error occurred while uploading the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Upload className="w-8 h-8 text-yellow-500" />
          Upload New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section - Same as before */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  required
                  value={formData.section}
                  onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select Section</option>
                  <option value="food">Food</option>
                  <option value="gadget">Gadget</option>
                </select>
              </div>
              

              {/* Category Selection - Same as before */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                
                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {formData.category ? (
                        <>
                          <FolderOpen className="w-4 h-4 text-yellow-500" />
                          {categories.find(cat => cat._id === formData.category)?.name || 'Selected Category'}
                        </>
                      ) : (
                        'Select a category'
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {categoryDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {loading ? (
                        <div className="px-3 py-2 text-gray-500">Loading categories...</div>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: category._id }));
                              setCategoryDropdownOpen(false);
                              setShowNewCategory(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-yellow-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                          >
                            {category.image && (
                              <img 
                                src={category.image} 
                                alt="" 
                                className="w-6 h-6 object-cover rounded" 
                              />
                            )}
                            <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span className="truncate">{category.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No categories found</div>
                      )}
                      
                      <div className="border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCategory(true);
                            setCategoryDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-yellow-50 flex items-center gap-2 text-yellow-600 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Create New Category
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show selected category info */}
                {formData.category && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700">
                      Selected: {categories.find(cat => cat._id === formData.category)?.name}
                    </span>
                  </div>
                )}

                {/* New Category Form */}
                {showNewCategory && (
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 mt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-yellow-500" />
                      Create New Category
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                          placeholder="Enter category name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category Image *
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCategoryImageUpload(e.target.files)}
                            className="hidden"
                            id="category-image-upload"
                            ref={categoryFileInputRef}
                          />
                          
                          {newCategory.imagePreview ? (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={newCategory.imagePreview}
                                  alt="Category preview"
                                  className="w-20 h-20 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={removeCategoryImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-sm text-green-600 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Image ready
                              </span>
                            </div>
                          ) : (
                            <label
                              htmlFor="category-image-upload"
                              className="cursor-pointer flex items-center gap-2 text-yellow-600 hover:text-yellow-700 border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center hover:bg-yellow-25 transition-colors"
                            >
                              <Upload className="w-6 h-6" />
                              <div className="text-left">
                                <p className="font-medium">Upload Category Image</p>
                                <p className="text-sm text-gray-500">PNG, JPG, JPEG, WEBP up to 10MB</p>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        onClick={createNewCategory}
                        disabled={!newCategory.name.trim() || !newCategory.image || loading}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating...
                          </span>
                        ) : (
                          'Create Category'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategory({ name: '', image: null, imagePreview: '' });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage Off
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    value={Productdiscount}
                    onChange={(e) => setProductDiscout(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>
          </div>

          {/* Enhanced Professional Image Upload Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Product Images *
            </h2>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-yellow-400 bg-yellow-50' 
                  : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-25'
              } ${isUploading ? 'opacity-50' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, 'product')}
            >
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => handleImageUpload(e.target.files, 'product')}
                className="hidden"
                id="image-upload"
                ref={fileInputRef}
                disabled={isUploading}
              />
              
              <div className="max-w-md mx-auto">
                <div className="flex justify-center mb-4">
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {isUploading ? 'Uploading...' : 'Drag & drop your images here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG, WEBP up to 10MB each
                  </p>
                  <p className="text-xs text-gray-400">
                    {formData.images.length > 0 
                      ? `${formData.images.length} image${formData.images.length > 1 ? 's' : ''} uploaded`
                      : 'No images uploaded yet'
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-4 px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Browse Files'}
                </button>
              </div>
            </div>

            {/* Upload Progress and Errors */}
            <div className="space-y-3">
              {/* Active Uploads */}
              {Object.keys(uploadProgress).map(filename => (
                <div key={filename} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{filename}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[filename]}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {uploadProgress[filename]}%
                  </span>
                </div>
              ))}

              {/* Upload Errors */}
              {Object.keys(uploadErrors).map(filename => (
                <div key={filename} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">{filename}</p>
                    <p className="text-sm text-red-700">{uploadErrors[filename]}</p>
                  </div>
                  <button
                    onClick={() => setUploadErrors(prev => {
                      const updated = { ...prev };
                      delete updated[filename];
                      return updated;
                    })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Image Gallery */}
            {formData.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Uploaded Images ({formData.images.length})
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                        <img
                          src={image}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-blur bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rest of the form sections remain the same */}
          {/* Variants Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
              Product Variants
            </h2>

            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={currentVariant.name}
                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="e.g., Color, Size"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Option
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentOption}
                      onChange={(e) => setCurrentOption(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="e.g., Red, Large"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Variant Options */}
              {currentVariant.options.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {currentVariant.options.map((option, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addVariant}
                disabled={!currentVariant.name || currentVariant.options.length === 0}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Add Variant
              </button>

              {/* Added Variants */}
              {formData.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Added Variants
                  </label>
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{variant.name}:</span>
                        <span className="text-gray-600 ml-2">
                          {variant.options.join(', ')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Product Tags
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tags List */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Flash Sale Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Flash Sale Settings
            </h2>

            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flashSale"
                  checked={formData.flashSale.active}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    flashSale: { ...prev.flashSale, active: e.target.checked }
                  }))}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="flashSale" className="text-sm font-medium text-gray-700">
                  Enable Flash Sale
                </label>
              </div>

              {formData.flashSale.active && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Percentage
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.flashSale.discountPercentage}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          flashSale: { ...prev.flashSale, discountPercentage: e.target.value }
                        }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="0-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.flashSale.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { ...prev.flashSale, startDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.flashSale.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { ...prev.flashSale, endDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Featured Product */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4 text-yellow-500 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Mark as Featured Product
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              className="px-8 py-3 bg-yellow-500 text-white font-medium rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              Upload Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}