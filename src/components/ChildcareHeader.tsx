interface ChildcareHeaderProps {
  title: string;
}

const ChildcareHeader = ({ title }: ChildcareHeaderProps) => {
  return (
    <header className="flex items-center justify-center p-4 bg-background">
      <h1 className="text-lg font-medium text-primary">{title}</h1>
    </header>
  );
};

export default ChildcareHeader;