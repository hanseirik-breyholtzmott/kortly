"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card as CardType } from "@/lib/supabase-cards";
import { Edit, Trash2, Eye, Star, DollarSign } from "lucide-react";
import Image from "next/image";

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
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
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
                <Badge variant="default" className="text-xs bg-green-600">
                  <DollarSign className="h-3 w-3 mr-1" />
                  For Sale
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
                <span className="font-medium text-gray-600">Set:</span>{" "}
                {card.set_name}
              </div>
            )}
            {card.card_number && (
              <div>
                <span className="font-medium text-gray-600">Number:</span>{" "}
                {card.card_number}
              </div>
            )}
            {card.condition && (
              <div>
                <span className="font-medium text-gray-600">Condition:</span>{" "}
                {card.condition}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-600">Quantity:</span>{" "}
              {card.quantity}
            </div>
            {card.description && (
              <div>
                <span className="font-medium text-gray-600">Description:</span>
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
                Damage Photos:
              </span>
              <div className="flex gap-2 mt-1">
                {card.damage_images.slice(0, 3).map((imageUrl, index) => (
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
  );
}
