"use client";

import type React from "react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createClient } from "@/utils/supabase/client";
import { useCards } from "@/hooks/use-cards";
import { cardsService } from "@/lib/supabase-cards";
import { Upload, X, Plus, Camera } from "lucide-react";

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
];

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Ultra Rare",
  "Secret Rare",
];

const CONDITIONS = [
  "Mint",
  "Near Mint",
  "Excellent",
  "Good",
  "Light Played",
  "Played",
  "Poor",
];

const GRADING_COMPANIES = ["PSA", "BGS (Beckett)", "CGC", "SGC", "Other"];

// Zod schema for form validation
const cardFormSchema = z.object({
  name: z.string().min(1, "Card name is required"),
  type: z.string().optional(),
  rarity: z.string().optional(),
  set: z.string().optional(),
  cardNumber: z.string().optional(),
  condition: z.string().optional(),
  description: z.string().optional(),
  quantity: z
    .number()
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
  isGraded: z.boolean().default(false),
  gradeCompany: z.string().optional(),
  gradeScore: z.string().optional(),
  forSale: z.boolean().default(false),
  frontImage: z
    .instanceof(File, { message: "Front image is required" })
    .optional(),
  backImage: z
    .instanceof(File, { message: "Back image is required" })
    .optional(),
  damageImages: z.array(z.instanceof(File)).default([]),
});

type CardFormData = z.infer<typeof cardFormSchema>;

type PhotoType = "front" | "back" | "damage";

interface CardUploadProps {
  user?: any;
}

export default function CardUpload({ user }: CardUploadProps) {
  const { addCard } = useCards();
  const [imagePreviews, setImagePreviews] = useState<{
    front: string | null;
    back: string | null;
    damage: string[];
  }>({
    front: null,
    back: null,
    damage: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const form = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema) as any,
    defaultValues: {
      name: "",
      type: "",
      rarity: "",
      set: "",
      cardNumber: "",
      condition: "",
      description: "",
      quantity: 1,
      isGraded: false,
      gradeCompany: "",
      gradeScore: "",
      forSale: false,
      frontImage: undefined as File | undefined,
      backImage: undefined as File | undefined,
      damageImages: [],
    },
  });

  const isValidImageFile = (file: File): boolean => {
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
    return validTypes.includes(file.type);
  };

  const processFiles = (files: FileList, photoType: PhotoType) => {
    const validFiles = Array.from(files).filter(isValidImageFile);

    if (validFiles.length === 0) {
      alert(
        "Please select valid image files (PNG, JPEG, JPG, GIF, WebP, BMP, TIFF)"
      );
      return;
    }

    if (photoType === "damage") {
      // Handle multiple damage photos
      const currentDamageImages = form.getValues("damageImages") || [];
      const updatedDamageImages = [...currentDamageImages, ...validFiles];
      form.setValue("damageImages", updatedDamageImages);

      // Create previews for damage images
      const newPreviews: string[] = [];
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPreviews.push(result);
          if (newPreviews.length === validFiles.length) {
            setImagePreviews((prev) => ({
              ...prev,
              damage: [...prev.damage, ...newPreviews],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      // Handle single front/back photos
      const file = validFiles[0];
      if (photoType === "front") {
        form.setValue("frontImage", file);
      } else {
        form.setValue("backImage", file);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviews((prev) => ({
          ...prev,
          [photoType]: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    photoType: PhotoType
  ) => {
    const files = e.target.files;
    if (!files) return;
    processFiles(files, photoType);
  };

  const handleDragOver = (e: React.DragEvent, photoType: PhotoType) => {
    e.preventDefault();
    setDragOver(photoType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, photoType: PhotoType) => {
    e.preventDefault();
    setDragOver(null);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files, photoType);
    }
  };

  const removeImage = (photoType: PhotoType, index?: number) => {
    if (photoType === "damage" && typeof index === "number") {
      const currentDamageImages = form.getValues("damageImages") || [];
      const updatedDamageImages = currentDamageImages.filter(
        (_, i) => i !== index
      );
      const updatedDamagePreviews = imagePreviews.damage.filter(
        (_, i) => i !== index
      );
      form.setValue("damageImages", updatedDamageImages);
      setImagePreviews((prev) => ({ ...prev, damage: updatedDamagePreviews }));
    } else {
      if (photoType === "front") {
        form.setValue("frontImage", undefined as File | undefined);
      } else {
        form.setValue("backImage", undefined as File | undefined);
      }
      setImagePreviews((prev) => ({ ...prev, [photoType]: null }));
    }
  };

  const onSubmit = async (data: CardFormData) => {
    if (!user) return;

    // Validate required images
    if (!data.frontImage || !data.backImage) {
      alert("Please upload both front and back images");
      return;
    }

    setIsUploading(true);

    try {
      // Upload images to Supabase Storage
      const timestamp = Date.now();
      const frontImagePath = `cards/${user.id}/${timestamp}-front-${data.frontImage.name}`;
      const backImagePath = `cards/${user.id}/${timestamp}-back-${data.backImage.name}`;

      const [frontImageUrl, backImageUrl] = await Promise.all([
        cardsService.uploadImage(data.frontImage, frontImagePath),
        cardsService.uploadImage(data.backImage, backImagePath),
      ]);

      if (!frontImageUrl || !backImageUrl) {
        throw new Error("Failed to upload images");
      }

      // Upload damage images if any
      let damageImageUrls: string[] = [];
      if (data.damageImages && data.damageImages.length > 0) {
        const damagePromises = data.damageImages.map((file, index) => {
          const damagePath = `cards/${user.id}/${timestamp}-damage-${index}-${file.name}`;
          return cardsService.uploadImage(file, damagePath);
        });

        const damageResults = await Promise.all(damagePromises);
        damageImageUrls = damageResults.filter(
          (url): url is string => url !== null
        );
      }

      // Create card data for Supabase
      const cardData = {
        name: data.name,
        type: data.type || "",
        rarity: data.rarity || "",
        set_name: data.set || "",
        card_number: data.cardNumber || "",
        condition: data.condition || "",
        description: data.description || "",
        quantity: data.quantity,
        is_graded: data.isGraded,
        grade_company: data.gradeCompany || "",
        grade_score: data.gradeScore || "",
        for_sale: data.forSale,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        damage_images: damageImageUrls,
      };

      // Save card to database
      await addCard(cardData);

      // Reset form
      form.reset();
      setImagePreviews({ front: null, back: null, damage: [] });

      alert("Card uploaded successfully!");
    } catch (error) {
      console.error("Error uploading card:", error);
      alert("Failed to upload card. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload New Card
          </CardTitle>
          <CardDescription>
            Add a new Pokemon card to your collection and help complete the
            Pokedex!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Card Photos</Label>

                {/* Front Photo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700">
                    Front Photo *
                  </Label>
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
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragOver === "front"
                          ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                          : "border-blue-300 hover:border-blue-400 hover:bg-blue-25 hover:scale-102"
                      }`}
                      onDragOver={(e) => handleDragOver(e, "front")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "front")}
                    >
                      <Camera className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <Label
                        htmlFor="front-upload"
                        className="cursor-pointer block"
                      >
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-block mb-3">
                          {dragOver === "front"
                            ? "Drop image here"
                            : "Upload front photo"}
                        </div>
                        <Input
                          id="front-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/tiff"
                          onChange={(e) => handleImageChange(e, "front")}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-gray-600 mb-2">
                        or drag and drop your image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPEG, JPG, GIF, WebP, BMP, TIFF
                      </p>
                    </div>
                  )}
                </div>

                {/* Back Photo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-blue-700">
                    Back Photo *
                  </Label>
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
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragOver === "back"
                          ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                          : "border-blue-300 hover:border-blue-400 hover:bg-blue-25 hover:scale-102"
                      }`}
                      onDragOver={(e) => handleDragOver(e, "back")}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, "back")}
                    >
                      <Camera className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <Label
                        htmlFor="back-upload"
                        className="cursor-pointer block"
                      >
                        <div className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-block mb-3">
                          {dragOver === "back"
                            ? "Drop image here"
                            : "Upload back photo"}
                        </div>
                        <Input
                          id="back-upload"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/tiff"
                          onChange={(e) => handleImageChange(e, "back")}
                          className="hidden"
                        />
                      </Label>
                      <p className="text-sm text-gray-600 mb-2">
                        or drag and drop your image
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPEG, JPG, GIF, WebP, BMP, TIFF
                      </p>
                    </div>
                  )}
                </div>

                {/* Damage Photos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-700">
                    Damage/Close-up Photos (Optional)
                  </Label>
                  <p className="text-xs text-gray-600">
                    Upload close-up photos of any damage, wear, or specific
                    details
                  </p>

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

                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                      dragOver === "damage"
                        ? "border-red-500 bg-red-50 scale-105 shadow-lg"
                        : "border-red-300 hover:border-red-400 hover:bg-red-25 hover:scale-102"
                    }`}
                    onDragOver={(e) => handleDragOver(e, "damage")}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, "damage")}
                  >
                    <Camera className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <Label
                      htmlFor="damage-upload"
                      className="cursor-pointer block"
                    >
                      <div className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors duration-200 inline-block mb-2">
                        {dragOver === "damage"
                          ? "Drop images here"
                          : "Add damage photos"}
                      </div>
                      <Input
                        id="damage-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp,image/tiff"
                        multiple
                        onChange={(e) => handleImageChange(e, "damage")}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-sm text-gray-600 mb-1">
                      or drag and drop multiple images
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPEG, JPG, GIF, WebP, BMP, TIFF
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Charizard" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {POKEMON_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="rarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rarity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rarity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RARITIES.map((rarity) => (
                            <SelectItem key={rarity} value={rarity}>
                              {rarity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITIONS.map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="set"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Base Set" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 4/102" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Grading Section */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <FormField
                  control={form.control as any}
                  name="isGraded"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          This card is professionally graded
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch("isGraded") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control as any}
                      name="gradeCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grading Company</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADING_COMPANIES.map((company) => (
                                <SelectItem key={company} value={company}>
                                  {company}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name="gradeScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade Score</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 10, 9.5, Mint 9"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Selling Interest Section */}
              <div className="space-y-2 p-4 bg-green-50 rounded-lg">
                <FormField
                  control={form.control as any}
                  name="forSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I might be interested in selling this card
                        </FormLabel>
                        <FormDescription className="text-sm text-gray-600">
                          This will add a "For Sale" badge to help other
                          collectors find cards they might want to purchase.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about this card..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={
                  !form.watch("name") ||
                  !imagePreviews.front ||
                  !imagePreviews.back ||
                  isUploading
                }
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
