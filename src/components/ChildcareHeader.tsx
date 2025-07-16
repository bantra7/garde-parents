import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChildcareHeaderProps {
  title: string;
}

const ChildcareHeader = ({ title }: ChildcareHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-background">
      <h1 className="text-lg font-medium text-primary">{title}</h1>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default ChildcareHeader;