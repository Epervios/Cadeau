import React, { useState, useContext } from "react";
import { AuthContext, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Gift, Snowflake, Sparkles } from "lucide-react";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (!response.data.user.is_approved) {
        toast.warning("En attente d'approbation", {
          description: "Votre compte doit être approuvé par l'administrateur.",
        });
        setLoading(false);
        return;
      }

      login(response.data.user, response.data.token);
      toast.success("Connexion réussie!", {
        description: `Bienvenue ${response.data.user.first_name}!`,
      });
    } catch (error) {
      toast.error("Erreur de connexion", {
        description: error.response?.data?.detail || "Email ou mot de passe incorrect",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, {
        first_name: formData.first_name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Inscription réussie!", {
        description: "Votre compte doit être approuvé par l'administrateur avant de vous connecter.",
      });

      setFormData({ first_name: "", email: "", password: "" });
      setIsLogin(true);
    } catch (error) {
      toast.error("Erreur d'inscription", {
        description: error.response?.data?.detail || "Une erreur s'est produite",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Christmas Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-green-50 to-red-50"></div>
      
      {/* Animated Snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Snowflake
            key={i}
            className="absolute text-white/30 animate-float"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Gift className="w-12 h-12 text-red-600" />
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold text-red-700 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Secret Santa
            </h1>
            <p className="text-lg text-green-700" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Tirage au sort familial pour Noël
            </p>
          </div>

          {/* Login/Register Card */}
          <Card className="shadow-2xl border-2 border-red-200 backdrop-blur-sm bg-white/95">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center text-red-700">
                {isLogin ? "Connexion" : "Inscription"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin
                  ? "Connectez-vous pour voir votre attribution"
                  : "Rejoignez le Secret Santa familial"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? "login" : "register"} onValueChange={(v) => setIsLogin(v === "login")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" data-testid="login-tab">Connexion</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                      data-testid="login-submit-button"
                    >
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Prénom</Label>
                      <Input
                        id="register-name"
                        name="first_name"
                        type="text"
                        placeholder="Jean"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        data-testid="register-email-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        data-testid="register-password-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={loading}
                      data-testid="register-submit-button"
                    >
                      {loading ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-green-700">
            🎄 Joyeux Noël! 🎅
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
