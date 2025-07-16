interface MonthlySummaryProps {
  grandmaName: string;
  grandmaDays: number;
  grandpaName: string;
  grandpaDays: number;
}

const MonthlySummary = ({ grandmaName, grandmaDays, grandpaName, grandpaDays }: MonthlySummaryProps) => {
  return (
    <div className="px-4 py-6">
      <h3 className="text-lg font-medium text-primary mb-4">Résumé du mois</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-primary">{grandmaName}</span>
          <span className="text-text-secondary">{grandmaDays} jours</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-primary">{grandpaName}</span>
          <span className="text-text-secondary">{grandpaDays} jours</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;