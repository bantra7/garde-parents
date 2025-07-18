import ChildcareHeader from "@/components/ChildcareHeader";
import BottomNavigation from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Dialog } from "@/components/ui/dialog";

const Historique = () => {
  const navigate = useNavigate();
  const { getGardes, getEnfantById, getGrandParentById, getEnfants, getGrandsParents, deleteGarde, addGarde } = useDatabase();
  const [gardes, setGardes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstChildName, setFirstChildName] = useState<string>("");
  const [grandParentDetails, setGrandParentDetails] = useState<Record<number, { nom: string; couleur?: string }>>({});
  const [calendarDialog, setCalendarDialog] = useState<null | { date: Date; garde?: any }>(null);
  const [addingGardeGpId, setAddingGardeGpId] = useState<number | null>(null);
  const [addingGardeLoading, setAddingGardeLoading] = useState(false);
  const [enfantsList, setEnfantsList] = useState<any[]>([]);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      const data = await getGardes();
      setGardes(data);
      // Précharger les noms d'enfants
      const enfantsListData = await getEnfants();
      setEnfantsList(enfantsListData);
      setFirstChildName(enfantsListData[0]?.nom || "");
      // Précharger les infos grands-parents
      const gps = await getGrandsParents();
      const gpMap: Record<number, { nom: string; couleur?: string }> = {};
      for (const gp of gps) {
        gpMap[gp.id] = { nom: gp.nom, couleur: gp.couleur };
      }
      setGrandParentDetails(gpMap);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suppression d'une garde
  const handleDeleteGarde = async (id: number) => {
    if (window.confirm("Supprimer ce jour de garde ?")) {
      await deleteGarde(id);
      setGardes(gardes => gardes.filter(g => g.id !== id));
    }
  };

  // Filtrage des gardes selon le mois/année sélectionnés
  const gardesFiltered = gardes.filter(g => {
    const d = new Date(g.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  // Regroupement par grand-parent
  const gardesByGP: Record<number, any[]> = {};
  gardesFiltered.forEach(g => {
    if (!gardesByGP[g.grand_parent_id]) gardesByGP[g.grand_parent_id] = [];
    gardesByGP[g.grand_parent_id].push(g);
  });

  // Calcule les jours du mois sélectionné
  const firstDay = startOfMonth(new Date(selectedYear, selectedMonth));
  const lastDay = endOfMonth(new Date(selectedYear, selectedMonth));
  const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });
  // Map des jours de garde : { 'YYYY-MM-DD': { couleur, grandParentId } }
  const gardeDays: Record<string, { couleur?: string; grandParentId: number }> = {};
  gardesFiltered.forEach(g => {
    gardeDays[g.date] = {
      couleur: grandParentDetails[g.grand_parent_id]?.couleur,
      grandParentId: g.grand_parent_id
    };
  });

  // Ajout d'une garde depuis le calendrier
  const handleAddGarde = async (date: Date, grandParentId: number) => {
    setAddingGardeLoading(true);
    try {
      await addGarde(
        enfantsList[0]?.id,
        grandParentId,
        format(date, "yyyy-MM-dd")
      );
      setCalendarDialog(null);
      setAddingGardeGpId(null);
      // Rafraîchir les gardes
      const data = await getGardes();
      setGardes(data);
    } finally {
      setAddingGardeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-3 md:h-0" />
      <ChildcareHeader title="Historique" />
      
      <div className="px-4 py-6">
        <h2 className="text-lg font-medium text-primary mb-4">
          Jours de garde précédents{firstChildName ? ` de ${firstChildName}` : ""}
        </h2>
        {/* Carousel mois/année */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            className="p-2 rounded-full hover:bg-accent"
            onClick={() => {
              if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(y => y - 1);
              } else {
                setSelectedMonth(m => m - 1);
              }
            }}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-background"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx}>{name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="border rounded px-2 py-1 bg-background"
            >
              {Array.from({ length: 10 }, (_, i) => now.getFullYear() - 5 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            className="p-2 rounded-full hover:bg-accent"
            onClick={() => {
              if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(y => y + 1);
              } else {
                setSelectedMonth(m => m + 1);
              }
            }}
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        {/* Légende grands-parents */}
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-center">
          {Object.entries(grandParentDetails).map(([gpId, gp]) => (
            <div key={gpId} className="flex items-center gap-2">
              <span className="font-medium text-primary">{gp.nom}</span>
              {gp.couleur && (
                <span
                  className="inline-block w-5 h-5 rounded-full border-2 border-black align-middle"
                  style={{ background: gp.couleur }}
                  title={`Couleur de ${gp.nom}`}
                />
              )}
            </div>
          ))}
        </div>
        {/* Vue calendaire */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-[350px] mx-auto border-separate border-spacing-1">
            <thead>
              <tr>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(j => (
                  <th key={j} className="text-xs text-center text-muted-foreground font-normal">{j}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil((daysInMonth[0].getDay() + daysInMonth.length - 1) / 7) }, (_, weekIdx) => {
                const week: Date[] = [];
                for (let d = 0; d < 7; d++) {
                  const dayIdx = weekIdx * 7 + d - ((daysInMonth[0].getDay() + 6) % 7);
                  week.push(daysInMonth[dayIdx]);
                }
                return (
                  <tr key={weekIdx}>
                    {week.map((day, idx) => {
                      const key = day ? format(day, "yyyy-MM-dd") : `empty-${idx}`;
                      const garde = day && gardeDays[key];
                      return (
                        <td key={key} className="text-center p-1">
                          {day && day.getMonth() === selectedMonth ? (
                            <span
                              className={`inline-block w-8 h-8 rounded-full text-sm leading-8 font-medium cursor-pointer ${garde ? '' : 'text-muted-foreground hover:bg-accent'}`}
                              style={garde && garde.couleur ? { background: garde.couleur, border: '2px solid black', color: '#fff' } : {}}
                              title={garde ? grandParentDetails[garde.grandParentId]?.nom : undefined}
                              onClick={() => setCalendarDialog({ date: day, garde })}
                            >
                              {day.getDate()}
                            </span>
                          ) : (
                            <span className="inline-block w-8 h-8" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Détails des gardes */}
        <h3 className="text-md font-semibold text-primary mb-4">Détails des gardes</h3>
        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-text-secondary">Chargement...</p>
          ) : (
            Object.entries(grandParentDetails).map(([gpId, gp]) => {
              const jours = gardesByGP[gpId] || [];
              return (
                <div key={gpId} className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-primary">{gp.nom}</span>
                    {gp.couleur && (
                      <span
                        className="inline-block w-4 h-4 rounded-full border-2 border-black align-middle"
                        style={{ background: gp.couleur }}
                        title={`Couleur de ${gp.nom}`}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    {jours.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Aucune garde ce mois-ci</div>
                    ) : (
                      jours.map((entry: any) => (
                        <Card key={entry.id} className="p-3 bg-childcare-cream border-0 flex items-center justify-between">
                          <span className="text-primary font-medium">
                            {format(new Date(entry.date), "dd-MM-yyyy")}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-nav-active hover:bg-nav-active/10"
                              onClick={() => navigate(`/modifier-garde/${entry.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteGarde(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <BottomNavigation />

      {/* Dialog pour interaction calendrier */}
      <Dialog open={!!calendarDialog} onOpenChange={open => !open && setCalendarDialog(null)}>
        {calendarDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
              <div className="mb-4">
                <span className="font-semibold text-primary">{format(calendarDialog.date, "dd-MM-yyyy")}</span>
              </div>
              {calendarDialog.garde ? (
                <>
                  <div className="mb-4">Garde : <span className="font-medium">{grandParentDetails[calendarDialog.garde.grandParentId]?.nom}</span></div>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        // Retrouver la garde exacte par date et grand_parent_id
                        const dateStr = format(calendarDialog.date, "yyyy-MM-dd");
                        const gardeToDelete = gardes.find(g => g.date === dateStr && g.grand_parent_id === calendarDialog.garde.grandParentId);
                        if (gardeToDelete) {
                          await deleteGarde(gardeToDelete.id);
                          setCalendarDialog(null);
                          const data = await getGardes();
                          setGardes(data);
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-2">Ajouter une garde ce jour :</div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(grandParentDetails).map(([gpId, gp]) => (
                      <Button
                        key={gpId}
                        variant={addingGardeGpId === Number(gpId) ? "default" : "outline"}
                        className="flex items-center gap-2"
                        disabled={addingGardeLoading}
                        onClick={() => {
                          setAddingGardeGpId(Number(gpId));
                          handleAddGarde(calendarDialog.date, Number(gpId));
                        }}
                      >
                        {gp.couleur && (
                          <span className="inline-block w-4 h-4 rounded-full border-2 border-black align-middle" style={{ background: gp.couleur }} />
                        )}
                        {gp.nom}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-4 text-right">
                <Button variant="ghost" onClick={() => setCalendarDialog(null)}>Fermer</Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Historique;