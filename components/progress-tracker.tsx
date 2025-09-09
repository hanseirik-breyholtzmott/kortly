"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/use-auth"
import { usePokemonCards } from "@/hooks/use-pokemon-cards"
import { Trophy, Target, Star, Zap, Award, Crown } from "lucide-react"

// Original 151 Pokemon from Generation 1
const ORIGINAL_POKEMON_COUNT = 151
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

export default function ProgressTracker() {
  const { user } = useAuth()
  const { getUserCards } = usePokemonCards()

  const progressStats = useMemo(() => {
    const userCards = user ? getUserCards(user.id) : []
    
    if (!userCards) return {
      uniquePokemon: 0,
      totalCards: 0,
      typesCollected: 0,
      raritiesCollected: 0,
      holoCards: 0,
      completionPercentage: 0,
      typeCompletionPercentage: 0,
      rarityCompletionPercentage: 0,
    };
    
    const uniqueNames = new Set(userCards.map((card) => card.name.toLowerCase()))
    const typesCaught = new Set(userCards.map((card) => card.type).filter(Boolean))
    const raritiesCollected = new Set(userCards.map((card) => card.rarity).filter(Boolean))
    const holoCards = userCards.filter(
      (card) => card.rarity.includes("Holo") || card.rarity.includes("Ultra") || card.rarity.includes("Secret"),
    )

    return {
      uniquePokemon: uniqueNames.size,
      totalCards: userCards.length,
      typesCollected: typesCaught.size,
      raritiesCollected: raritiesCollected.size,
      holoCards: holoCards.length,
      completionPercentage: Math.round((uniqueNames.size / ORIGINAL_POKEMON_COUNT) * 100),
      typeCompletionPercentage: Math.round((typesCaught.size / POKEMON_TYPES.length) * 100),
      rarityCompletionPercentage: Math.round((raritiesCollected.size / RARITIES.length) * 100),
    }
  }, [user, getUserCards])

  const achievements = useMemo(() => {
    const achievements = []

    if (progressStats.uniquePokemon >= 1) {
      achievements.push({
        title: "First Catch",
        description: "Caught your first Pokemon!",
        icon: Star,
        unlocked: true,
        color: "text-yellow-600",
      })
    }

    if (progressStats.uniquePokemon >= 10) {
      achievements.push({
        title: "Collector",
        description: "Collected 10 unique Pokemon",
        icon: Trophy,
        unlocked: true,
        color: "text-blue-600",
      })
    }

    if (progressStats.uniquePokemon >= 50) {
      achievements.push({
        title: "Trainer",
        description: "Collected 50 unique Pokemon",
        icon: Award,
        unlocked: true,
        color: "text-green-600",
      })
    }

    if (progressStats.uniquePokemon >= 100) {
      achievements.push({
        title: "Master Trainer",
        description: "Collected 100 unique Pokemon",
        icon: Crown,
        unlocked: true,
        color: "text-purple-600",
      })
    }

    if (progressStats.uniquePokemon >= 151) {
      achievements.push({
        title: "Pokemon Master",
        description: "Gotta Catch Em All! - Complete Pokedex",
        icon: Crown,
        unlocked: true,
        color: "text-red-600",
      })
    }

    if (progressStats.typesCollected >= 10) {
      achievements.push({
        title: "Type Specialist",
        description: "Collected Pokemon from 10+ types",
        icon: Zap,
        unlocked: true,
        color: "text-indigo-600",
      })
    }

    if (progressStats.holoCards >= 5) {
      achievements.push({
        title: "Shiny Hunter",
        description: "Collected 5+ holographic cards",
        icon: Star,
        unlocked: true,
        color: "text-pink-600",
      })
    }

    // Add locked achievements
    if (progressStats.uniquePokemon < 10) {
      achievements.push({
        title: "Collector",
        description: "Collect 10 unique Pokemon",
        icon: Trophy,
        unlocked: false,
        color: "text-gray-400",
      })
    }

    if (progressStats.uniquePokemon < 50) {
      achievements.push({
        title: "Trainer",
        description: "Collect 50 unique Pokemon",
        icon: Award,
        unlocked: false,
        color: "text-gray-400",
      })
    }

    if (progressStats.uniquePokemon < 100) {
      achievements.push({
        title: "Master Trainer",
        description: "Collect 100 unique Pokemon",
        icon: Crown,
        unlocked: false,
        color: "text-gray-400",
      })
    }

    if (progressStats.uniquePokemon < 151) {
      achievements.push({
        title: "Pokemon Master",
        description: "Complete the original Pokedex (151 Pokemon)",
        icon: Crown,
        unlocked: false,
        color: "text-gray-400",
      })
    }

    return achievements
  }, [progressStats])

  const nextMilestone = useMemo(() => {
    const milestones = [1, 10, 25, 50, 75, 100, 125, 151]
    const current = progressStats.uniquePokemon
    const next = milestones.find((milestone) => milestone > current)
    return next || 151
  }, [progressStats.uniquePokemon])

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-3">
            <Target className="h-8 w-8" />
            Gotta Catch &apos;Em All!
          </CardTitle>
          <CardDescription className="text-lg text-blue-700">Your journey to complete the Pokedex</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-900 mb-2">
              {progressStats.uniquePokemon}
              <span className="text-2xl text-blue-600">/{ORIGINAL_POKEMON_COUNT}</span>
            </div>
            <p className="text-blue-700 font-medium">Unique Pokemon Caught</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>Progress to Pokemon Master</span>
              <span>{progressStats.completionPercentage}%</span>
            </div>
            <Progress value={progressStats.completionPercentage} className="h-3 bg-blue-200" />
          </div>

          <div className="text-center">
            <p className="text-blue-600">
              Next milestone: <span className="font-bold">{nextMilestone} Pokemon</span>
              <br />
              <span className="text-sm">{nextMilestone - progressStats.uniquePokemon} more to go!</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Type Coverage</h3>
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Types Collected</span>
                <span>
                  {progressStats.typesCollected}/{POKEMON_TYPES.length}
                </span>
              </div>
              <Progress value={progressStats.typeCompletionPercentage} className="h-2" />
              <p className="text-xs text-gray-600">{progressStats.typeCompletionPercentage}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Rarity Collection</h3>
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rarities Found</span>
                <span>
                  {progressStats.raritiesCollected}/{RARITIES.length}
                </span>
              </div>
              <Progress value={progressStats.rarityCompletionPercentage} className="h-2" />
              <p className="text-xs text-gray-600">{progressStats.rarityCompletionPercentage}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Special Cards</h3>
              <Trophy className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Holographic Cards</span>
                <span className="font-bold text-orange-600">{progressStats.holoCards}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Cards</span>
                <span className="font-bold">{progressStats.totalCards}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock achievements as you build your collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    achievement.unlocked ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`h-6 w-6 ${achievement.color}`} />
                    <h4 className={`font-semibold ${achievement.unlocked ? "text-gray-900" : "text-gray-500"}`}>
                      {achievement.title}
                    </h4>
                    {achievement.unlocked && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${achievement.unlocked ? "text-gray-700" : "text-gray-500"}`}>
                    {achievement.description}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
