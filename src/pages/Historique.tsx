import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Historique = () => {
  const navigate = useNavigate();
  const careHistory = [
    { id: 1, date: "15 juillet 2024", caregiver: "Mémé", duration: "8h30 - 17h00" },
    { id: 2, date: "12 juillet 2024", caregiver: "Pépé", duration: "9h00 - 16h30" },
    { id: 3, date: "10 juillet 2024", caregiver: "Mémé", duration: "8h00 - 17h30" },
    { id: 4, date: "8 juillet 2024", caregiver: "Pépé", duration: "8h30 - 16h00" },
    { id: 5, date: "5 juillet 2024", caregiver: "Mémé", duration: "9h00 - 17h00" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Historique" />
      
      <div className="px-4 py-6">
        <h2 className="text-lg font-medium text-primary mb-6">Jours de garde précédents</h2>
        
        <div className="space-y-4">
          {careHistory.map((entry) => (
            <Card key={entry.id} className="p-4 bg-childcare-cream border-0">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-nav-active mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-primary mb-1">{entry.date}</p>
                  <p className="text-sm text-text-secondary mb-2">Garde chez {entry.caregiver}</p>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock className="h-3 w-3" />
                    <span>{entry.duration}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                  onClick={() => navigate(`/modifier-garde/${entry.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Historique;