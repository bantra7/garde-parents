import ChildcareHeader from "@/components/ChildcareHeader";
import ChildProfile from "@/components/ChildProfile";
import ActionCard from "@/components/ActionCard";
import MonthlySummary from "@/components/MonthlySummary";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import calendarIcon from "@/assets/calendar-icon.png";
import plantIcon from "@/assets/plant-icon.png";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Index = () => {
  const navigate = useNavigate();
  const { getEnfants, getGrandsParents, getGardes, isReady } = useDatabase();
  const [enfants, setEnfants] = useState<any[]>([]);
  const [grandsParents, setGrandsParents] = useState<any[]>([]);
  const [gardes, setGardes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isReady) {
        const enfantsData = await getEnfants();
        const grandsParentsData = await getGrandsParents();
        const gardesData = await getGardes();
        setEnfants(enfantsData);
        setGrandsParents(grandsParentsData);
        setGardes(gardesData);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  // Get first child or default values
  const firstChild = enfants[0];
  const childName = firstChild?.nom || "Aucun enfant";
  const childAge = firstChild ? `${firstChild.age} an${firstChild.age > 1 ? 's' : ''}` : "";
  const childPhoto = firstChild?.photo_url;

  // Définir la période par défaut : premier et dernier jour du mois en cours
  const now = new Date();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({
    from: startOfMonth(now),
    to: endOfMonth(now),
  });
  const [openRange, setOpenRange] = useState(false);

  // Calcul des jours de garde pour chaque grand-parent sur la période sélectionnée
  const grandsParentsSummary = useMemo(() => grandsParents.map(gp => {
    const days =
      dateRange.from && dateRange.to
        ? gardes.filter(g => {
            const d = new Date(g.date);
            return d >= dateRange.from! && d <= dateRange.to! && g.grand_parent_id === gp.id;
          }).length
        : 0;
    return { name: gp.nom, days, couleur: gp.couleur };
  }), [grandsParents, gardes, dateRange.from, dateRange.to]);

  // Données pour le camembert, mémorisées
  const pieData = useMemo(() => {
    const total = grandsParentsSummary.reduce((sum, gp) => sum + gp.days, 0);
    if (total === 0) return [];
    return grandsParentsSummary.map(gp => ({
      name: gp.name,
      value: Math.round((gp.days / total) * 100),
      color: gp.couleur || "#8884d8"
    }));
  }, [grandsParentsSummary]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Accueil" />
      
      <ChildProfile 
        name={childName} 
        age={childAge}
        photoUrl={childPhoto}
      />
      
      <div className="px-4 space-y-4">
        <h2 className="text-lg font-medium text-primary mb-4 text-left">Actions</h2>
        
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
        <h2 className="text-lg font-medium text-primary mb-4 text-left">Résumé</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Date range picker */}
          <div className="flex-1">
            <Popover open={openRange} onOpenChange={setOpenRange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !(dateRange.from && dateRange.to) && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "dd MMMM yyyy", { locale: fr })} - ${format(dateRange.to, "dd MMMM yyyy", { locale: fr })}`
                    : "Sélectionner une plage de dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  className="pointer-events-auto"
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {/* Camembert des pourcentages de gardes + légende à droite */}
        {pieData.length > 0 && (
          <div className="w-full flex justify-center mb-6 gap-8 flex-col md:flex-row md:items-center">
            <div style={{ minWidth: 320, width: "100%", maxWidth: 400, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 min-w-[140px] md:items-start items-center md:mt-0 mt-4">
              {pieData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border border-black" style={{ background: entry.color }} />
                  <span className="text-sm text-primary font-medium">{entry.name}</span>
                  <span className="text-sm text-muted-foreground font-semibold">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MonthlySummary grandsParents={grandsParentsSummary} startDate={dateRange.from} endDate={dateRange.to} />
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Index;
