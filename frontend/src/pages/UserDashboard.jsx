import React, { useState, useEffect, useContext } from "react";
import { AuthContext, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, LogOut, Snowflake, Sparkles } from "lucide-react";
import { toast } from "sonner";

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchAssignment();
  }, []);

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/user/assignment`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignment(response.data);
    } catch (error) {
      toast.error("Erreur", {
        description: error.response?.data?.detail || "Impossible de charger l'attribution",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-green-50 to-red-50"></div>

      {/* Animated Snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <Snowflake
            key={i}
            className="absolute text-white/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              fontSize: `${10 + Math.random() * 20}px`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-red-600 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Secret Santa {currentYear}
                </h1>
                <p className="text-red-100">Bonjour, {user?.first_name}!</p>
              </div>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : assignment && assignment.has_draw ? (
            <Card className="border-4 border-green-300 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 pb-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Gift className="w-24 h-24 text-red-600" />
                    <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                </div>
                <CardTitle className="text-4xl text-red-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Votre attribution Secret Santa
                </CardTitle>
                <CardDescription className="text-lg">
                  Année {assignment.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-red-50 p-8 rounded-2xl border-2 border-green-200">
                  <p className="text-lg text-gray-700 mb-4">Vous devez offrir un cadeau à :</p>
                  <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-red-300">
                    <p
                      className="text-5xl font-bold text-red-600"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                      data-testid="assignment-name"
                    >
                      {assignment.assignment}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-left bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
                  <p className="font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    Rappels importants :
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm ml-2">
                    <li>Gardez cette attribution secrète! 🤫</li>
                    <li>Préparez un cadeau attentionné 🎁</li>
                    <li>Profitez de la magie de Noël ✨</li>
                    <li>Joyeuses fêtes à toute la famille! 🎄</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-gray-300 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center">
                  <Gift className="w-20 h-20 text-gray-400" />
                </div>
                <CardTitle className="text-3xl text-gray-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Pas encore de tirage
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Le tirage au sort pour l'année {currentYear} n'a pas encore été effectué.
                </p>
                <p className="text-sm text-gray-500">
                  L'administrateur lancera bientôt le tirage. Revenez plus tard!
                </p>
                <div className="pt-4">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    En attente du tirage
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Christmas decoration */}
          <div className="text-center mt-8 text-4xl">
            🎄 ⛄ 🎅 🎁 ✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
