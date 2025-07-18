import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useDatabase } from "@/hooks/useDatabase";

const AjouterGarde = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [caregiver, setCaregiver] = useState("");
  const [enfants, setEnfants] = useState<any[]>([]);
  const [selectedEnfant, setSelectedEnfant] = useState<string>("");
  const [grandsParents, setGrandsParents] = useState<any[]>([]);
  const [selectedGrandParent, setSelectedGrandParent] = useState<string>("");
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const { getEnfants, getGrandsParents, addGarde, getGardes } = useDatabase();

  useEffect(() => {
    const fetchEnfants = async () => {
      const data = await getEnfants();
      setEnfants(data);
      if (data.length === 1) setSelectedEnfant(data[0].id.toString());
    };
    const fetchGrandsParents = async () => {
      const data = await getGrandsParents();
      setGrandsParents(data);
      if (data.length === 1) setSelectedGrandParent(data[0].id.toString());
    };
    fetchEnfants();
    fetchGrandsParents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !selectedEnfant || !selectedGrandParent) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Erreur", 
        description: "La date de fin doit être postérieure à la date de début",
        variant: "destructive"
      });
      return;
    }

    // Vérification des dates déjà prises
    const gardesExistantes = await getGardes();
    let current = new Date(startDate);
    const end = new Date(endDate);
    const datesConflit: string[] = [];
    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      const conflit = gardesExistantes.some(g =>
        g.enfant_id === Number(selectedEnfant) &&
        g.grand_parent_id === Number(selectedGrandParent) &&
        g.date === dateStr
      );
      if (conflit) datesConflit.push(dateStr);
      current.setDate(current.getDate() + 1);
    }
    if (datesConflit.length > 0) {
      toast({
        title: "Conflit de dates",
        description: `Impossible d'enregistrer. Les dates suivantes sont déjà prises : ${datesConflit.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Ajout de la ou des gardes pour chaque jour de la période
    current = new Date(startDate);
    while (current <= end) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      await addGarde(
        Number(selectedEnfant),
        Number(selectedGrandParent),
        dateStr
      );
      current.setDate(current.getDate() + 1);
    }

    toast({
      title: "Période de garde ajoutée",
      description: `Garde du ${format(startDate, "dd MMMM yyyy", { locale: fr })}${startDate.getTime() !== endDate.getTime() ? ` au ${format(endDate, "dd MMMM yyyy", { locale: fr })}` : ''} enregistrée`
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Ajouter un jour de garde" />
      
      <div className="px-4 py-6">
        <Card className="p-6 bg-childcare-cream border-0">
          <h2 className="text-lg font-medium text-primary mb-6">
            Nouvelle journée de garde
            {enfants.length === 1 || selectedEnfant ? ` pour ${enfants.find(e => e.id.toString() === (selectedEnfant || (enfants[0]?.id?.toString() || "")))?.nom || ''}` : ''}
            {grandsParents.length === 1 || selectedGrandParent ? ` chez ${grandsParents.find(gp => gp.id.toString() === (selectedGrandParent || (grandsParents[0]?.id?.toString() || "")))?.nom || ''}` : ''}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="enfant">Enfant</Label>
              {enfants.length === 1 ? (
                <div className="px-3 py-2 bg-background rounded border border-input">{enfants[0].nom}</div>
              ) : (
                <Select value={selectedEnfant} onValueChange={setSelectedEnfant} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choisir l'enfant" />
                  </SelectTrigger>
                  <SelectContent>
                    {enfants.map((enfant) => (
                      <SelectItem key={enfant.id} value={enfant.id.toString()}>{enfant.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grandparent">Grand-parent</Label>
              {grandsParents.length === 1 ? (
                <div className="px-3 py-2 bg-background rounded border border-input">{grandsParents[0].nom}</div>
              ) : (
                <Select value={selectedGrandParent} onValueChange={setSelectedGrandParent} required>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Choisir le grand-parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {grandsParents.map((gp) => (
                      <SelectItem key={gp.id} value={gp.id.toString()}>{gp.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Popover open={openStart} onOpenChange={setOpenStart}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner la date de début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setOpenStart(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Date de fin</Label>
              <Popover open={openEnd} onOpenChange={setOpenEnd}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd MMMM yyyy", { locale: fr }) : "Sélectionner la date de fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate || startDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setOpenEnd(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button type="submit" className="flex-1">
                Enregistrer
              </Button>
            </div>
          </form>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default AjouterGarde;