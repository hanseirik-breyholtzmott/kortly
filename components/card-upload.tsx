"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { usePokemonCards } from "@/hooks/use-pokemon-cards"
import { Upload, X, Plus, Camera } from "lucide-react"

interface CardForm {
  name: string
  type: string
  rarity: string
  set: string
  cardNumber: string
  condition: string
  description: string
  frontImage: File | null
  backImage: File | null
  damageImages: File[]
  quantity: number
  isGraded: boolean
  gradeCompany: string
  gradeScore: string
  forSale: boolean
}

type PhotoType = "front" | "back" | "damage"

const POKEMON_TYPES = [
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Psychic",
  "Ice",
  "Dragon",
  "Dark",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Bug",
  "Rock",
  "Ghost",
  "Steel",
  "Fairy",
  "Normal",
]

const RARITIES = ["Common", "Uncommon", "Rare", "Rare Holo", "Ultra Rare", "Secret Rare"]
const CONDITIONS = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Poor"]

export default function CardUpload() {
  const { user } = useAuth()
  const { addCard } = usePokemonCards()
  const [form, setForm] = useState<CardForm>({
    name: "",
    type: "",
    rarity: "",
    set: "",
    cardNumber: "",
    condition: "",
    description: "",
    frontImage: null,
    backImage: null,
    damageImages: [],
    quantity: 1,
    isGraded: false,
    gradeCompany: "",
    gradeScore: "",
    forSale: false,
  })
  const [imagePreviews, setImagePreviews] = useState<{
    front: string | null
    back: string | null
    damage: string[]
  }>({
    front: null,
    back: null,
    damage: [],
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, photoType: PhotoType) => {
    const files = e.target.files
    if (!files) return

    if (photoType === "damage") {
      // Handle multiple damage photos
      const newDamageFiles = Array.from(files)
      const updatedDamageImages = [...form.damageImages, ...newDamageFiles]
      setForm({ ...form, damageImages: updatedDamageImages })

      // Create previews for damage images
      const newPreviews: string[] = []
      newDamageFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          newPreviews.push(result)
          if (newPreviews.length === newDamageFiles.length) {
            setImagePreviews((prev) => ({
              ...prev,
              damage: [...prev.damage, ...newPreviews],
            }))
          }
        }
        reader.readAsDataURL(file)
      })
    } else {
      // Handle single front/back photos
      const file = files[0]
      if (photoType === "front") {
        setForm({ ...form, frontImage: file })
      } else {
        setForm({ ...form, backImage: file })
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreviews((prev) => ({
          ...prev,
          [photoType]: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (photoType: PhotoType, index?: number) => {
    if (photoType === "damage" && typeof index === "number") {
      const updatedDamageImages = form.damageImages.filter((_, i) => i !== index)
      const updatedDamagePreviews = imagePreviews.damage.filter((_, i) => i !== index)
      setForm({ ...form, damageImages: updatedDamageImages })
      setImagePreviews((prev) => ({ ...prev, damage: updatedDamagePreviews }))
    } else {
      if (photoType === "front") {
        setForm({ ...form, frontImage: null })
      } else {
        setForm({ ...form, backImage: null })
      }
      setImagePreviews((prev) => ({ ...prev, [photoType]: null }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsUploading(true)

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newCard = {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      rarity: form.rarity,
      set: form.set,
      cardNumber: form.cardNumber,
      condition: form.condition,
      description: form.description,
      photos: {
        front:
          imagePreviews.front ||
          `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(form.name + " pokemon card front")}`,
        back:
          imagePreviews.back ||
          `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(form.name + " pokemon card back")}`,
        damage: imagePreviews.damage,
      },
      // Keep legacy imageUrl for compatibility
      imageUrl:
        imagePreviews.front ||
        `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(form.name + " pokemon card")}`,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      quantity: form.quantity,
      isGraded: form.isGraded,
      gradeCompany: form.gradeCompany,
      gradeScore: form.gradeScore,
      forSale: form.forSale,
    }

    addCard(newCard)

    setForm({
      name: "",
      type: "",
      rarity: "",
      set: "",
      cardNumber: "",
      condition: "",
      description: "",
      frontImage: null,
      backImage: null,
      damageImages: [],
      quantity: 1,
      isGraded: false,
      gradeCompany: "",
      gradeScore: "",
      forSale: false,
    })
    setImagePreviews({ front: null, back: null, damage: [] })
    setIsUploading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload New Card
          </CardTitle>
          <CardDescription>Add a new Pokemon card to your collection and help complete the Pokedex!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Card Photos</Label>

              {/* Front Photo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Front Photo *</Label>
                {imagePreviews.front ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreviews.front || "/placeholder.svg"}
                      alt="Card front preview"
                      className="w-48 h-64 object-cover rounded-lg border-2 border-blue-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => removeImage("front")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <Label htmlFor="front-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-medium">Upload front photo</span>
                      <Input
                        id="front-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "front")}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
              </div>

              {/* Back Photo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-blue-700">Back Photo</Label>
                {imagePreviews.back ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreviews.back || "/placeholder.svg"}
                      alt="Card back preview"
                      className="w-48 h-64 object-cover rounded-lg border-2 border-blue-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => removeImage("back")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <Label htmlFor="back-upload" className="cursor-pointer">
                      <span className="text-gray-600 hover:text-gray-700 font-medium">
                        Upload back photo (optional)
                      </span>
                      <Input
                        id="back-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, "back")}
                        className="hidden"
                      />
                    </Label>
                  </div>
                )}
              </div>

              {/* Damage Photos */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-red-700">Damage/Close-up Photos (Optional)</Label>
                <p className="text-xs text-gray-600">Upload close-up photos of any damage, wear, or specific details</p>

                {imagePreviews.damage.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreviews.damage.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Damage photo ${index + 1}`}
                          className="w-24 h-32 object-cover rounded border-2 border-red-200"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                          onClick={() => removeImage("damage", index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
                  <Camera className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <Label htmlFor="damage-upload" className="cursor-pointer">
                    <span className="text-red-600 hover:text-red-700 font-medium">Add damage photos</span>
                    <Input
                      id="damage-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageChange(e, "damage")}
                      className="hidden"
                    />
                  </Label>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Card Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Charizard"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="99"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number.parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {POKEMON_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rarity">Rarity</Label>
                <Select value={form.rarity} onValueChange={(value) => setForm({ ...form, rarity: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITIES.map((rarity) => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={form.condition} onValueChange={(value) => setForm({ ...form, condition: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="set">Set</Label>
                <Input
                  id="set"
                  value={form.set}
                  onChange={(e) => setForm({ ...form, set: e.target.value })}
                  placeholder="e.g., Base Set"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  placeholder="e.g., 4/102"
                />
              </div>
            </div>

            {/* Grading Section */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isGraded"
                  checked={form.isGraded}
                  onCheckedChange={(checked) => setForm({ ...form, isGraded: checked as boolean })}
                />
                <Label htmlFor="isGraded" className="font-medium">
                  This card is professionally graded
                </Label>
              </div>

              {form.isGraded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradeCompany">Grading Company</Label>
                    <Select
                      value={form.gradeCompany}
                      onValueChange={(value) => setForm({ ...form, gradeCompany: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PSA">PSA</SelectItem>
                        <SelectItem value="BGS">BGS (Beckett)</SelectItem>
                        <SelectItem value="CGC">CGC</SelectItem>
                        <SelectItem value="SGC">SGC</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gradeScore">Grade Score</Label>
                    <Input
                      id="gradeScore"
                      value={form.gradeScore}
                      onChange={(e) => setForm({ ...form, gradeScore: e.target.value })}
                      placeholder="e.g., 10, 9.5, Mint 9"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Selling Interest Section */}
            <div className="space-y-2 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forSale"
                  checked={form.forSale}
                  onCheckedChange={(checked) => setForm({ ...form, forSale: checked as boolean })}
                />
                <Label htmlFor="forSale" className="font-medium">
                  I might be interested in selling this card
                </Label>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                This will add a "For Sale" badge to help other collectors find cards they might want to purchase.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Any additional notes about this card..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!form.name || !imagePreviews.front || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Collection
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
