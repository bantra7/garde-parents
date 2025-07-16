import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, MapPin, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import leoAvatar from "@/assets/leo-avatar.png";

const Profils = () => {
  const navigate = useNavigate();
  const profiles = [
    {
      id: "leo",
      name: "Léo",
      role: "Enfant",
      details: "1 an • Né le 15 juin 2023",
      avatar: leoAvatar,
      editable: true
    },
    {
      id: "meme",
      name: "Mémé",
      role: "Grand-mère",
      details: "12 jours ce mois • Disponible lun-ven",
      phone: "06 12 34 56 78",
      editable: true
    },
    {
      id: "pepe",
      name: "Pépé", 
      role: "Grand-père",
      details: "8 jours ce mois • Disponible mer-ven",
      phone: "06 87 65 43 21",
      editable: true
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Profils" />
      
      <div className="px-4 py-6">
        <h2 className="text-lg font-medium text-primary mb-6">Famille et gardiens</h2>
        
        <div className="space-y-4">
          {profiles.map((profile) => (
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
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profils;