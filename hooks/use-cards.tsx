// hooks/use-cards.ts
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { cardsService, type CardData } from "@/lib/supabase-cards";

interface Card extends CardData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

interface UseCardsProps {
  user?: any;
}

interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: string | null;
  addCard: (cardData: CardData) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  refreshCards: () => Promise<void>;
}

export function useCards({ user }: UseCardsProps = {}): UseCardsReturn {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        console.log("No user provided to useCards hook");
        setCards([]);
        return;
      }

      // Fetch user's cards from database
      const userCards = await cardsService.getUserCards(user.id);
      setCards(userCards);
    } catch (err) {
      console.error("Error fetching cards:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch cards");
    } finally {
      setLoading(false);
    }
  };

  const addCard = async (cardData: CardData) => {
    try {
      setError(null);

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Add user_id to card data
      const cardWithUserId = {
        ...cardData,
        user_id: user.id,
      };

      // Create the card in database
      const newCard = await cardsService.createCard(cardWithUserId);

      // Add to local state
      setCards((prev) => [newCard, ...prev]);
    } catch (err) {
      console.error("Error adding card:", err);
      setError(err instanceof Error ? err.message : "Failed to add card");
      throw err; // Re-throw to handle in component
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      setError(null);

      // Delete from database
      await cardsService.deleteCard(cardId);

      // Remove from local state
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (err) {
      console.error("Error deleting card:", err);
      setError(err instanceof Error ? err.message : "Failed to delete card");
      throw err;
    }
  };

  const refreshCards = async () => {
    await fetchCards();
  };

  // Fetch cards when user changes
  useEffect(() => {
    if (user) {
      fetchCards();
    } else {
      setCards([]);
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscription for cards
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("cards-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        (payload) => {
          console.log("Real-time card change:", payload);

          if (payload.eventType === "INSERT") {
            setCards((prev) => [payload.new as Card, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setCards((prev) =>
              prev.filter((card) => card.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.new.id ? (payload.new as Card) : card
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    cards,
    loading,
    error,
    addCard,
    deleteCard,
    refreshCards,
  };
}
