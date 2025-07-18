import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const ModifierGarde = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState<Date>();
  const [caregiver, setCaregiver] = useState("");
  const [duration, setDuration] = useState("");

  // Simulated data - in a real app this would come from an API
  const careHistory = [
    { id: 1, date: "2024-07-15", caregiver: "Mémé", duration: "8h30 - 17h00" },
    { id: 2, date: "2024-07-12", caregiver: "Pépé", duration: "9h00 - 16h30" },
    { id: 3, date: "2024-07-10", caregiver: "Mémé", duration: "8h00 - 17h30" },
    { id: 4, date: "2024-07-08", caregiver: "Pépé", duration: "8h30 - 16h00" },
    { id: 5, date: "2024-07-05", caregiver: "Mémé", duration: "9h00 - 17h00" },
  ];

  useEffect(() => {
    if (id) {
      const entry = careHistory.find(item => item.id === parseInt(id));
      if (entry) {
        setDate(new Date(entry.date));
        setCaregiver(entry.caregiver);
        setDuration(entry.duration);
      }
    }
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !caregiver || !duration) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Garde modifiée",
      description: `Garde chez ${caregiver} le ${format(date, "dd MMMM yyyy", { locale: fr })} mise à jour`
    });

    navigate("/historique");
  };

  const handleDelete = () => {
    toast({
      title: "Garde supprimée",
      description: "La garde a été supprimée avec succès"
    });
    navigate("/historique");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Modifier la garde" />
      
      <div className="px-4 py-6">
        <Card className="p-6 bg-childcare-cream border-0">
          <h2 className="text-lg font-medium text-primary mb-6">Modifier la journée de garde</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date de garde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caregiver">Gardien</Label>
              <Select value={caregiver} onValueChange={setCaregiver}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choisir le gardien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mémé">Mémé</SelectItem>
                  <SelectItem value="Pépé">Pépé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Horaires</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="ex: 8h30 - 17h00"
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/historique")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                className="flex-1"
              >
                Supprimer
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

export default ModifierGarde;