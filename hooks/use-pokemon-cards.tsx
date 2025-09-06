"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface PokemonCard {
  id: string
  name: string
  type: string
  rarity: string
  set: string
  cardNumber: string
  condition: string
  description: string
  imageUrl?: string
  photos?: {
    front?: string
    back?: string
    damage?: string[]
  }
  uploadedBy: string
  uploadedAt: string
  quantity?: number
  isGraded?: boolean
  gradeCompany?: string
  gradeScore?: string
  forSale?: boolean
}

interface PokemonCardsContextType {
  cards: PokemonCard[]
  addCard: (card: PokemonCard) => void
  getUserCards: (userId: string) => PokemonCard[]
  getAllCards: () => PokemonCard[]
}

const PokemonCardsContext = createContext<PokemonCardsContextType | undefined>(undefined)

// Mock initial cards data
const initialCards: PokemonCard[] = [
  {
    id: "1",
    name: "Charizard",
    type: "Fire",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "4/102",
    condition: "Near Mint",
    description: "Classic Charizard from the original Base Set",
    imageUrl: "/charizard-pokemon-card.png",
    uploadedBy: "1",
    uploadedAt: "2024-01-20",
    quantity: 2,
    isGraded: true,
    gradeCompany: "PSA",
    gradeScore: "9",
    forSale: true,
  },
  {
    id: "2",
    name: "Pikachu",
    type: "Electric",
    rarity: "Common",
    set: "Base Set",
    cardNumber: "58/102",
    condition: "Mint",
    description: "The iconic electric mouse Pokemon",
    imageUrl: "/pikachu-pokemon-card.jpg",
    uploadedBy: "1",
    uploadedAt: "2024-01-22",
    quantity: 1,
    photos: {
      front: "/pikachu-pokemon-card.jpg",
      back: `/placeholder.svg?height=300&width=200&query=${encodeURIComponent("Pokemon card back")}`,
    },
  },
  {
    id: "3",
    name: "Blastoise",
    type: "Water",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "2/102",
    condition: "Excellent",
    description: "Powerful water-type starter evolution",
    imageUrl: "/blastoise-pokemon-card.png",
    uploadedBy: "2",
    uploadedAt: "2024-02-01",
    quantity: 1,
    forSale: true,
  },
  {
    id: "4",
    name: "Venusaur",
    type: "Grass",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "15/102",
    condition: "Near Mint",
    description: "Grass-type starter final evolution",
    imageUrl: "/venusaur-pokemon-card.png",
    uploadedBy: "2",
    uploadedAt: "2024-02-03",
    quantity: 1,
    isGraded: true,
    gradeCompany: "BGS",
    gradeScore: "8.5",
  },
  {
    id: "5",
    name: "Alakazam",
    type: "Psychic",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "1/102",
    condition: "Near Mint",
    description: "Psychic-type Pokemon with incredible mental powers",
    uploadedBy: "1",
    uploadedAt: "2024-01-25",
    quantity: 1,
  },
  {
    id: "6",
    name: "Machamp",
    type: "Fighting",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "8/102",
    condition: "Excellent",
    description: "Fighting-type Pokemon with four powerful arms",
    uploadedBy: "1",
    uploadedAt: "2024-01-28",
    quantity: 3,
    forSale: true,
  },
  {
    id: "7",
    name: "Gyarados",
    type: "Water",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "6/102",
    condition: "Good",
    description: "Fierce water dragon Pokemon",
    uploadedBy: "1",
    uploadedAt: "2024-02-05",
    quantity: 1,
    photos: {
      damage: [
        `/placeholder.svg?height=300&width=200&query=${encodeURIComponent("Pokemon card damage corner")}`,
        `/placeholder.svg?height=300&width=200&query=${encodeURIComponent("Pokemon card edge wear")}`,
      ],
    },
  },
  {
    id: "8",
    name: "Raichu",
    type: "Electric",
    rarity: "Rare",
    set: "Base Set",
    cardNumber: "14/102",
    condition: "Near Mint",
    description: "Evolution of Pikachu with enhanced electric powers",
    uploadedBy: "1",
    uploadedAt: "2024-02-08",
    quantity: 1,
  },
  {
    id: "9",
    name: "Nidoking",
    type: "Poison",
    rarity: "Rare Holo",
    set: "Base Set",
    cardNumber: "11/102",
    condition: "Mint",
    description: "Powerful poison-type Pokemon with drill horn",
    uploadedBy: "1",
    uploadedAt: "2024-02-10",
    quantity: 1,
    isGraded: true,
    gradeCompany: "CGC",
    gradeScore: "9.5",
  },
  {
    id: "10",
    name: "Clefairy",
    type: "Fairy",
    rarity: "Rare",
    set: "Base Set",
    cardNumber: "5/102",
    condition: "Excellent",
    description: "Cute fairy-type Pokemon with magical abilities",
    uploadedBy: "1",
    uploadedAt: "2024-02-12",
    quantity: 2,
  },
]

export function PokemonCardsProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<PokemonCard[]>([])

  useEffect(() => {
    // Load cards from localStorage or use initial data
    const storedCards = localStorage.getItem("pokemon-cards")
    if (storedCards) {
      setCards(JSON.parse(storedCards))
    } else {
      setCards(initialCards)
      localStorage.setItem("pokemon-cards", JSON.stringify(initialCards))
    }
  }, [])

  const addCard = (card: PokemonCard) => {
    const updatedCards = [...cards, card]
    setCards(updatedCards)
    localStorage.setItem("pokemon-cards", JSON.stringify(updatedCards))
  }

  const getUserCards = (userId: string) => {
    return cards.filter((card) => card.uploadedBy === userId)
  }

  const getAllCards = () => {
    return cards
  }

  return (
    <PokemonCardsContext.Provider value={{ cards, addCard, getUserCards, getAllCards }}>
      {children}
    </PokemonCardsContext.Provider>
  )
}

export function usePokemonCards() {
  const context = useContext(PokemonCardsContext)
  if (context === undefined) {
    throw new Error("usePokemonCards must be used within a PokemonCardsProvider")
  }
  return context
}
