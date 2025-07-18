import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChildProfileProps {
  name: string;
  age: string;
  photoUrl?: string;
}

const ChildProfile = ({ name, age, photoUrl }: ChildProfileProps) => {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-20 h-20 rounded-full bg-childcare-cream overflow-hidden mb-4 flex items-center justify-center">
        <Avatar className="w-20 h-20">
          {photoUrl ? (
            <AvatarImage src={photoUrl} alt={`Profile de ${name}`} className="w-full h-full object-cover" />
          ) : (
            <AvatarFallback className="w-full h-full text-4xl">👤</AvatarFallback>
          )}
        </Avatar>
      </div>
      <h2 className="text-xl font-semibold text-primary mb-1">{name}</h2>
      <p className="text-text-secondary text-sm">{age}</p>
    </div>
  );
};

export default ChildProfile;