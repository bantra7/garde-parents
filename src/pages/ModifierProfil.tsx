import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const ModifierProfil = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [profileType, setProfileType] = useState("");

  // Simulated data - in a real app this would come from an API
  const profiles = {
    leo: {
      name: "Léo",
      type: "Enfant",
      birthDate: "2023-06-15",
      phone: "",
      availability: ""
    },
    meme: {
      name: "Mémé",
      type: "Grand-mère",
      birthDate: "",
      phone: "06 12 34 56 78",
      availability: "Disponible lun-ven"
    },
    pepe: {
      name: "Pépé",
      type: "Grand-père", 
      birthDate: "",
      phone: "06 87 65 43 21",
      availability: "Disponible mer-ven"
    }
  };

  useEffect(() => {
    if (id && id in profiles) {
      const profile = profiles[id as keyof typeof profiles];
      setName(profile.name);
      setProfileType(profile.type);
      setPhone(profile.phone);
      setAvailability(profile.availability);
      if (profile.birthDate) {
        setBirthDate(new Date(profile.birthDate));
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Profil modifié",
      description: `Le profil de ${name} a été mis à jour`
    });

    navigate("/profils");
  };

  const isChildProfile = profileType === "Enfant";

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Modifier le profil" />
      
      <div className="px-4 py-6">
        <Card className="p-6 bg-childcare-cream border-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-childcare-warm flex items-center justify-center">
              <User className="h-6 w-6 text-text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-primary">Modifier {profileType.toLowerCase()}</h2>
              <p className="text-sm text-text-secondary">{name}</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
                placeholder="Entrer le nom"
              />
            </div>

            {isChildProfile && (
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date de naissance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {birthDate ? format(birthDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner la date de naissance"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={birthDate}
                      onSelect={setBirthDate}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {!isChildProfile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilités</Label>
                  <Textarea
                    id="availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="ex: Disponible lun-ven"
                    className="bg-background"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/profils")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Sauvegarder
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ModifierProfil;