"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { cardsService, Card, CardInsert } from "@/lib/supabase-cards";

interface UseCardsProps {
  user?: any;
}

export function useCards({ user }: UseCardsProps = {}) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userCards = await cardsService.getCards(user.id);
      setCards(userCards);
    } catch (err) {
      setError("Failed to fetch cards");
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (cardData: Omit<CardInsert, "owner_id">) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const newCard = await cardsService.createCard({
        ...cardData,
        owner_id: user.id,
      });

      if (newCard) {
        setCards((prev) => [newCard, ...prev]);
        return newCard;
      } else {
        throw new Error("Failed to create card");
      }
    } catch (err) {
      setError("Failed to add card");
      console.error("Error adding card:", err);
      throw err;
    }
  };

  const updateCard = async (id: string, updates: Partial<CardInsert>) => {
    try {
      const updatedCard = await cardsService.updateCard(id, updates);

      if (updatedCard) {
        setCards((prev) =>
          prev.map((card) => (card.id === id ? updatedCard : card))
        );
        return updatedCard;
      } else {
        throw new Error("Failed to update card");
      }
    } catch (err) {
      setError("Failed to update card");
      console.error("Error updating card:", err);
      throw err;
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const success = await cardsService.deleteCard(id);

      if (success) {
        setCards((prev) => prev.filter((card) => card.id !== id));
        return true;
      } else {
        throw new Error("Failed to delete card");
      }
    } catch (err) {
      setError("Failed to delete card");
      console.error("Error deleting card:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user]);

  return {
    cards,
    loading,
    error,
    addCard,
    updateCard,
    deleteCard,
    refetch: fetchCards,
  };
}
