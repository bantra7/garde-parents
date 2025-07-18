interface MonthlySummaryProps {
  grandsParents: { name: string; days: number }[];
  startDate: Date;
  endDate: Date;
}

const MonthlySummary = ({ grandsParents, startDate, endDate }: MonthlySummaryProps) => {
  // La logique d'affichage reste inchangée ici, mais on pourra utiliser startDate et endDate dans le futur
  return (
    <div className="w-full flex justify-center px-4">
      <table className="min-w-[220px] max-w-sm w-full border-separate border-spacing-0 mx-auto">
        <tbody>
          {grandsParents.map((gp, idx) => (
            <tr key={gp.name + idx} className="border-b border-border last:border-b-0">
              <td className="py-2 pr-4 text-primary text-left whitespace-nowrap">{gp.name}</td>
              <td className="py-2 pl-4 text-text-secondary text-right w-24 whitespace-nowrap">{gp.days} jours</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySummary;