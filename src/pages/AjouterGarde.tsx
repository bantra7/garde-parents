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
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const AjouterGarde = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [caregiver, setCaregiver] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !caregiver || !startTime || !endTime) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Jour de garde ajouté",
      description: `Garde chez ${caregiver} le ${format(date, "dd MMMM yyyy", { locale: fr })} enregistrée`
    });

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Ajouter un jour de garde" />
      
      <div className="px-4 py-6">
        <Card className="p-6 bg-childcare-cream border-0">
          <h2 className="text-lg font-medium text-primary mb-6">Nouvelle journée de garde pour Léo</h2>
          
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Heure de début</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">Heure de fin</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
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