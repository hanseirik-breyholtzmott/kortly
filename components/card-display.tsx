"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card as CardType } from "@/lib/supabase-cards";
import {
  Edit,
  Trash2,
  Eye,
  Star,
  DollarSign,
  Calendar,
  Hash,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CardDisplayProps {
  card: CardType;
  onEdit?: (card: CardType) => void;
  onDelete?: (cardId: string) => void;
  onView?: (card: CardType) => void;
}

export function CardDisplay({
  card,
  onEdit,
  onDelete,
  onView,
}: CardDisplayProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {card.name}
              </CardTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {card.type && (
                  <Badge variant="secondary" className="text-xs">
                    {card.type}
                  </Badge>
                )}
                {card.rarity && (
                  <Badge variant="outline" className="text-xs">
                    {card.rarity}
                  </Badge>
                )}
                {card.for_sale && (
                  <Badge
                    variant="default"
                    className="text-xs"
                    style={{ backgroundColor: "var(--spark-token-600)" }}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Til salgs
                  </Badge>
                )}
                {card.is_graded && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {card.grade_company} {card.grade_score}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(card)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(card)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(card.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            {/* Card Image */}
            {card.front_image_url && (
              <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto">
                <Image
                  src={card.front_image_url}
                  alt={`${card.name} front`}
                  fill
                  className="object-cover rounded-lg border"
                  sizes="(max-width: 768px) 200px, 200px"
                />
              </div>
            )}

            {/* Card Details */}
            <div className="space-y-2 text-sm">
              {card.set_name && (
                <div>
                  <span className="font-medium text-gray-600">Sett:</span>{" "}
                  {card.set_name}
                </div>
              )}
              {card.card_number && (
                <div>
                  <span className="font-medium text-gray-600">Nummer:</span>{" "}
                  {card.card_number}
                </div>
              )}
              {card.condition && (
                <div>
                  <span className="font-medium text-gray-600">Tilstand:</span>{" "}
                  {card.condition}
                </div>
              )}
              <div>
                <span className="font-medium text-gray-600">Antall:</span>{" "}
                {card.quantity}
              </div>
              {card.description && (
                <div>
                  <span className="font-medium text-gray-600">
                    Beskrivelse:
                  </span>
                  <p className="text-gray-700 mt-1 line-clamp-2">
                    {card.description}
                  </p>
                </div>
              )}
            </div>

            {/* Damage Images */}
            {card.damage_images && card.damage_images.length > 0 && (
              <div>
                <span className="font-medium text-gray-600 text-sm">
                  Skadefotos:
                </span>
                <div className="flex gap-2 mt-1">
                  {card.damage_images
                    .slice(0, 3)
                    .map((imageUrl: string, index: number) => (
                      <div key={index} className="relative w-12 h-16">
                        <Image
                          src={imageUrl}
                          alt={`Damage photo ${index + 1}`}
                          fill
                          className="object-cover rounded border"
                          sizes="48px"
                        />
                      </div>
                    ))}
                  {card.damage_images.length > 3 && (
                    <div className="w-12 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                      +{card.damage_images.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogClose onClick={() => setIsDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {card.name}
            </DialogTitle>
            <DialogDescription>
              Detaljert visning av ditt samlingskort
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Card Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Image */}
              {card.front_image_url && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Forsidebilde</h3>
                  <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto">
                    <Image
                      src={card.front_image_url}
                      alt={`${card.name} front`}
                      fill
                      className="object-cover rounded-lg border shadow-lg"
                      sizes="(max-width: 768px) 300px, 300px"
                    />
                  </div>
                </div>
              )}

              {/* Back Image */}
              {card.back_image_url && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Baksidebilde</h3>
                  <div className="relative aspect-[3/4] w-full max-w-[300px] mx-auto">
                    <Image
                      src={card.back_image_url}
                      alt={`${card.name} back`}
                      fill
                      className="object-cover rounded-lg border shadow-lg"
                      sizes="(max-width: 768px) 300px, 300px"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Card Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Grunnleggende informasjon
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Kortnummer:</span>
                    <span>{card.card_number || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Type:</span>
                    <span>{card.type || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Sjeldenhet:</span>
                    <span>{card.rarity || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Sett:</span>
                    <span>{card.set_name || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tilstand:</span>
                    <span>{card.condition || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Antall:</span>
                    <span>{card.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Grading & Sale Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Gradering & Salg
                </h3>
                <div className="space-y-3">
                  {card.is_graded && (
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: "var(--spark-token-50)",
                        borderColor: "var(--spark-token-200)",
                        border: "1px solid",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Star
                          className="h-4 w-4"
                          style={{ color: "var(--spark-token-600)" }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: "var(--spark-token-800)" }}
                        >
                          Gradert Kort
                        </span>
                      </div>
                      <div className="text-sm">
                        <div>
                          <span className="font-medium">Selskap:</span>{" "}
                          {card.grade_company}
                        </div>
                        <div>
                          <span className="font-medium">Score:</span>{" "}
                          {card.grade_score}
                        </div>
                      </div>
                    </div>
                  )}

                  {card.for_sale && (
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: "var(--aqua-mint-50)",
                        borderColor: "var(--aqua-mint-200)",
                        border: "1px solid",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign
                          className="h-4 w-4"
                          style={{ color: "var(--aqua-mint-600)" }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: "var(--aqua-mint-800)" }}
                        >
                          Til salgs
                        </span>
                      </div>
                      {card.price && (
                        <div className="text-sm">
                          <div>
                            <span className="font-medium">Pris:</span> $
                            {card.price}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {card.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Beskrivelse
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {card.description}
                </p>
              </div>
            )}

            {/* Damage Images */}
            {card.damage_images && card.damage_images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Skadefotos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {card.damage_images.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative aspect-[3/4] w-full">
                      <Image
                        src={imageUrl}
                        alt={`Damage photo ${index + 1}`}
                        fill
                        className="object-cover rounded-lg border shadow-sm"
                        sizes="(max-width: 768px) 150px, 150px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {onView && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onView(card);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Vis detaljer
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => {
                    onEdit(card);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Rediger kort
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(card.id);
                    setIsDialogOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Slett kort
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
