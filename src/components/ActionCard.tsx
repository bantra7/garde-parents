import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
}

const ActionCard = ({ title, description, icon, onClick }: ActionCardProps) => {
  return (
    <Card 
      className="p-4 bg-childcare-cream border-0 cursor-pointer hover:bg-childcare-warm transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-medium text-primary mb-1">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
        <div className="w-12 h-12 flex-shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default ActionCard;