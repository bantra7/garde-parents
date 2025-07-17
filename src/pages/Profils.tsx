import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import leoAvatar from "@/assets/leo-avatar.png";

interface Profile {
  id: string;
  name: string;
  role: string;
  details: string;
  avatar?: string;
  phone?: string;
  editable: boolean;
}

const Profils = () => {
  const navigate = useNavigate();
  const { getEnfants, getGrandsParents, isReady } = useDatabase();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [grandsParents, setGrandsParents] = useState<any[]>([]);

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
  }, [isReady, getEnfants, getGrandsParents]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Profils" />
      
      <div className="px-4 py-6">
        {/* Section Enfants */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Enfants</h2>
            <Button 
              size="sm" 
              onClick={() => navigate('/ajouter-enfant')}
              className="bg-nav-active hover:bg-nav-active/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-3">
            {enfants.map(enfant => {
              const profile = {
                id: `enfant-${enfant.id}`,
                name: enfant.nom,
                role: "Enfant",
                details: `${enfant.age} an${enfant.age > 1 ? 's' : ''}`,
                avatar: enfant.photo_url || (enfant.nom === "Léo" ? leoAvatar : undefined),
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
                      <p className="text-sm text-nav-active mb-1">{profile.role}</p>
                      <p className="text-xs text-text-secondary">{profile.details}</p>
                    </div>
                    
                    {profile.editable && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                        onClick={() => navigate(`/modifier-profil/${profile.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
            
            {enfants.length === 0 && (
              <Card className="p-6 bg-childcare-cream border-0 text-center">
                <p className="text-sm text-text-secondary mb-3">Aucun enfant enregistré</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/ajouter-enfant')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter le premier enfant
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Section Grands-Parents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-primary">Grands-Parents</h2>
            <Button 
              size="sm" 
              onClick={() => navigate('/ajouter-grand-parent')}
              className="bg-nav-active hover:bg-nav-active/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-3">
            {grandsParents.map((grandParent) => {
              const profile: Profile = {
                id: `grand-parent-${grandParent.id}`,
                name: grandParent.nom,
                role: grandParent.role === 'grand-mere' ? 'Grand-mère' : 'Grand-père',
                details: `${grandParent.lieu} • Disponible`,
                phone: grandParent.telephone,
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                      onClick={() => navigate(`/modifier-profil/${profile.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
              );
            })}
            
            {grandsParents.length === 0 && (
              <Card className="p-6 bg-childcare-cream border-0 text-center">
                <p className="text-sm text-text-secondary mb-3">Aucun grand-parent enregistré</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/ajouter-grand-parent')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter le premier grand-parent
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profils;