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
import { useDatabase } from "@/hooks/useDatabase";

const RAINBOW_COLORS = [
  "#FF0000", // rouge
  "#FF7F00", // orange
  "#FFFF00", // jaune
  "#00FF00", // vert
  "#0000FF", // bleu
  "#4B0082", // indigo
  "#9400D3"  // violet
];

const ModifierProfil = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [profileType, setProfileType] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [anciennePhotoUrl, setAnciennePhotoUrl] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [lieu, setLieu] = useState("");
  const [gpPhotoUrl, setGpPhotoUrl] = useState<string>("");
  const [gpFilePreview, setGpFilePreview] = useState<string>("");
  const [ancienneGpPhotoUrl, setAncienneGpPhotoUrl] = useState<string>("");
  const [gpCouleur, setGpCouleur] = useState<string>("");
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [birthDateInput, setBirthDateInput] = useState("");

  const { getEnfantById, getGrandParentById, updateEnfant, updateGrandParent, getGrandsParents } = useDatabase();
  const [loading, setLoading] = useState(true);
  const [enfantId, setEnfantId] = useState<number | null>(null);
  const [grandParentId, setGrandParentId] = useState<number | null>(null);
  const [role, setRole] = useState<'grand-mere' | 'grand-pere' | ''>("");

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      if (id?.startsWith("enfant-")) {
        const eid = Number(id.replace("enfant-", ""));
        setEnfantId(eid);
        const enfant = await getEnfantById(eid);
        if (enfant && isMounted) {
          setProfileType("Enfant");
          setPhone("");
          setAvailability("");
          setRole("");
          setPhotoUrl(enfant.photo_url || "");
          setAnciennePhotoUrl(enfant.photo_url || "");
          // Initialiser le nom seulement si vide (évite d'écraser la saisie)
          setName((prev) => prev || enfant.nom);
          // Initialiser la date de naissance si présente
          if (enfant.date_naissance) {
            setBirthDate(new Date(enfant.date_naissance));
          }
        }
      } else if (id?.startsWith("grand-parent-")) {
        const gid = Number(id.replace("grand-parent-", ""));
        setGrandParentId(gid);
        const gp = await getGrandParentById(gid);
        if (gp && isMounted) {
          setProfileType(gp.role === 'grand-mere' ? 'Grand-mère' : 'Grand-père');
          setPhone((prev) => prev || gp.telephone || "");
          setAvailability("");
          setRole(gp.role);
          setName((prev) => prev || gp.nom);
          setLieu((prev) => prev || gp.lieu || "");
          setGpPhotoUrl(gp.photo_url || "");
          setAncienneGpPhotoUrl(gp.photo_url || "");
          setGpCouleur(gp.couleur || "");
        }
        // Charger les couleurs déjà utilisées (hors ce grand-parent)
        const gps = await getGrandsParents();
        const colors = gps.filter(g => g.id !== gid).map(g => g.couleur).filter(Boolean);
        setUsedColors(colors);
        // Si la couleur actuelle n'est pas définie, proposer une couleur dispo
        if (gp && !gp.couleur) {
          const available = RAINBOW_COLORS.find(c => !colors.includes(c));
          setGpCouleur(available || RAINBOW_COLORS[0]);
        }
      }
      if (isMounted) setLoading(false);
    };
    fetchProfile();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast({
        title: "Erreur",
        description: "Le nom est obligatoire",
        variant: "destructive"
      });
      return;
    }
    if (profileType === "Enfant" && enfantId) {
      // Calculer l'âge à partir de la date de naissance
      let age = 0;
      if (birthDate) {
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      // Si une nouvelle image a été uploadée (filePreview), on la sauvegarde, sinon on garde l'ancienne
      const photoToSave = filePreview || photoUrl || anciennePhotoUrl || undefined;
      await updateEnfant(
        enfantId,
        name,
        age,
        photoToSave,
        birthDate
          ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`
          : undefined
      );
      toast({ title: "Profil modifié", description: `Le profil de ${name} a été mis à jour` });
      navigate("/profils");
      return;
    }
    if ((profileType === "Grand-mère" || profileType === "Grand-père") && grandParentId) {
      // Si une nouvelle image a été uploadée (gpFilePreview), on la sauvegarde, sinon on garde l'ancienne
      const photoToSave = gpFilePreview || gpPhotoUrl || ancienneGpPhotoUrl || undefined;
      if (!gpCouleur || usedColors.includes(gpCouleur)) {
        toast({
          title: "Erreur",
          description: "Veuillez choisir une couleur unique pour ce grand-parent.",
          variant: "destructive"
        });
        return;
      }
      await updateGrandParent(grandParentId, name, lieu, phone, role as 'grand-mere' | 'grand-pere', photoToSave, gpCouleur);
      toast({ title: "Profil modifié", description: `Le profil de ${name} a été mis à jour` });
      navigate("/profils");
      return;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGpFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGpPhotoUrl(reader.result as string);
        setGpFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isChildProfile = profileType === "Enfant";

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
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
              <>
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
                        disabled={date => date > new Date()}
                        locale={fr}
                        month={birthDate || undefined}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Photo de profil</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-sm"
                    />
                    {(photoUrl || filePreview) && (
                      <img
                        src={filePreview || photoUrl}
                        alt="Prévisualisation"
                        className="w-12 h-12 object-cover rounded-full border"
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {!isChildProfile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu</Label>
                  <Input
                    id="lieu"
                    value={lieu}
                    onChange={(e) => setLieu(e.target.value)}
                    className="bg-background"
                    placeholder="Entrer le lieu"
                  />
                </div>
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
                  <Label htmlFor="role">Rôle</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={e => setRole(e.target.value as 'grand-mere' | 'grand-pere')}
                    className="w-full border border-input rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="grand-mere">Grand-mère</option>
                    <option value="grand-pere">Grand-père</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Couleur</Label>
                  <div className="flex gap-2 mt-2">
                    {RAINBOW_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${gpCouleur === color ? 'border-black' : 'border-transparent'} ${usedColors.includes(color) ? 'opacity-30 cursor-not-allowed' : ''}`}
                        style={{ background: color }}
                        onClick={() => !usedColors.includes(color) && setGpCouleur(color)}
                        aria-label={`Choisir la couleur ${color}`}
                        disabled={usedColors.includes(color)}
                      >
                        {gpCouleur === color && <span className="w-3 h-3 rounded-full bg-white border border-black" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Photo de profil</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGpFileChange}
                      className="text-sm"
                    />
                    {(gpPhotoUrl || gpFilePreview) && (
                      <img
                        src={gpFilePreview || gpPhotoUrl}
                        alt="Prévisualisation"
                        className="w-12 h-12 object-cover rounded-full border"
                      />
                    )}
                  </div>
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