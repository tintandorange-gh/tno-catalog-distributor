"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Brand {
  _id: string
  name: string
  slug: string
  logo?: string
}

interface BrandManagerProps {
  onUpdate: () => void
}

export default function BrandManager({ onUpdate }: BrandManagerProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({ name: "", logo: null as File | null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands")
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      if (formData.logo) {
        formDataToSend.append("logo", formData.logo)
      }

      const url = editingBrand ? `/api/admin/brands/${editingBrand._id}` : "/api/admin/brands"

      const method = editingBrand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingBrand(null)
        setFormData({ name: "", logo: null })
        fetchBrands()
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to save brand:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      try {
        const response = await fetch(`/api/admin/brands/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchBrands()
          onUpdate()
        }
      } catch (error) {
        console.error("Failed to delete brand:", error)
      }
    }
  }

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({ name: brand.name, logo: null })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingBrand(null)
    setFormData({ name: "", logo: null })
    setIsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Brand Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo Image</Label>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingBrand ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((brand) => (
            <div key={brand._id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {brand.logo && (
                  <img src={brand.logo || "/placeholder.svg"} alt={brand.name} className="w-8 h-8 object-contain" />
                )}
                <span className="font-medium">{brand.name}</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(brand)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(brand._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
