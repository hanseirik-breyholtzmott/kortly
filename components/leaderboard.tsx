"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { usePokemonCards } from "@/hooks/use-pokemon-cards";
import { Trophy, Medal, Award, Crown, Star, Calendar } from "lucide-react";

// interface LeaderboardUser {
//   id: string;
//   username: string;
//   email: string;
//   totalCards: number;
//   uniquePokemon: number;
//   rareCards: number;
//   joinedAt: string;
//   rank: number;
// }

export default function Leaderboard() {
  const { user } = useAuth();
  const { getAllCards } = usePokemonCards();

  // Mock users data with the current user
  const allUsers = [
    {
      id: "1",
      username: "AshKetchum",
      email: "ash@pokemon.com",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      username: "MistyWater",
      email: "misty@pokemon.com",
      joinedAt: "2024-02-01",
    },
    {
      id: "3",
      username: "BrockRock",
      email: "brock@pokemon.com",
      joinedAt: "2024-02-10",
    },
    {
      id: "4",
      username: "GaryOak",
      email: "gary@pokemon.com",
      joinedAt: "2024-01-20",
    },
    {
      id: "5",
      username: "TeamRocket",
      email: "rocket@pokemon.com",
      joinedAt: "2024-02-15",
    },
    ...(user && !["1", "2", "3", "4", "5"].includes(user.id) ? [user] : []),
  ];

  const leaderboardData = useMemo(() => {
    const allCards = getAllCards();

    const userStats = allUsers.map((u) => {
      const userCards = allCards.filter((card) => card.uploadedBy === u.id);
      const uniqueNames = new Set(
        userCards.map((card) => card.name.toLowerCase())
      );
      const rareCards = userCards.filter(
        (card) =>
          card.rarity.includes("Rare") ||
          card.rarity.includes("Ultra") ||
          card.rarity.includes("Secret")
      );

      return {
        ...u,
        totalCards: userCards.length,
        uniquePokemon: uniqueNames.size,
        rareCards: rareCards.length,
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by unique Pokemon count (primary), then by total cards (secondary)
    userStats.sort((a, b) => {
      if (b.uniquePokemon !== a.uniquePokemon) {
        return b.uniquePokemon - a.uniquePokemon;
      }
      return b.totalCards - a.totalCards;
    });

    // Assign ranks
    userStats.forEach((user, index) => {
      user.rank = index + 1;
    });

    return userStats;
  }, [getAllCards, allUsers]);

  const currentUserRank = leaderboardData.find((u) => u.id === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Champion
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-300">
            Runner-up
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
            3rd Place
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCardColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "border-blue-300 bg-blue-50/50";
    }
    switch (rank) {
      case 1:
        return "border-yellow-300 bg-yellow-50/50";
      case 2:
        return "border-gray-300 bg-gray-50/50";
      case 3:
        return "border-amber-300 bg-amber-50/50";
      default:
        return "border-gray-200 bg-white/90";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-600" />
            Trainer Leaderboard
          </CardTitle>
          <CardDescription className="text-lg text-gray-700">
            See who&apos;s closest to becoming the ultimate Pokemon Master!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Current User Stats */}
      {currentUserRank && (
        <Card className="border-blue-300 bg-blue-50/50 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getRankIcon(currentUserRank.rank)}
                  <span className="text-2xl font-bold text-blue-900">
                    #{currentUserRank.rank}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Your Ranking</h3>
                  <p className="text-sm text-blue-700">
                    {currentUserRank.uniquePokemon} unique Pokemon •{" "}
                    {currentUserRank.totalCards} total cards
                  </p>
                </div>
              </div>
              {getRankBadge(currentUserRank.rank)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leaderboardData.slice(0, 3).map((trainer) => {
          const isCurrentUser = trainer.id === user?.id;
          return (
            <Card
              key={trainer.id}
              className={`${getCardColor(
                trainer.rank,
                isCurrentUser
              )} shadow-lg transform transition-all hover:scale-105`}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4">{getRankIcon(trainer.rank)}</div>
                <Avatar className="w-16 h-16 mx-auto mb-4 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {trainer.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {trainer.username}
                </h3>
                {getRankBadge(trainer.rank)}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Unique Pokemon:</span>
                    <span className="font-bold text-blue-600">
                      {trainer.uniquePokemon}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Cards:</span>
                    <span className="font-bold">{trainer.totalCards}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rare Cards:</span>
                    <span className="font-bold text-purple-600">
                      {trainer.rareCards}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-white/90 backdrop-blur shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-600" />
            All Trainers
          </CardTitle>
          <CardDescription>
            Complete ranking of all Pokemon trainers
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {leaderboardData.map((trainer, index) => {
              const isCurrentUser = trainer.id === user?.id;
              return (
                <div
                  key={trainer.id}
                  className={`flex items-center justify-between p-4 border-l-4 transition-colors ${
                    isCurrentUser
                      ? "border-blue-400 bg-blue-50"
                      : index < 3
                      ? "border-yellow-400 bg-yellow-50/30"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(trainer.rank)}
                      <span className="text-xl font-bold text-gray-900">
                        #{trainer.rank}
                      </span>
                    </div>

                    <Avatar className="w-10 h-10 border-2 border-white shadow">
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {trainer.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {trainer.username}
                        {isCurrentUser && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            You
                          </Badge>
                        )}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined{" "}
                          {
                            new Date(trainer.joinedAt)
                              .toISOString()
                              .split("T")[0]
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600 text-lg">
                        {trainer.uniquePokemon}
                      </div>
                      <div className="text-gray-600">Unique</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900 text-lg">
                        {trainer.totalCards}
                      </div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600 text-lg">
                        {trainer.rareCards}
                      </div>
                      <div className="text-gray-600">Rare</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {leaderboardData.length}
            </div>
            <div className="text-sm text-gray-600">Active Trainers</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.max(...leaderboardData.map((u) => u.uniquePokemon))}
            </div>
            <div className="text-sm text-gray-600">Highest Collection</div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {leaderboardData.reduce((sum, u) => sum + u.totalCards, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Cards Collected</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
