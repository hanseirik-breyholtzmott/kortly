"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, Star, DollarSign, Trophy, Plus } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { CardDisplay } from "@/components/card-display";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface CardCollectionTabProps {
  user?: any;
}

export function CardCollectionTab({ user }: CardCollectionTabProps) {
  const { cards, loading, error, deleteCard } = useCards({ user });
  const [filter, setFilter] = useState<string>("all");

  // Calculate stats from actual data
  const stats = {
    totalCards: cards.length,
    rareCards: cards.filter(
      (card) =>
        card.rarity &&
        ["Rare", "Rare Holo", "Ultra Rare", "Secret Rare"].includes(card.rarity)
    ).length,
    value: 0, // TODO: Implement value calculation
    recentAdditions: cards.slice(0, 5),
  };

  const filteredCards = cards.filter((card) => {
    switch (filter) {
      case "rare":
        return (
          card.rarity &&
          ["Rare", "Rare Holo", "Ultra Rare", "Secret Rare"].includes(
            card.rarity
          )
        );
      case "common":
        return card.rarity && ["Common", "Uncommon"].includes(card.rarity);
      case "recent":
        return (
          new Date(card.created_at) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
      default:
        return true;
    }
  });

  const handleDeleteCard = async (cardId: string) => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        await deleteCard(cardId);
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete card");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">My Collection</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Cards</p>
                <p className="text-3xl font-bold text-blue-700">
                  {stats.totalCards}
                </p>
              </div>
              <Grid3X3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Rare Cards
                </p>
                <p className="text-3xl font-bold text-purple-700">
                  {stats.rareCards}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Collection Value
                </p>
                <p className="text-3xl font-bold text-green-700">
                  ${stats.value}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={filter === "all" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-200"
          onClick={() => setFilter("all")}
        >
          All Cards
        </Badge>
        <Badge
          variant={filter === "rare" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("rare")}
        >
          Rare
        </Badge>
        <Badge
          variant={filter === "common" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("common")}
        >
          Common
        </Badge>
        <Badge
          variant={filter === "recent" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("recent")}
        >
          Recent
        </Badge>
      </div>

      {/* Collection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Your Cards</h3>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Collection Level: Beginner
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading cards...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading cards: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              {filter === "all"
                ? "No cards in collection"
                : `No ${filter} cards found`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "all"
                ? "Start uploading cards to build your collection"
                : "Try a different filter or upload some cards"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
