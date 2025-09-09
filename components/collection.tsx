"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { usePokemonCards } from "@/hooks/use-pokemon-cards";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Calendar,
  Trophy,
  Award,
  DollarSign,
  Hash,
  Camera,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Collection() {
  const { user } = useAuth();
  const { getUserCards } = usePokemonCards();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRarity, setFilterRarity] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPhotos, setSelectedPhotos] = useState<{
    [cardId: string]: number;
  }>({});

  const dummyCards = [
    {
      id: "dummy-1",
      name: "Charizard",
      type: "Fire",
      rarity: "Rare Holo",
      set: "Base Set",
      cardNumber: "4/102",
      condition: "Near Mint",
      quantity: 1,
      isGraded: true,
      gradeCompany: "PSA",
      gradeScore: "9",
      forSale: false,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "The iconic fire-type Pokemon",
    },
    {
      id: "dummy-2",
      name: "Pikachu",
      type: "Electric",
      rarity: "Common",
      set: "Base Set",
      cardNumber: "58/102",
      condition: "Lightly Played",
      quantity: 3,
      isGraded: false,
      forSale: true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "Everyone's favorite electric mouse",
    },
    {
      id: "dummy-3",
      name: "Blastoise",
      type: "Water",
      rarity: "Rare Holo",
      set: "Base Set",
      cardNumber: "2/102",
      condition: "Mint",
      quantity: 1,
      isGraded: true,
      gradeCompany: "BGS",
      gradeScore: "9.5",
      forSale: false,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "Powerful water-type with hydro cannons",
    },
    {
      id: "dummy-4",
      name: "Venusaur",
      type: "Grass",
      rarity: "Rare Holo",
      set: "Base Set",
      cardNumber: "15/102",
      condition: "Near Mint",
      quantity: 2,
      isGraded: false,
      forSale: true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "Grass-type starter evolution",
    },
    {
      id: "dummy-5",
      name: "Alakazam",
      type: "Psychic",
      rarity: "Rare Holo",
      set: "Base Set",
      cardNumber: "1/102",
      condition: "Excellent",
      quantity: 1,
      isGraded: false,
      forSale: false,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "Psychic-type with incredible intelligence",
    },
    {
      id: "dummy-6",
      name: "Machamp",
      type: "Fighting",
      rarity: "Rare Holo",
      set: "Base Set",
      cardNumber: "8/102",
      condition: "Near Mint",
      quantity: 1,
      isGraded: true,
      gradeCompany: "CGC",
      gradeScore: "8.5",
      forSale: false,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user?.id || "demo",
      description: "Fighting-type with four powerful arms",
    },
  ];

  const realUserCards = user ? getUserCards(user.id) : [];
  const userCards = realUserCards.length > 0 ? realUserCards : dummyCards;

  console.log("[v0] Current user:", user);
  console.log("[v0] User cards:", userCards);

  const filteredCards = useMemo(() => {
    return userCards.filter((card) => {
      const matchesSearch =
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.set.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || card.type === filterType;
      const matchesRarity =
        filterRarity === "all" || card.rarity === filterRarity;

      return matchesSearch && matchesType && matchesRarity;
    });
  }, [userCards, searchTerm, filterType, filterRarity]);

  const getCardPhotos = (card: {
    id: string;
    name: string;
    photos?: {
      front?: string;
      back?: string;
      damage?: string[];
    };
    imageUrl?: string;
    [key: string]: unknown;
  }) => {
    const photos = [];

    if (card.photos?.front) {
      photos.push({ type: "front", url: card.photos.front });
    } else if (card.imageUrl) {
      photos.push({ type: "front", url: card.imageUrl });
    }

    if (card.photos?.back) {
      photos.push({ type: "back", url: card.photos.back });
    }

    if (card.photos?.damage && card.photos.damage.length > 0) {
      card.photos.damage.forEach((damageUrl: string, index: number) => {
        photos.push({ type: "damage", url: damageUrl, index });
      });
    }

    return photos;
  };

  const navigatePhoto = (cardId: string, direction: "prev" | "next") => {
    const card = filteredCards.find((c) => c.id === cardId);
    if (!card) return;

    const photos = getCardPhotos(card);
    const currentIndex = selectedPhotos[cardId] || 0;

    let newIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }

    setSelectedPhotos((prev) => ({ ...prev, [cardId]: newIndex }));
  };

  const rarityColors = {
    Common: "bg-gray-100 text-gray-800",
    Uncommon: "bg-green-100 text-green-800",
    Rare: "bg-blue-100 text-blue-800",
    "Rare Holo": "bg-purple-100 text-purple-800",
    "Ultra Rare": "bg-orange-100 text-orange-800",
    "Secret Rare": "bg-red-100 text-red-800",
  };

  const typeColors = {
    Fire: "bg-red-100 text-red-800",
    Water: "bg-blue-100 text-blue-800",
    Grass: "bg-green-100 text-green-800",
    Electric: "bg-yellow-100 text-yellow-800",
    Psychic: "bg-purple-100 text-purple-800",
    Ice: "bg-cyan-100 text-cyan-800",
    Dragon: "bg-indigo-100 text-indigo-800",
    Dark: "bg-gray-100 text-gray-800",
    Fighting: "bg-orange-100 text-orange-800",
    Poison: "bg-violet-100 text-violet-800",
    Ground: "bg-amber-100 text-amber-800",
    Flying: "bg-sky-100 text-sky-800",
    Bug: "bg-lime-100 text-lime-800",
    Rock: "bg-stone-100 text-stone-800",
    Ghost: "bg-slate-100 text-slate-800",
    Steel: "bg-zinc-100 text-zinc-800",
    Fairy: "bg-pink-100 text-pink-800",
    Normal: "bg-neutral-100 text-neutral-800",
  };

  const uniqueTypes = [...new Set(userCards.map((card) => card.type))].filter(
    Boolean
  );
  const uniqueRarities = [
    ...new Set(userCards.map((card) => card.rarity)),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-blue-900">
                  {userCards.length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Types</p>
                <p className="text-2xl font-bold text-green-700">
                  {uniqueTypes.length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rare Cards</p>
                <p className="text-2xl font-bold text-purple-700">
                  {
                    userCards.filter((card) => card.rarity.includes("Rare"))
                      .length
                  }
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Collection Started</p>
                <p className="text-sm font-medium text-gray-700">
                  {user?.joinedAt
                    ? new Date(user.joinedAt).toISOString().split("T")[0]
                    : "N/A"}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/90 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search cards by name or set..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {uniqueRarities.map((rarity) => (
                  <SelectItem key={rarity} value={rarity}>
                    {rarity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No cards match your current filters.</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredCards.map((card) => {
            const photos = getCardPhotos(card);
            const currentPhotoIndex = selectedPhotos[card.id] || 0;
            const currentPhoto = photos[currentPhotoIndex];

            return (
              <Card
                key={card.id}
                className="bg-white/90 backdrop-blur hover:shadow-lg transition-shadow"
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg relative">
                      {currentPhoto?.url || card.imageUrl ? (
                        <img
                          src={currentPhoto?.url || card.imageUrl}
                          alt={`${card.name} - ${
                            currentPhoto?.type || "front"
                          }`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <div className="text-center text-gray-600">
                            <div className="text-sm font-medium">
                              {card.name}
                            </div>
                            <div className="text-xs">{card.type} Type</div>
                          </div>
                        </div>
                      )}
                      {card.quantity && card.quantity > 1 && (
                        <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                          <Hash className="h-3 w-3 mr-1" />
                          {card.quantity}
                        </Badge>
                      )}
                      {photos.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() => navigatePhoto(card.id, "prev")}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() => navigatePhoto(card.id, "next")}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {photos.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index === currentPhotoIndex
                                    ? "bg-white"
                                    : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge className="absolute top-2 right-2 bg-black/50 text-white text-xs">
                            <Camera className="h-3 w-3 mr-1" />
                            {currentPhoto?.type === "damage"
                              ? `Damage ${(currentPhoto.index || 0) + 1}`
                              : currentPhoto?.type?.charAt(0).toUpperCase() +
                                currentPhoto?.type?.slice(1)}
                          </Badge>
                        </>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {card.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {card.type && (
                          <Badge
                            className={
                              typeColors[
                                card.type as keyof typeof typeColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {card.type}
                          </Badge>
                        )}
                        {card.rarity && (
                          <Badge
                            className={
                              rarityColors[
                                card.rarity as keyof typeof rarityColors
                              ] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {card.rarity}
                          </Badge>
                        )}
                        {card.isGraded && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Award className="h-3 w-3 mr-1" />
                            {card.gradeCompany} {card.gradeScore}
                          </Badge>
                        )}
                        {card.forSale && (
                          <Badge className="bg-green-100 text-green-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            For Sale
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {card.set && (
                          <p>
                            <span className="font-medium">Set:</span> {card.set}
                          </p>
                        )}
                        {card.cardNumber && (
                          <p>
                            <span className="font-medium">Number:</span>{" "}
                            {card.cardNumber}
                          </p>
                        )}
                        {card.condition && (
                          <p>
                            <span className="font-medium">Condition:</span>{" "}
                            {card.condition}
                          </p>
                        )}
                        {photos.length > 1 && (
                          <p>
                            <span className="font-medium">Photos:</span>{" "}
                            {photos.length} (
                            {photos.filter((p) => p.type === "damage").length}{" "}
                            damage)
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        {currentPhoto?.url || card.imageUrl ? (
                          <img
                            src={currentPhoto?.url || card.imageUrl}
                            alt={`${card.name} - ${
                              currentPhoto?.type || "front"
                            }`}
                            className="w-20 h-28 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-28 bg-gray-300 rounded flex items-center justify-center">
                            <div className="text-center text-gray-600 text-xs">
                              <div className="font-medium">{card.name}</div>
                              <div>{card.type}</div>
                            </div>
                          </div>
                        )}
                        {card.quantity && card.quantity > 1 && (
                          <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs">
                            {card.quantity}
                          </Badge>
                        )}
                        {photos.length > 1 && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                              onClick={() => navigatePhoto(card.id, "prev")}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                              onClick={() => navigatePhoto(card.id, "next")}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {card.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {card.type && (
                            <Badge
                              className={
                                typeColors[
                                  card.type as keyof typeof typeColors
                                ] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {card.type}
                            </Badge>
                          )}
                          {card.rarity && (
                            <Badge
                              className={
                                rarityColors[
                                  card.rarity as keyof typeof rarityColors
                                ] || "bg-gray-100 text-gray-800"
                              }
                            >
                              {card.rarity}
                            </Badge>
                          )}
                          {card.isGraded && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              {card.gradeCompany} {card.gradeScore}
                            </Badge>
                          )}
                          {card.forSale && (
                            <Badge className="bg-green-100 text-green-800">
                              <DollarSign className="h-3 w-3 mr-1" />
                              For Sale
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                          {card.set && (
                            <p>
                              <span className="font-medium">Set:</span>{" "}
                              {card.set}
                            </p>
                          )}
                          {card.cardNumber && (
                            <p>
                              <span className="font-medium">Number:</span>{" "}
                              {card.cardNumber}
                            </p>
                          )}
                          {card.condition && (
                            <p>
                              <span className="font-medium">Condition:</span>{" "}
                              {card.condition}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Added:</span>{" "}
                            {
                              new Date(card.uploadedAt)
                                .toISOString()
                                .split("T")[0]
                            }
                          </p>
                          {photos.length > 1 && (
                            <p>
                              <span className="font-medium">Photos:</span>{" "}
                              {photos.length}
                            </p>
                          )}
                          {currentPhoto?.type && (
                            <p>
                              <span className="font-medium">Viewing:</span>{" "}
                              {currentPhoto.type === "damage"
                                ? `Damage ${(currentPhoto.index || 0) + 1}`
                                : currentPhoto.type.charAt(0).toUpperCase() +
                                  currentPhoto.type.slice(1)}
                            </p>
                          )}
                        </div>
                        {card.description && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
