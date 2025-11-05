import React, { useState, useEffect, useContext } from "react";
import { AuthContext, API } from "@/App";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Gift, Users, UserCheck, UserX, Sparkles, LogOut, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [drawStatus, setDrawStatus] = useState({ has_draw: false, year: new Date().getFullYear() });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingRes, usersRes, statusRes] = await Promise.all([
        axios.get(`${API}/admin/pending-users`, { headers }),
        axios.get(`${API}/admin/users`, { headers }),
        axios.get(`${API}/draw/status`),
      ]);

      setPendingUsers(pendingRes.data);
      setAllUsers(usersRes.data);
      setDrawStatus(statusRes.data);
    } catch (error) {
      toast.error("Erreur de chargement", {
        description: error.response?.data?.detail || "Impossible de charger les données",
      });
    }
  };

  const handleApprove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/approve-user?user_id=${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Utilisateur approuvé!");
      fetchData();
    } catch (error) {
      toast.error("Erreur", {
        description: error.response?.data?.detail || "Impossible d'approuver l'utilisateur",
      });
    }
  };

  const handleReject = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/admin/reject-user?user_id=${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Utilisateur rejeté");
      fetchData();
    } catch (error) {
      toast.error("Erreur", {
        description: error.response?.data?.detail || "Impossible de rejeter l'utilisateur",
      });
    }
  };

  const handleCreateDraw = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API}/admin/draw`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Tirage au sort réussi!", {
        description: response.data.message,
      });
      fetchData();
    } catch (error) {
      toast.error("Erreur de tirage", {
        description: error.response?.data?.detail || "Impossible de créer le tirage",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraw = async () => {
    const year = new Date().getFullYear();
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API}/admin/draw`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Tirage réinitialisé!", {
        description: "Vous pouvez maintenant relancer un nouveau tirage.",
      });
      fetchData();
    } catch (error) {
      toast.error("Erreur de réinitialisation", {
        description: error.response?.data?.detail || "Impossible de supprimer le tirage",
      });
    } finally {
      setLoading(false);
    }
  };

  const approvedUsers = allUsers.filter((u) => u.is_approved);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Admin Dashboard
                </h1>
                <p className="text-red-100">Bienvenue, {user?.first_name}</p>
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

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-red-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <Users className="w-5 h-5" />
                Participants approuvés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600" data-testid="approved-count">{approvedUsers.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
                <UserCheck className="w-5 h-5" />
                En attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-600" data-testid="pending-count">{pendingUsers.length}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <Calendar className="w-5 h-5" />
                Année {drawStatus.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={drawStatus.has_draw ? "default" : "secondary"}
                className={drawStatus.has_draw ? "bg-green-600" : "bg-gray-400"}
                data-testid="draw-status-badge"
              >
                {drawStatus.has_draw ? "Tirage effectué" : "Pas de tirage"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Draw Action */}
        <Card className="mb-8 border-2 border-green-300 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Sparkles className="w-6 h-6" />
              Tirage au sort Secret Santa
            </CardTitle>
            <CardDescription>
              Lancez le tirage pour l'année {drawStatus.year}. Chaque participant sera assigné secrètement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={drawStatus.has_draw || approvedUsers.length < 2 || loading}
                    data-testid="create-draw-button"
                  >
                    {loading ? "Tirage en cours..." : drawStatus.has_draw ? "Tirage déjà effectué" : "Lancer le tirage"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer le tirage au sort?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous allez lancer le tirage pour {approvedUsers.length} participants.
                      Chaque participant recevra secrètement un nom.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCreateDraw}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="confirm-draw-button"
                    >
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {drawStatus.has_draw && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={loading}
                      data-testid="reset-draw-button"
                    >
                      🔄 Réinitialiser le tirage
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>⚠️ Attention!</AlertDialogTitle>
                      <AlertDialogDescription>
                        Voulez-vous vraiment SUPPRIMER le tirage de {drawStatus.year}?
                        <br /><br />
                        <strong>Toutes les attributions seront perdues</strong> et vous devrez relancer un nouveau tirage.
                        <br /><br />
                        Cette action est irréversible!
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteDraw}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="confirm-reset-button"
                      >
                        Oui, supprimer le tirage
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            {approvedUsers.length < 2 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Minimum 2 participants approuvés requis
              </p>
            )}
            
            {drawStatus.has_draw && (
              <p className="text-sm text-green-600 mt-2">
                ℹ️ Si le tirage s'est mal passé, vous pouvez le réinitialiser et le relancer.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <Card className="mb-8 border-2 border-yellow-200 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <UserCheck className="w-6 h-6" />
                Demandes en attente ({pendingUsers.length})
              </CardTitle>
              <CardDescription>Approuvez ou rejetez les nouvelles inscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((pendingUser) => (
                  <div
                    key={pendingUser.id}
                    className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    data-testid={`pending-user-${pendingUser.id}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{pendingUser.first_name}</p>
                      <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(pendingUser.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        data-testid={`approve-button-${pendingUser.id}`}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleReject(pendingUser.id)}
                        size="sm"
                        variant="destructive"
                        data-testid={`reject-button-${pendingUser.id}`}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card className="border-2 border-red-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Users className="w-6 h-6" />
              Tous les utilisateurs ({allUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  data-testid={`user-${u.id}`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{u.first_name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    {u.is_admin && <Badge className="bg-purple-600">Admin</Badge>}
                    {u.is_approved ? (
                      <Badge className="bg-green-600">Approuvé</Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
