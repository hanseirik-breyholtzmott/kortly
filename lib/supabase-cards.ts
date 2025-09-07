import { createClient } from "@/utils/supabase/client";

export interface Card {
  id: string;
  owner_id: string;
  name: string;
  type?: string;
  rarity?: string;
  set_name?: string;
  card_number?: string;
  condition?: string;
  description?: string;
  quantity: number;
  is_graded: boolean;
  grade_company?: string;
  grade_score?: string;
  for_sale: boolean;
  front_image_url?: string;
  back_image_url?: string;
  damage_images: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CardInsert {
  owner_id: string;
  name: string;
  type?: string;
  rarity?: string;
  set_name?: string;
  card_number?: string;
  condition?: string;
  description?: string;
  quantity: number;
  is_graded: boolean;
  grade_company?: string;
  grade_score?: string;
  for_sale: boolean;
  front_image_url?: string;
  back_image_url?: string;
  damage_images: string[];
}

export class CardsService {
  private supabase = createClient();

  async uploadImage(file: File, path: string): Promise<string | null> {
    try {
      console.log("Uploading image to path:", path);

      const { data, error } = await this.supabase.storage
        .from("card-images")
        .upload(path, file);

      if (error) {
        console.error("Error uploading image:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
        });
        return null;
      }

      console.log("Upload successful:", data);

      const {
        data: { publicUrl },
      } = this.supabase.storage.from("card-images").getPublicUrl(data.path);

      console.log("Public URL generated:", publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  }

  async createCard(cardData: CardInsert): Promise<Card | null> {
    try {
      const { data, error } = await this.supabase
        .from("cards")
        .insert(cardData)
        .select()
        .single();

      if (error) {
        console.error("Error creating card:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating card:", error);
      return null;
    }
  }

  async getCards(ownerId?: string): Promise<Card[]> {
    try {
      let query = this.supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: false });

      if (ownerId) {
        query = query.eq("owner_id", ownerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching cards:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching cards:", error);
      return [];
    }
  }

  async getCard(id: string): Promise<Card | null> {
    try {
      const { data, error } = await this.supabase
        .from("cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching card:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching card:", error);
      return null;
    }
  }

  async updateCard(
    id: string,
    updates: Partial<CardInsert>
  ): Promise<Card | null> {
    try {
      const { data, error } = await this.supabase
        .from("cards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating card:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating card:", error);
      return null;
    }
  }

  async deleteCard(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("cards").delete().eq("id", id);

      if (error) {
        console.error("Error deleting card:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting card:", error);
      return false;
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }
}

export const cardsService = new CardsService();
