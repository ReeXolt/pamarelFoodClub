"use client";
import { useState } from 'react';
import Head from 'next/head';

export default function StoreShippingSettings() {
  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const [shippingSettings, setShippingSettings] = useState({
    domesticShipping: true,
    internationalShipping: false,
    processingTime: '1-3',
    freeShippingThreshold: '',
    shippingRates: nigerianStates.reduce((acc, state) => {
      acc[state] = '';
      return acc;
    }, {})
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStateRateChange = (state, value) => {
    setShippingSettings(prev => ({
      ...prev,
      shippingRates: {
        ...prev.shippingRates,
        [state]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Shipping settings saved successfully!');
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>Shipping Settings | Admin Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="max-w-7xl mx-auto lg:px-8">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* General Settings Section */}
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">General Shipping Settings</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Domestic Shipping Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="domesticShipping"
                      name="domesticShipping"
                      type="checkbox"
                      checked={shippingSettings.domesticShipping}
                      onChange={handleInputChange}
                      className="focus:ring-yellow-500 h-4 w-4 text-yellow-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="domesticShipping" className="font-medium text-gray-700">
                      Domestic Shipping (Nigeria)
                    </label>
                    <p className="text-gray-500">Enable shipping within Nigeria</p>
                  </div>
                </div>

                {/* International Shipping Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="internationalShipping"
                      name="internationalShipping"
                      type="checkbox"
                      checked={shippingSettings.internationalShipping}
                      onChange={handleInputChange}
                      className="focus:ring-yellow-500 h-4 w-4 text-yellow-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="internationalShipping" className="font-medium text-gray-700">
                      International Shipping
                    </label>
                    <p className="text-gray-500">Enable worldwide shipping</p>
                  </div>
                </div>

                {/* Processing Time */}
                <div>
                  <label htmlFor="processingTime" className="block text-sm font-medium text-gray-700">
                    Processing Time
                  </label>
                  <select
                    id="processingTime"
                    name="processingTime"
                    value={shippingSettings.processingTime}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
                  >
                    <option value="1-3">1-3 business days</option>
                    <option value="3-5">3-5 business days</option>
                    <option value="5-7">5-7 business days</option>
                    <option value="7-14">7-14 business days</option>
                  </select>
                </div>

                {/* Free Shipping Threshold */}
                <div>
                  <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                    Free Shipping Threshold (₦)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="number"
                      name="freeShippingThreshold"
                      id="freeShippingThreshold"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={handleInputChange}
                      className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* State Rates Section */}
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium leading-6 text-gray-900">State Shipping Rates</h2>
                <span className="text-sm text-gray-500">Prices in Naira (₦)</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {nigerianStates.map((state) => (
                  <div key={state} className="col-span-1">
                    <label htmlFor={`rate-${state}`} className="block text-sm font-medium text-gray-700">
                      {state}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="number"
                        name={`rate-${state}`}
                        id={`rate-${state}`}
                        value={shippingSettings.shippingRates[state]}
                        onChange={(e) => handleStateRateChange(state, e.target.value)}
                        className="focus:ring-yellow-500 focus:border-yellow-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                Save Shipping Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}