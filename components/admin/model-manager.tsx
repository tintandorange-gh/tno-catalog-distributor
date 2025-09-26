"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Brand {
  _id: string
  name: string
}

interface SubBrand {
  _id: string
  name: string
  brandId: string
}

interface Model {
  _id: string
  name: string
  slug: string
  description?: string
  subBrandId: string
  subBrandName: string
  brandName: string
  images: string[]
}

interface ModelManagerProps {
  onUpdate: () => void
}

export default function ModelManager({ onUpdate }: ModelManagerProps) {
  const [models, setModels] = useState<Model[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [subBrands, setSubBrands] = useState<SubBrand[]>([])
  const [filteredSubBrands, setFilteredSubBrands] = useState<SubBrand[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brandId: "",
    subBrandId: "",
    images: [] as File[],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchModels()
    fetchBrands()
    fetchSubBrands()
  }, [])

  useEffect(() => {
    if (formData.brandId) {
      setFilteredSubBrands(subBrands.filter((sb) => sb.brandId === formData.brandId))
    } else {
      setFilteredSubBrands([])
    }
  }, [formData.brandId, subBrands])

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/admin/models")
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("subBrandId", formData.subBrandId)

      formData.images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      const url = editingModel ? `/api/admin/models/${editingModel._id}` : "/api/admin/models"

      const method = editingModel ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingModel(null)
        setFormData({ name: "", description: "", brandId: "", subBrandId: "", images: [] })
        fetchModels()
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to save model:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this model?")) {
      try {
        const response = await fetch(`/api/admin/models/${id}`, {
          method: "DELETE",
        })
        if (response.ok) {
          fetchModels()
          onUpdate()
        }
      } catch (error) {
        console.error("Failed to delete model:", error)
      }
    }
  }

  const openEditDialog = (model: Model) => {
    const subBrand = subBrands.find((sb) => sb._id === model.subBrandId)
    setEditingModel(model)
    setFormData({
      name: model.name,
      description: model.description || "",
      brandId: subBrand?.brandId || "",
      subBrandId: model.subBrandId,
      images: [],
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingModel(null)
    setFormData({ name: "", description: "", brandId: "", subBrandId: "", images: [] })
    setIsDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) })
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Model Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingModel ? "Edit Model" : "Add New Model"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="brandId">Brand</Label>
                <Select
                  value={formData.brandId}
                  onValueChange={(value) => setFormData({ ...formData, brandId: value, subBrandId: "" })}
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
                <Label htmlFor="subBrandId">Sub-Brand</Label>
                <Select
                  value={formData.subBrandId}
                  onValueChange={(value) => setFormData({ ...formData, subBrandId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubBrands.map((subBrand) => (
                      <SelectItem key={subBrand._id} value={subBrand._id}>
                        {subBrand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="images">Images</Label>
                <Input id="images" type="file" accept="image/*" multiple onChange={handleImageChange} />
                {formData.images.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{image.name}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => removeImage(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingModel ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{model.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({model.brandName} - {model.subBrandName})
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(model)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(model._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {model.description && <p className="text-sm text-gray-600 mb-2">{model.description}</p>}
              <div className="text-sm text-gray-500">Images: {model.images.length}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
