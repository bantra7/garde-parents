import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import React from "react";

const RAINBOW_COLORS = [
  "#FF0000", // rouge
  "#FF7F00", // orange
  "#FFFF00", // jaune
  "#00FF00", // vert
  "#0000FF", // bleu
  "#4B0082", // indigo
  "#9400D3"  // violet
];

const AjouterGrandParent = () => {
  const navigate = useNavigate();
  const { addGrandParent, getGrandsParents } = useDatabase();
  const [nom, setNom] = useState("");
  const [lieu, setLieu] = useState("");
  const [telephone, setTelephone] = useState("");
  const [role, setRole] = useState<'grand-mere' | 'grand-pere'>('grand-mere');
  const [photoUrl, setPhotoUrl] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [couleur, setCouleur] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usedColors, setUsedColors] = useState<string[]>([]);

  // Charger les couleurs déjà utilisées
  React.useEffect(() => {
    getGrandsParents().then(gps => {
      const colors = gps.map(gp => gp.couleur).filter(Boolean);
      setUsedColors(colors);
      // Proposer une couleur par défaut non utilisée
      const available = RAINBOW_COLORS.find(c => !colors.includes(c));
      setCouleur(available || RAINBOW_COLORS[0]);
    });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!photoUrl) {
        setError("La photo est obligatoire");
        setLoading(false);
        return;
      }
      if (!couleur || usedColors.includes(couleur)) {
        setError("Veuillez choisir une couleur unique pour ce grand-parent.");
        setLoading(false);
        return;
      }
      await addGrandParent(nom, lieu, telephone, role, photoUrl, couleur);
      navigate("/profils");
    } catch (err: any) {
      setError("Erreur lors de l'ajout du grand-parent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Ajouter un grand-parent" />
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
              <label className="block mb-1 text-primary font-medium">Lieu</label>
              <input
                type="text"
                value={lieu}
                onChange={e => setLieu(e.target.value)}
                className="w-full border border-input rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-primary font-medium">Téléphone</label>
              <input
                type="tel"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                className="w-full border border-input rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="06 12 34 56 78"
              />
            </div>
            <div>
              <label className="block mb-1 text-primary font-medium">Rôle</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'grand-mere' | 'grand-pere')}
                className="w-full border border-input rounded px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="grand-mere">Grand-mère</option>
                <option value="grand-pere">Grand-père</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-primary font-medium">Couleur</label>
              <div className="flex gap-2 mt-2">
                {RAINBOW_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${couleur === color ? 'border-black' : 'border-transparent'} ${usedColors.includes(color) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    style={{ background: color }}
                    onClick={() => !usedColors.includes(color) && setCouleur(color)}
                    aria-label={`Choisir la couleur ${color}`}
                    disabled={usedColors.includes(color)}
                  >
                    {couleur === color && <span className="w-3 h-3 rounded-full bg-white border border-black" />}
                  </button>
                ))}
              </div>
            </div>
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
            <Button type="submit" className="w-full" disabled={loading || !photoUrl}>
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </form>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default AjouterGrandParent; 