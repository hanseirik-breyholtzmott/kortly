"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { usePokemonCards } from "@/hooks/use-pokemon-cards"

interface User {
  id: string
  username: string
  email: string
  cardsCount: number
  joinedAt: string
}

// Mock users data (same as in auth hook)
const mockUsers: User[] = [
  { id: "1", username: "AshKetchum", email: "ash@pokemon.com", cardsCount: 150, joinedAt: "2024-01-15" },
  { id: "2", username: "MistyWater", email: "misty@pokemon.com", cardsCount: 89, joinedAt: "2024-02-01" },
  { id: "3", username: "BrockRock", email: "brock@pokemon.com", cardsCount: 67, joinedAt: "2024-02-10" },
  { id: "4", username: "GaryOak", email: "gary@pokemon.com", cardsCount: 134, joinedAt: "2024-01-20" },
  { id: "5", username: "TeamRocket", email: "rocket@pokemon.com", cardsCount: 45, joinedAt: "2024-02-15" },
]

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { cards } = usePokemonCards()
  const [user, setUser] = useState<User | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const foundUser = mockUsers.find((u) => u.username.toLowerCase() === username.toLowerCase())
    setUser(foundUser || null)
  }, [username])

  const nextPhoto = (cardId: string, totalPhotos: number) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) + 1) % totalPhotos,
    }))
  }

  const prevPhoto = (cardId: string, totalPhotos: number) => {
    setCurrentPhotoIndex((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] || 0) - 1 + totalPhotos) % totalPhotos,
    }))
  }

  const getPhotoTypeLabel = (index: number, photos: any) => {
    if (index === 0 && photos.front) return "Front"
    if (index === 1 && photos.back) return "Back"
    return "Damage"
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trainer Not Found</h1>
            <p className="text-gray-600">The trainer "{username}" doesn't exist in our Pokédex.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Filter cards for this user (in real app, this would be fetched from API)
  const userCards = cards.filter((card) => card.userId === user.id)

  // Calculate stats
  const totalCards = userCards.reduce((sum, card) => sum + card.quantity, 0)
  const uniqueCards = userCards.length
  const rareCards = userCards.filter((card) => card.rarity === "Rare" || card.rarity === "Ultra Rare").length
  const gradedCards = userCards.filter((card) => card.isGraded).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">{user.username[0].toUpperCase()}</span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">{user.username}</CardTitle>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Trainer since {new Date(user.joinedAt).toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCards}</div>
              <div className="text-sm text-gray-600">Total Cards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{uniqueCards}</div>
              <div className="text-sm text-gray-600">Unique Cards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{rareCards}</div>
              <div className="text-sm text-gray-600">Rare Cards</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{gradedCards}</div>
              <div className="text-sm text-gray-600">Graded Cards</div>
            </CardContent>
          </Card>
        </div>

        {/* Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {user.username}'s Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">This trainer hasn't uploaded any cards yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userCards.map((card) => {
                  const availablePhotos = [
                    card.photos?.front && { url: card.photos.front, type: "front" },
                    card.photos?.back && { url: card.photos.back, type: "back" },
                    ...(card.photos?.damage || []).map((url: string) => ({ url, type: "damage" })),
                  ].filter(Boolean)

                  const currentIndex = currentPhotoIndex[card.id] || 0
                  const currentPhoto = availablePhotos[currentIndex]

                  return (
                    <Card key={card.id} className="overflow-hidden">
                      <div className="relative">
                        {currentPhoto && (
                          <img
                            src={currentPhoto.url || "/placeholder.svg"}
                            alt={card.name}
                            className="w-full h-48 object-cover"
                          />
                        )}

                        {/* Photo Navigation */}
                        {availablePhotos.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                              onClick={() => prevPhoto(card.id, availablePhotos.length)}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                              onClick={() => nextPhoto(card.id, availablePhotos.length)}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>

                            {/* Photo indicators */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                              {availablePhotos.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentIndex ? "bg-white" : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>

                            {/* Photo type label */}
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-xs">
                                {getPhotoTypeLabel(currentIndex, card.photos)}
                              </Badge>
                            </div>
                          </>
                        )}

                        {/* Quantity badge */}
                        {card.quantity > 1 && (
                          <Badge className="absolute top-2 right-2 bg-blue-600">x{card.quantity}</Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{card.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{card.type}</Badge>
                          <Badge variant="outline">{card.rarity}</Badge>
                          <Badge variant="outline">{card.condition}</Badge>
                          {card.isGraded && (
                            <Badge className="bg-yellow-500">
                              {card.gradingCompany} {card.gradingScore}
                            </Badge>
                          )}
                          {card.forSale && <Badge className="bg-green-600">For Sale</Badge>}
                        </div>
                        {card.setName && <p className="text-sm text-gray-600">Set: {card.setName}</p>}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
