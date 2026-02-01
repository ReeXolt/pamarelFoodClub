"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';
import { FaTrash, FaPlus, FaMinus, FaEdit, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const Quill = typeof window === 'object' ? require('quill') : () => false;

async function uploadImages(images) {
  const formData = new FormData();
  images.forEach(file => formData.append("images", file));

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Upload failed:", data.error || "Unknown error");
    throw new Error(data.error || "Upload failed");
  }

  return data.urls || [];
}

const ProductEditDashboard = () => {
  const router = useRouter();
  const { id } = useParams();


  // State management
  const [productName, setProductName] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [section, setSection] = useState('food');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isTopDeal, setIsTopDeal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [flashSale, setFlashSale] = useState({
    active: false,
    start: '',
    end: '',
    discountPercent: 0
  });
  const [category, setCategory] = useState({
    name: '',
    image: null,
    imagePreview: '',
    description: '',
    isNew: true
  });
  const [databaseCategories, setDatabaseCategories] = useState([]);
  const [description, setDescription] = useState('');
  const [productImages, setProductImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Variants state
  const [variants, setVariants] = useState([]);
  const [variantTypes, setVariantTypes] = useState([]);
  const [newVariantType, setNewVariantType] = useState('');
  const [newVariantValue, setNewVariantValue] = useState('');

  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/product/edit/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch product");
        }

        const product = data.product;

        // Set all the product data to state
        setProductName(product.name);
        setBasePrice(product.basePrice || 0);
        setSection(product.section);
        setTags(product.tags || []);
        setIsTopDeal(product.isTopDeal);
        setIsFeatured(product.isFeatured);
        
        if (product.flashSale) {
          setFlashSale({
            active: true,
            start: product.flashSale.start ? new Date(product.flashSale.start).toISOString().slice(0, 16) : '',
            end: product.flashSale.end ? new Date(product.flashSale.end).toISOString().slice(0, 16) : '',
            discountPercent: product.flashSale.discountPercent || 0
          });
        }

        setCategory({
          name: product.category?.name || '',
          image: null,
          imagePreview: product.category?.image?.url || '',
          description: product.category?.description || '',
          isNew: false
        });

        setDescription(product.description);
        setExistingImages(product.images?.map(img => img.url) || []);
        setSpecifications(product.specifications || []);

        // Set variants data
        setVariantTypes(product.variantTypes || []);
        setVariants(product.variants?.map(variant => ({
          ...variant,
          combination: variant.combination instanceof Map ? 
            Object.fromEntries(variant.combination) : 
            variant.combination,
          imagePreview: variant.image?.url || '',
          image: variant.image?.url ? { url: variant.image.url } : null
        })) || []);

        // Set Quill content if editor is ready
        if (quillInstance.current) {
          quillInstance.current.root.innerHTML = product.description;
        }

      } catch (error) {
        toast.error(error.message || "Error loading product");
        console.error("Error details:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/category");
        const data = await response.json();
        
        if (data.message) {
          const formattedCategories = data.message.map(cat => ({
            value: cat._id,
            label: cat.name,
            description: cat.description,
            image: cat.image?.url || ''
          }));
          setDatabaseCategories(formattedCategories);
        } else {
          throw new Error(data.message || "Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
    fetchProductData();
  }, [id]);

  // Initialize Quill editor
  useEffect(() => {
    const loadQuill = async () => {
      const Quill = (await import('quill')).default;

      if (editorRef.current && !quillInstance.current) {
        quillInstance.current = new Quill(editorRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['image', 'video', 'blockquote', 'code-block'],
              ['clean'],
            ],
          },
        });

        quillInstance.current.on('text-change', () => {
          const currentContent = quillInstance.current.root.innerHTML;
          setDescription(currentContent);
        });

        // Set initial content if it's already loaded
        if (description && initialLoad) {
          quillInstance.current.root.innerHTML = description;
        }
      }
    };

    if (typeof window !== 'undefined') {
      loadQuill();
    }
  }, [description, initialLoad]);

  // Generate variants when variant types change
  useEffect(() => {
    if (variantTypes.length > 0) {
      generateVariants();
    } else {
      setVariants([]);
    }
  }, [variantTypes]);

  const generateVariants = () => {
    if (variantTypes.length === 0) return;

    const generateCombinations = (types, index = 0, current = {}) => {
      if (index === types.length) {
        return [current];
      }

      const type = types[index];
      const combinations = [];

      type.values.forEach(value => {
        const newCurrent = { ...current, [type.name]: value };
        combinations.push(...generateCombinations(types, index + 1, newCurrent));
      });

      return combinations;
    };

    const combinations = generateCombinations(variantTypes);
    const newVariants = combinations.map(combination => {
      // Check if variant already exists
      const existingVariant = variants.find(variant => 
        JSON.stringify(variant.combination) === JSON.stringify(combination)
      );

      if (existingVariant) {
        return existingVariant;
      }

      return {
        combination,
        price: basePrice,
        stock: 0,
        sku: generateSKU(combination),
        image: null,
        imagePreview: ''
      };
    });

    setVariants(newVariants);
  };

  const generateSKU = (combination) => {
    const combinationString = Object.values(combination).join('-').toUpperCase();
    return `${productName.substring(0, 3).toUpperCase()}-${combinationString}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  };

  // Handle variant image upload
  const handleVariantImageDrop = useCallback((acceptedFiles, variantIndex) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...updatedVariants[variantIndex],
        image: file,
        imagePreview: URL.createObjectURL(file)
      };
      setVariants(updatedVariants);
    }
  }, [variants]);

  // Create dropzone for variant images
  const useVariantImageDropzone = (variantIndex) => {
    return useDropzone({
      onDrop: (acceptedFiles) => handleVariantImageDrop(acceptedFiles, variantIndex),
      accept: 'image/*',
      multiple: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!productName) {
      toast.error("Product Name is required");
      setLoading(false);
      return;
    } else if (!description) {
      toast.error("Description is required");
      setLoading(false);
      return;
    } else if (!category.name) {
      toast.error("Category is required");
      setLoading(false);
      return;
    } else if (category.isNew && !category.image) {
      toast.error("Category image is required for new categories");
      setLoading(false);
      return;
    } else if (category.isNew && category.description.length > 50) {
      toast.error("Category description must be 50 characters or less");
      setLoading(false);
      return;
    } else if (existingImages.length + productImages.length < 1) {
      toast.error("Product images are required");
      setLoading(false);
      return;
    } else if (basePrice < 0) {
      toast.error("Base price must be a positive number");
      setLoading(false);
      return;
    } else if (flashSale.active && (!flashSale.start || !flashSale.end)) {
      toast.error("Flash sale requires both start and end dates");
      setLoading(false);
      return;
    } else if (variants.length > 0 && variants.some(v => v.stock < 0)) {
      toast.error("All variant stocks must be positive numbers");
      setLoading(false);
      return;
    } else if (variants.length > 0 && variants.some(v => v.price < 0)) {
      toast.error("All variant prices must be positive numbers");
      setLoading(false);
      return;
    }

    try {
      // Upload new product images if any
      let productImageUrls = [...existingImages];
      if (productImages.length > 0) {
        const uploadedUrls = await uploadImages(productImages);
        productImageUrls = [...productImageUrls, ...uploadedUrls];
      }
      
      // Upload variant images
      const variantsWithImages = await Promise.all(
        variants.map(async (variant) => {
          if (variant.image && typeof variant.image === 'object' && variant.image instanceof File) {
            const variantImageUrls = await uploadImages([variant.image]);
            return {
              ...variant,
              image: variantImageUrls[0]
            };
          }
          // If variant image is already a URL (existing image), keep it
          if (variant.image && typeof variant.image === 'object' && variant.image.url) {
            return {
              ...variant,
              image: variant.image.url
            };
          }
          return variant;
        })
      );
      
      // For new categories, upload category image
      let categoryImageUrl = '';
      if (category.isNew) {
        const categoryImageUrls = await uploadImages([category.image]);
        categoryImageUrl = categoryImageUrls[0];
      } else {
        // Use existing category image
        categoryImageUrl = category.imagePreview;
      }

      const payload = {
        product: {
          name: productName,
          description: description,
          images: productImageUrls,
          specifications: specifications.filter(spec => spec.key && spec.value),
          basePrice: parseFloat(basePrice),
          section: section,
          tags: tags,
          isTopDeal: isTopDeal,
          isFeatured: isFeatured,
          flashSale: flashSale.active ? {
            start: new Date(flashSale.start),
            end: new Date(flashSale.end),
            discountPercent: parseFloat(flashSale.discountPercent)
          } : null,
          variantTypes: variantTypes,
          variants: variantsWithImages.map(variant => ({
            combination: variant.combination,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock),
            sku: variant.sku,
            image: variant.image
          }))
        },
        category: {
          name: category.name,
          description: category.description,
          image: categoryImageUrl,
          isNew: category.isNew
        }
      };

      const response = await fetch(`/api/product/edit/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      toast.success("Product updated successfully!");
      router.push('/admin/products');
      
    } catch (error) {
      toast.error(error.message || "Error updating product");
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle product image upload
  const onDrop = (acceptedFiles) => {
    if (existingImages.length + productImages.length + acceptedFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setProductImages([...productImages, ...acceptedFiles]);
  };

  // Handle category image upload
  const onCategoryImageDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setCategory({
        ...category,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  const { getRootProps: getCategoryImageRootProps, getInputProps: getCategoryImageInputProps } = useDropzone({
    onDrop: onCategoryImageDrop,
    accept: 'image/*',
    multiple: false
  });

  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
    
    const updatedImages = [...productImages];
    updatedImages.splice(index, 1);
    setProductImages(updatedImages);
  };

  const removeExistingImage = (index) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
  };

  const removeCategoryImage = () => {
    setCategory({
      ...category,
      image: null,
      imagePreview: ''
    });
  };

  const removeVariantImage = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      image: null,
      imagePreview: ''
    };
    setVariants(updatedVariants);
  };

  // Delete variant
  const deleteVariant = (variantIndex) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(variantIndex, 1);
    setVariants(updatedVariants);
  };

  // Variant type management
  const addVariantType = () => {
    if (newVariantType.trim() && !variantTypes.find(vt => vt.name === newVariantType.trim())) {
      setVariantTypes([...variantTypes, { name: newVariantType.trim(), values: [] }]);
      setNewVariantType('');
    }
  };

  const removeVariantType = (typeIndex) => {
    const updatedTypes = [...variantTypes];
    updatedTypes.splice(typeIndex, 1);
    setVariantTypes(updatedTypes);
  };

  const addVariantValue = (typeIndex) => {
    if (newVariantValue.trim() && !variantTypes[typeIndex].values.includes(newVariantValue.trim())) {
      const updatedTypes = [...variantTypes];
      updatedTypes[typeIndex].values.push(newVariantValue.trim());
      setVariantTypes(updatedTypes);
      setNewVariantValue('');
    }
  };

  const removeVariantValue = (typeIndex, valueIndex) => {
    const updatedTypes = [...variantTypes];
    updatedTypes[typeIndex].values.splice(valueIndex, 1);
    setVariantTypes(updatedTypes);
  };

  // Variant management
  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    
    // Regenerate SKU if product name or combination changes
    if (field === 'combination' || (field === 'price' && index === 0)) {
      updatedVariants[index].sku = generateSKU(updatedVariants[index].combination);
    }
    
    setVariants(updatedVariants);
  };

  // Update base price and all variants when base price changes
  useEffect(() => {
    if (variants.length > 0) {
      const updatedVariants = variants.map(variant => ({
        ...variant,
        price: basePrice
      }));
      setVariants(updatedVariants);
    }
  }, [basePrice]);

  // Specifications management
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...specifications];
    updatedSpecs.splice(index, 1);
    setSpecifications(updatedSpecs);
  };

  const updateSpecification = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  // Tags management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  // Create a component for variant image upload to fix hooks order issue
  const VariantImageUpload = ({ variant, variantIndex }) => {
    const { getRootProps: getVariantImageRootProps, getInputProps: getVariantImageInputProps } = useVariantImageDropzone(variantIndex);
    
    return (
      <div className="md:col-span-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">Variant Image</label>
        {variant.imagePreview ? (
          <div className="relative w-20 h-20">
            <img 
              src={variant.imagePreview} 
              alt="Variant preview" 
              className="w-full h-full object-cover rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={() => removeVariantImage(variantIndex)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div 
            {...getVariantImageRootProps()} 
            className="border border-dashed border-gray-300 rounded-md p-2 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
          >
            <input {...getVariantImageInputProps()} />
            <p className="text-xs text-gray-500">Click to upload</p>
          </div>
        )}
      </div>
    );
  };

  if (initialLoad) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link href="/admin/products" className="mr-4 text-yellow-600 hover:text-yellow-700">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price*</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section*</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="food">Food</option>
                <option value="gadget">Gadget</option>
              </select>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Variants</h3>
          
          {/* Variant Types */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3 text-gray-700">Variant Types</h4>
            <div className="space-y-3">
              {variantTypes.map((type, typeIndex) => (
                <div key={typeIndex} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">{type.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVariantType(typeIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      value={newVariantValue}
                      onChange={(e) => setNewVariantValue(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                      placeholder={`Add ${type.name} value`}
                    />
                    <button
                      type="button"
                      onClick={() => addVariantValue(typeIndex)}
                      className="ml-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                    >
                      Add Value
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {type.values.map((value, valueIndex) => (
                      <span key={valueIndex} className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm">
                        {value}
                        <button
                          type="button"
                          onClick={() => removeVariantValue(typeIndex, valueIndex)}
                          className="ml-2 text-gray-600 hover:text-red-500"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={newVariantType}
                onChange={(e) => setNewVariantType(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                placeholder="Add variant type (e.g., Color, Size, Storage)"
              />
              <button
                type="button"
                onClick={addVariantType}
                className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Type
              </button>
            </div>
          </div>

          {/* Generated Variants */}
          {variants.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-3 text-gray-700">Generated Variants ({variants.length})</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white relative">
                    {/* Delete Variant Button */}
                    <button
                      type="button"
                      onClick={() => deleteVariant(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                      title="Delete this variant"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Variant Info */}
                      <div className="md:col-span-4">
                        <div className="mb-2">
                          <strong className="text-sm text-gray-700">Combination:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(variant.combination).map(([key, value]) => (
                              <span key={key} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>SKU: {variant.sku}</div>
                        </div>
                      </div>

                      {/* Price and Stock */}
                      <div className="md:col-span-3">
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Price*</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Stock*</label>
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Variant Image */}
                      <VariantImageUpload variant={variant} variantIndex={index} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Section - Simplified to text input */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Category Information</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name*</label>
            <input
              type="text"
              value={category.name}
              onChange={(e) => setCategory({
                ...category,
                name: e.target.value,
                isNew: true // Always treat as new category with text input
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter category name"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the category name. If it doesn't exist, a new category will be created.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Description (max 50 chars)*
                <span className="text-xs text-gray-500 ml-1">
                  {category.description.length}/50
                </span>
              </label>
              <input
                type="text"
                value={category.description}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setCategory({...category, description: e.target.value})
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
                required
                placeholder="Brief description of the category"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Image*</label>
            {category.imagePreview ? (
              <div className="relative w-32 h-32">
                <img 
                  src={category.imagePreview} 
                  alt="Category preview" 
                  className="w-full h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeCategoryImage}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div 
                {...getCategoryImageRootProps()} 
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
              >
                <input {...getCategoryImageInputProps()} />
                <p className="text-gray-600">Click to upload category image</p>
                <p className="text-sm text-gray-500 mt-1">Single image required</p>
              </div>
            )}
          </div>
        </div>

        {/* Product Images Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Images*</h3>
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">Drag 'n' drop images here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-1">Minimum 1 image required (Max 10 images)</p>
          </div>
          
          {(existingImages.length > 0 || imagePreviews.length > 0) && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingImages.map((src, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img 
                    src={src} 
                    alt={`Existing preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
              
              {imagePreviews.map((src, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img 
                    src={src} 
                    alt={`New preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {existingImages.length + index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Description*</h3>
          <div 
            ref={editorRef} 
            className="h-64 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-blue-500"
          />
        </div>

        {/* Tags Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Product Tags</h3>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-gray-600 hover:text-red-500"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No tags added yet</p>
          )}
        </div>

        {/* Promotional Options Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Promotional Options</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTopDeal"
                checked={isTopDeal}
                onChange={(e) => setIsTopDeal(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isTopDeal" className="ml-2 block text-sm text-gray-700">
                Mark as Top Deal
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                Mark as Featured Product
              </label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="flashSale"
                  checked={flashSale.active}
                  onChange={(e) => setFlashSale({...flashSale, active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flashSale" className="ml-2 block text-sm text-gray-700">
                  Enable Flash Sale
                </label>
              </div>
              
              {flashSale.active && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                    <input
                      type="datetime-local"
                      value={flashSale.start}
                      onChange={(e) => setFlashSale({...flashSale, start: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                    <input
                      type="datetime-local"
                      value={flashSale.end}
                      onChange={(e) => setFlashSale({...flashSale, end: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %*</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={flashSale.discountPercent}
                      onChange={(e) => setFlashSale({...flashSale, discountPercent: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={flashSale.active}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Specifications</h3>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              <FaPlus className="mr-1" /> Add Specification
            </button>
          </div>

          {specifications.length > 0 ? (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Key</label>
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g. Material"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g. Cotton"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="w-full py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No specifications added yet</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
      <Toaster position="top-center" />
    </div>
  );
};

export default ProductEditDashboard;