import ChildcareHeader from "@/components/ChildcareHeader";
import ChildProfile from "@/components/ChildProfile";
import ActionCard from "@/components/ActionCard";
import MonthlySummary from "@/components/MonthlySummary";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import calendarIcon from "@/assets/calendar-icon.png";
import plantIcon from "@/assets/plant-icon.png";

const Index = () => {
  const navigate = useNavigate();
  const { getEnfants, getGrandsParents, isReady } = useDatabase();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [grandsParents, setGrandsParents] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isReady) {
        const enfantsData = await getEnfants();
        const grandsParentsData = await getGrandsParents();
        setEnfants(enfantsData);
        setGrandsParents(grandsParentsData);
      }
    };
    fetchData();
  }, [isReady, getEnfants, getGrandsParents]);

  // Get first child or default values
  const firstChild = enfants[0];
  const childName = firstChild?.nom || "Aucun enfant";
  const childAge = firstChild ? `${firstChild.age} an${firstChild.age > 1 ? 's' : ''}` : "";
  const childPhoto = firstChild?.photo_url;

  // Calculate days for grands parents (mock data for now)
  const grandMere = grandsParents.find(gp => gp.role === 'grand-mere');
  const grandPere = grandsParents.find(gp => gp.role === 'grand-pere');

  return (
    <div className="min-h-screen bg-background pb-20">
      <ChildcareHeader title="Accueil" />
      
      <ChildProfile 
        name={childName} 
        age={childAge}
        photoUrl={childPhoto}
      />
      
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-medium text-primary mb-4">Actions</h2>
        
        <ActionCard
          title="Ajouter un jour de garde"
          description={firstChild ? `Enregistrer une nouvelle journée de garde pour ${firstChild.nom}.` : "Enregistrer une nouvelle journée de garde."}
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
        grandmaName={grandMere?.nom || "Grand-mère"}
        grandmaDays={12}
        grandpaName={grandPere?.nom || "Grand-père"}
        grandpaDays={8}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
