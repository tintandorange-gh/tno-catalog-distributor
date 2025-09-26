"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Brand {
  _id: string
  name: string
}

interface SubBrand {
  _id: string
  name: string
  slug: string
  brandId: string
  brandName: string
}

interface SubBrandManagerProps {
  onUpdate: () => void
}

export default function SubBrandManager({ onUpdate }: SubBrandManagerProps) {
  const [subBrands, setSubBrands] = useState<SubBrand[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubBrand, setEditingSubBrand] = useState<SubBrand | null>(null)
  const [formData, setFormData] = useState({ name: "", brandId: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubBrands()
    fetchBrands()
  }, [])

  const fetchSubBrands = async () => {
    try {
      const response = await fetch("/api/admin/sub-brands")
      if (response.ok) {
        const data = await response.json()
        setSubBrands(data)
      }
    } catch (error) {
      console.error("Failed to fetch sub-brands:", error)
    }
  }

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
      const url = editingSubBrand ? `/api/admin/sub-brands/${editingSubBrand._id}` : "/api/admin/sub-brands"

      const method = editingSubBrand ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingSubBrand(null)
        setFormData({ name: "", brandId: "" })
        fetchSubBrands()
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to save sub-brand:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sub-brand?")) {
      try {
        const response = await fetch(`/api/admin/sub-brands/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchSubBrands()
          onUpdate()
        }
      } catch (error) {
        console.error("Failed to delete sub-brand:", error)
      }
    }
  }

  const openEditDialog = (subBrand: SubBrand) => {
    setEditingSubBrand(subBrand)
    setFormData({ name: subBrand.name, brandId: subBrand.brandId })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingSubBrand(null)
    setFormData({ name: "", brandId: "" })
    setIsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sub-Brand Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Sub-Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubBrand ? "Edit Sub-Brand" : "Add New Sub-Brand"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="brandId">Brand</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Sub-Brand Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingSubBrand ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subBrands.map((subBrand) => (
            <div key={subBrand._id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{subBrand.name}</span>
                <span className="text-sm text-gray-500 ml-2">({subBrand.brandName})</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => openEditDialog(subBrand)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(subBrand._id)}>
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
