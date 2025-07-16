import ChildcareHeader from "@/components/ChildcareHeader";
import ChildProfile from "@/components/ChildProfile";
import ActionCard from "@/components/ActionCard";
import MonthlySummary from "@/components/MonthlySummary";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import calendarIcon from "@/assets/calendar-icon.png";
import plantIcon from "@/assets/plant-icon.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Accueil" />
      
      <ChildProfile name="Léo" age="1 an" />
      
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-medium text-primary mb-4">Actions</h2>
        
        <ActionCard
          title="Ajouter un jour de garde"
          description="Enregistrer une nouvelle journée de garde pour Léo."
          icon={<img src={calendarIcon} alt="Calendrier" className="w-full h-full object-contain" />}
          onClick={() => navigate("/ajouter")}
        />
        
        <ActionCard
          title="Consulter l'historique"
          description="Voir les jours de garde précédents."
          icon={<img src={plantIcon} alt="Historique" className="w-full h-full object-contain" />}
          onClick={() => navigate("/historique")}
        />
      </div>
      
      <MonthlySummary
        grandmaName="Mémé"
        grandmaDays={12}
        grandpaName="Pépé"
        grandpaDays={8}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
