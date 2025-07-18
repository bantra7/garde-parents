import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

const AjouterEnfant = () => {
  const navigate = useNavigate();
  const { addEnfant } = useDatabase();
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState<Date>();
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [dateNaissanceInput, setDateNaissanceInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Calculer l'âge à partir de la date de naissance
      let age = 0;
      if (dateNaissance) {
        const today = new Date();
        age = today.getFullYear() - dateNaissance.getFullYear();
        const m = today.getMonth() - dateNaissance.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dateNaissance.getDate())) {
          age--;
        }
      }
      await addEnfant(
        nom,
        age,
        photoUrl,
        dateNaissance
          ? `${dateNaissance.getFullYear()}-${String(dateNaissance.getMonth() + 1).padStart(2, '0')}-${String(dateNaissance.getDate()).padStart(2, '0')}`
          : undefined
      );
      navigate("/profils");
    } catch (err: any) {
      setError("Erreur lors de l'ajout de l'enfant");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Ajouter un enfant" />
      <div className="flex justify-center px-4 py-8">
        <Card className="w-full max-w-md p-6 bg-childcare-cream border-0 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-primary font-medium">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                className="w-full border border-input rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-primary font-medium">Date de naissance</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !dateNaissance && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateNaissance ? format(dateNaissance, "dd MMMM yyyy", { locale: fr }) : "Sélectionner la date de naissance"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateNaissance}
                    onSelect={setDateNaissance}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={date => date > new Date()}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {/* Champ photo uniquement fichier */}
            <div>
              <label className="block mb-1 text-primary font-medium">Photo</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm"
                  required
                />
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Prévisualisation"
                    className="w-12 h-12 object-cover rounded-full border"
                  />
                )}
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </form>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default AjouterEnfant; 