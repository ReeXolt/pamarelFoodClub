"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"
import { Country, State, City } from 'country-state-city'

export default function AdminShippingPage() {
  const [shippingRates, setShippingRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    standard: '',
    express: '',
    isDefault: false
  })
  const [isAdding, setIsAdding] = useState(false)

  const nigeriaStates = State.getStatesOfCountry('NG')
  const selectedStateCities = formData.state ? City.getCitiesOfState('NG', formData.state) : []

  useEffect(() => {
    fetchShippingRates()
  }, [])

  const fetchShippingRates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/shipping-rates')
      if (response.ok) {
        const data = await response.json()
        setShippingRates(data.rates)
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error)
      toast.error('Failed to load shipping rates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.standard || !formData.express) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const url = editingId ? `/api/admin/shipping-rates/${editingId}` : '/api/admin/shipping-rates'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          city: formData.city === "__all__" ? "" : formData.city,
          standard: parseFloat(formData.standard),
          express: parseFloat(formData.express)
        })
      })

      if (response.ok) {
        toast.success(editingId ? 'Shipping rate updated' : 'Shipping rate added')
        resetForm()
        fetchShippingRates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save shipping rate')
      }
    } catch (error) {
      console.error('Error saving shipping rate:', error)
      toast.error('Failed to save shipping rate')
    }
  }

  const handleEdit = (rate) => {
    setEditingId(rate._id)
    setFormData({
      state: rate.state || '',
      city: rate.city || '',
      standard: rate.standard.toString(),
      express: rate.express.toString(),
      isDefault: rate.isDefault || false
    })
    setIsAdding(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return

    try {
      const response = await fetch(`/api/admin/shipping-rates/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Shipping rate deleted')
        fetchShippingRates()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete shipping rate')
      }
    } catch (error) {
      console.error('Error deleting shipping rate:', error)
      toast.error('Failed to delete shipping rate')
    }
  }

  const resetForm = () => {
    setFormData({
      state: '',
      city: '',
      standard: '',
      express: '',
      isDefault: false
    })
    setEditingId(null)
    setIsAdding(false)
  }

  const startAdding = () => {
    resetForm()
    setIsAdding(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Shipping Rates Management</h1>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipping Rates Management</h1>
        <Button onClick={startAdding} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Shipping Rate
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}</CardTitle>
            <CardDescription>
              {formData.isDefault 
                ? 'This will be used as the default rate for all locations without specific rates'
                : 'Set shipping rates for specific locations'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isDefault: e.target.checked,
                    state: '',
                    city: ''
                  }))}
                  className="w-4 h-4"
                />
                <Label htmlFor="isDefault">Set as default rate</Label>
              </div>

              {!formData.isDefault && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, state: value, city: '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {nigeriaStates.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City (Optional)</Label>
                    <Select 
                      value={formData.city || "__all__"} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city: value === "__all__" ? "" : value }))}
                      disabled={!formData.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All cities in state</SelectItem>
                        {selectedStateCities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standard">Standard Delivery Price (₦)</Label>
                  <Input
                    id="standard"
                    type="number"
                    placeholder="0.00"
                    value={formData.standard}
                    onChange={(e) => setFormData(prev => ({ ...prev, standard: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="express">Express Delivery Price (₦)</Label>
                  <Input
                    id="express"
                    type="number"
                    placeholder="0.00"
                    value={formData.express}
                    onChange={(e) => setFormData(prev => ({ ...prev, express: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Add'} Rate
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Shipping Rates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Rates</CardTitle>
          <CardDescription>
            Manage shipping rates for different locations. More specific rates (city-level) override state-level rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Standard Delivery</TableHead>
                <TableHead>Express Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingRates.map((rate) => (
                <TableRow key={rate._id}>
                  <TableCell>
                    {rate.isDefault ? (
                      <span className="font-medium">Default Rate</span>
                    ) : (
                      <div>
                        <div className="font-medium">{rate.state}</div>
                        {rate.city && <div className="text-sm text-gray-500">{rate.city}</div>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>₦{rate.standard.toLocaleString()}</TableCell>
                  <TableCell>₦{rate.express.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={rate.active ? "default" : "secondary"}>
                      {rate.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rate)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!rate.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(rate._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
