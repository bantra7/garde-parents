import leoAvatar from "@/assets/leo-avatar.png";

interface ChildProfileProps {
  name: string;
  age: string;
  photoUrl?: string;
}

const ChildProfile = ({ name, age, photoUrl }: ChildProfileProps) => {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-20 h-20 rounded-full bg-childcare-cream overflow-hidden mb-4">
        <img 
          src={photoUrl || leoAvatar} 
          alt={`Profile de ${name}`}
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-1">{name}</h2>
      <p className="text-text-secondary text-sm">{age}</p>
    </div>
  );
};

export default ChildProfile;