// lib/supabase-cards.ts
import { createClient } from "@/utils/supabase/client";

export interface CardData {
  name: string;
  type: string;
  rarity: string;
  set_name: string;
  card_number: string;
  condition: string;
  description: string;
  quantity: number;
  is_graded: boolean;
  grade_company: string;
  grade_score: string;
  for_sale: boolean;
  price?: number;
  front_image_url: string;
  back_image_url: string;
  damage_images: string[];
  user_id?: string; // Optional for backward compatibility
}

export interface Card extends CardData {
  id: string;
  user_id: string; // Required for cards in database
  created_at: string;
  updated_at?: string;
}

class CardsService {
  private supabase = createClient();

  /**
   * Upload an image file to Supabase Storage
   * @param file - The file to upload
   * @param path - The storage path for the file
   * @returns The public URL of the uploaded file or null if failed
   */
  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      console.log(`Uploading image to path: ${path}`);

      // Upload file to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from("card-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        console.error("Error uploading image:", error);

        // If file already exists, try with a different name
        if (error.message.includes("already exists")) {
          const timestamp = Date.now();
          const newPath = path.replace(/(\.[^.]+)$/, `-${timestamp}$1`);
          return this.uploadImage(file, newPath);
        }

        throw error;
      }

      console.log("Image uploaded successfully:", data);

      // Get the public URL
      const { data: publicUrlData } = this.supabase.storage
        .from("card-images")
        .getPublicUrl(data.path);

      const publicUrl = publicUrlData.publicUrl;
      console.log("Public URL generated:", publicUrl);

      return publicUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  }

  /**
   * Create a new card record in the database
   * @param cardData - The card data to insert
   * @returns The created card record or throws an error
   */
  async createCard(cardData: CardData & { user_id: string }): Promise<Card> {
    try {
      console.log("Creating card record:", cardData);

      // First, let's check what columns exist in the table
      const { data: tableInfo, error: tableError } = await this.supabase
        .from("cards")
        .select("*")
        .limit(1);

      if (tableError) {
        console.log("Table info error:", tableError);
      } else {
        console.log("Table structure sample:", tableInfo);
      }

      // Start with just the basic required fields
      const insertData: Partial<CardData> & { user_id: string } = {
        user_id: cardData.user_id,
        name: cardData.name,
        quantity: cardData.quantity,
        is_graded: cardData.is_graded,
        for_sale: cardData.for_sale,
      };

      // Add optional fields only if they have values
      if (cardData.type) insertData.type = cardData.type;
      if (cardData.rarity) insertData.rarity = cardData.rarity;
      if (cardData.set_name) insertData.set_name = cardData.set_name;
      if (cardData.card_number) insertData.card_number = cardData.card_number;
      if (cardData.condition) insertData.condition = cardData.condition;
      if (cardData.description) insertData.description = cardData.description;
      if (cardData.grade_company)
        insertData.grade_company = cardData.grade_company;
      if (cardData.grade_score) insertData.grade_score = cardData.grade_score;
      // Add image URLs - only use columns that exist
      if (cardData.front_image_url) {
        insertData.front_image_url = cardData.front_image_url;
      }
      if (cardData.back_image_url) {
        insertData.back_image_url = cardData.back_image_url;
      }
      if (cardData.damage_images && cardData.damage_images.length > 0) {
        insertData.damage_images = cardData.damage_images;
      }

      const { data, error } = await this.supabase
        .from("cards")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Error creating card:", error);
        throw error;
      }

      console.log("Card created successfully:", data);
      return data;
    } catch (error) {
      console.error("Failed to create card:", error);
      throw error;
    }
  }

  /**
   * Get all cards for a specific user
   * @param userId - The user ID
   * @returns Array of card records
   */
  async getUserCards(userId: string): Promise<Card[]> {
    try {
      console.log("Fetching cards for user:", userId);

      const { data, error } = await this.supabase
        .from("cards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user cards:", error);
        throw error;
      }

      // Process the data to ensure image URLs are properly formatted and user_id is present
      const processedCards = (data || []).map((card) => ({
        ...card,
        // Ensure user_id is present (it should be from the database query)
        user_id: card.user_id || userId,
        // Use standard column names
        front_image_url: card.front_image_url || "",
        back_image_url: card.back_image_url || "",
        damage_images: card.damage_images || [],
      }));

      console.log(
        "Cards fetched successfully:",
        processedCards.length,
        "cards"
      );
      return processedCards;
    } catch (error) {
      console.error("Failed to fetch user cards:", error);
      return [];
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param path - The storage path of the image to delete
   */
  async deleteImage(path: string): Promise<void> {
    try {
      // Extract the file path from the full URL if needed
      const filePath = path.includes("/storage/v1/object/public/card-images/")
        ? path.split("/storage/v1/object/public/card-images/")[1]
        : path;

      const { error } = await this.supabase.storage
        .from("card-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        throw error;
      }

      console.log("Image deleted successfully:", filePath);
    } catch (error) {
      console.error("Failed to delete image:", error);
      // Don't throw here, as this is often called during cleanup
    }
  }

  /**
   * Delete a card and its associated images
   * @param cardId - The card ID to delete
   * @param imageUrls - Array of image URLs to delete
   */
  async deleteCard(cardId: string, imageUrls: string[] = []): Promise<void> {
    try {
      // Delete the card record first
      const { error: deleteError } = await this.supabase
        .from("cards")
        .delete()
        .eq("id", cardId);

      if (deleteError) {
        console.error("Error deleting card:", deleteError);
        throw deleteError;
      }

      // Delete associated images
      if (imageUrls.length > 0) {
        await Promise.all(imageUrls.map((url) => this.deleteImage(url)));
      }

      console.log("Card and images deleted successfully");
    } catch (error) {
      console.error("Failed to delete card:", error);
      throw error;
    }
  }
}

export const cardsService = new CardsService();
