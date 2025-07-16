import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

const Historique = () => {
  const careHistory = [
    { date: "15 juillet 2024", caregiver: "Mémé", duration: "8h30 - 17h00" },
    { date: "12 juillet 2024", caregiver: "Pépé", duration: "9h00 - 16h30" },
    { date: "10 juillet 2024", caregiver: "Mémé", duration: "8h00 - 17h30" },
    { date: "8 juillet 2024", caregiver: "Pépé", duration: "8h30 - 16h00" },
    { date: "5 juillet 2024", caregiver: "Mémé", duration: "9h00 - 17h00" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Historique" />
      
      <div className="px-4 py-6">
        <h2 className="text-lg font-medium text-primary mb-6">Jours de garde précédents</h2>
        
        <div className="space-y-4">
          {careHistory.map((entry, index) => (
            <Card key={index} className="p-4 bg-childcare-cream border-0">
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