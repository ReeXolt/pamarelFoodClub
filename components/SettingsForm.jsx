"use client"
import { useState } from 'react'

export default function SettingsForm({ initialValues }) {
  const [formData, setFormData] = useState(initialValues)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Settings saved successfully!')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="text-md font-medium mb-4">Payout Information</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="payoutMethod" className="block text-sm font-medium text-gray-700">
              Payout Method
            </label>
            <select
              id="payoutMethod"
              name="payoutMethod"
              value={formData.payoutMethod}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
            >
              <option value="bank">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Crypto Wallet</option>
            </select>
          </div>
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
              Bank Name
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700">
              Account Name
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium mb-4">Notification Settings</h4>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="notificationEnabled"
              name="notificationEnabled"
              type="checkbox"
              checked={formData.notificationEnabled}
              onChange={handleChange}
              className="focus:ring-yellow-500 h-4 w-4 text-yellow-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="notificationEnabled" className="font-medium text-gray-700">
              Email Notifications
            </label>
            <p className="text-gray-500">Receive email notifications about your affiliate activity</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}