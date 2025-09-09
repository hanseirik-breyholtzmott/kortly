"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3X3, Star, DollarSign, Trophy } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { CardDisplay } from "@/components/card-display";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";

interface CardCollectionTabProps {
  user?: User;
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
      <h2 className="text-xl font-semibold mb-4">Min Samling</h2>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="border-0 shadow-lg"
          style={{
            background:
              "linear-gradient(to right, var(--aqua-mint-50), var(--aqua-mint-100))",
            borderColor: "var(--aqua-mint-200)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--aqua-mint-600)" }}
                >
                  Totalt Kort
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "var(--aqua-mint-700)" }}
                >
                  {stats.totalCards}
                </p>
              </div>
              <Grid3X3
                className="h-8 w-8"
                style={{ color: "var(--aqua-mint-600)" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg"
          style={{
            background:
              "linear-gradient(to right, var(--mystic-vault-50), var(--mystic-vault-100))",
            borderColor: "var(--mystic-vault-200)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--mystic-vault-600)" }}
                >
                  Sjeldne Kort
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "var(--mystic-vault-700)" }}
                >
                  {stats.rareCards}
                </p>
              </div>
              <Star
                className="h-8 w-8"
                style={{ color: "var(--mystic-vault-600)" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg"
          style={{
            background:
              "linear-gradient(to right, var(--spark-token-50), var(--spark-token-100))",
            borderColor: "var(--spark-token-200)",
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--spark-token-600)" }}
                >
                  Samlingsverdi
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: "var(--spark-token-700)" }}
                >
                  Kommer snart
                </p>
              </div>
              <DollarSign
                className="h-8 w-8"
                style={{ color: "var(--spark-token-600)" }}
              />
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
          Alle Kort
        </Badge>
        <Badge
          variant={filter === "rare" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("rare")}
        >
          Sjeldne
        </Badge>
        <Badge
          variant={filter === "common" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("common")}
        >
          Vanlige
        </Badge>
        <Badge
          variant={filter === "recent" ? "secondary" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => setFilter("recent")}
        >
          Nylige
        </Badge>
      </div>

      {/* Collection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Dine Kort</h3>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Samlingsnivå: Nybegynner
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: "var(--aqua-mint-600)" }}
            ></div>
            <span className="ml-2 text-gray-600">Laster kort...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              Feil ved lasting av kort: {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700"
            >
              Prøv igjen
            </button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Grid3X3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">
              {filter === "all"
                ? "Ingen kort i samlingen"
                : `Ingen ${filter} kort funnet`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "all"
                ? "Start å laste opp kort for å bygge samlingen din"
                : "Prøv et annet filter eller last opp noen kort"}
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
