import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Edit, Plus, Trash2, Cake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDatabase } from "@/hooks/useDatabase";

interface Profile {
  id: string;
  name: string;
  role: string;
  details: string;
  avatar?: string;
  phone?: string;
  editable: boolean;
  couleur?: string; // Added couleur to the interface
}

const Profils = () => {
  const navigate = useNavigate();
  const { getEnfants, getGrandsParents, isReady, deleteEnfant, deleteGrandParent } = useDatabase();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [grandsParents, setGrandsParents] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (isReady) {
        const enfantsData = await getEnfants();
        const grandsParentsData = await getGrandsParents();
        setEnfants(enfantsData);
        setGrandsParents(grandsParentsData);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, refreshKey]);

  // Fonction de suppression avec confirmation
  const handleDeleteEnfant = async (id: number) => {
    if (window.confirm("Supprimer cet enfant ?")) {
      await deleteEnfant(id);
      setRefreshKey(k => k + 1);
    }
  };
  const handleDeleteGrandParent = async (id: number) => {
    if (window.confirm("Supprimer ce grand-parent ?")) {
      await deleteGrandParent(id);
      setRefreshKey(k => k + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Profils" />
      
      <div className="px-4 py-6">
        {/* Section Enfants */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Enfants</h2>
          </div>
          <div className="space-y-3">
            {enfants.map(enfant => {
              // Calcul dynamique de l'âge
              let age = '';
              if (enfant.date_naissance) {
                const birth = new Date(enfant.date_naissance);
                const today = new Date();
                let years = today.getFullYear() - birth.getFullYear();
                const m = today.getMonth() - birth.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                  years--;
                }
                age = `${years} an${years > 1 ? 's' : ''}`;
              }
              const profile = {
                id: `enfant-${enfant.id}`,
                name: enfant.nom,
                role: "Enfant",
                details: age,
                avatar: enfant.photo_url,
                editable: true
              };
              return (
                <Card key={profile.id} className="p-4 bg-childcare-cream border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-childcare-warm flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-text-secondary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-primary mb-1">{profile.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{profile.details}</span>
                        {enfant.date_naissance && (
                          <span className="flex items-center gap-1">
                            <Cake className="w-4 h-4 text-pink-500" />
                            {new Date(enfant.date_naissance).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                    {profile.editable && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                          onClick={() => navigate(`/modifier-profil/${profile.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteEnfant(enfant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/ajouter-enfant')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un enfant
              </Button>
            </div>
          </div>
        </div>
        {/* Section Grands-Parents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Grands-Parents</h2>
          </div>
          <div className="space-y-3">
            {grandsParents.map((grandParent) => {
              const profile: Profile = {
                id: `grand-parent-${grandParent.id}`,
                name: grandParent.nom,
                role: grandParent.role === 'grand-mere' ? 'Grand-mère' : 'Grand-père',
                details: grandParent.lieu, // Supprime '• Disponible'
                phone: grandParent.telephone,
                avatar: grandParent.photo_url,
                couleur: grandParent.couleur,
                editable: true
              };
              return (
              <Card key={profile.id} className="p-4 bg-childcare-cream border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-childcare-warm flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                    {/* Pastille couleur */}
                    {profile.couleur && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                        style={{ background: profile.couleur }}
                        title={`Couleur de ${profile.name}`}
                      />
                    )}
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-primary mb-1 flex items-center gap-2">
                      {profile.name}
                      {profile.couleur && (
                        <span
                          className="inline-block w-4 h-4 rounded-full border-2 border-black align-middle"
                          style={{ background: profile.couleur }}
                          title={`Couleur de ${profile.name}`}
                        />
                      )}
                    </h3>
                    <p className="text-sm text-nav-active mb-1">{profile.role}</p>
                    <p className="text-xs text-text-secondary">{profile.details}</p>
                    {profile.phone && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-text-secondary">
                        <Phone className="h-3 w-3" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                  {profile.editable && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                        onClick={() => navigate(`/modifier-profil/${profile.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteGrandParent(grandParent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
              );
            })}
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/ajouter-grand-parent')}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un grand-parent
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profils;