import { CheckCircle, Circle } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  status: 'inactive' | 'active' | 'completed';
}

interface ProgressTrackerProps {
  sections: Section[];
  currentSection: string;
  onSelectSection: (section: Section) => void;
  progress: number;
}

export default function ProgressTracker({
  sections,
  currentSection,
  onSelectSection,
  progress
}: ProgressTrackerProps) {
  return (
    <div className="w-full">
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div 
          className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* <div className="flex flex-col justify-between gap-2 md:flex-row">
        {sections.map((section, index) => {
          const isActive = section.id === currentSection;
          const isCompleted = section.status === 'completed';
          const isInactive = section.status === 'inactive';
          
          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section)}
              disabled={isInactive}
              className={`
                flex flex-1 items-center gap-2 rounded-lg px-4 py-3 
                text-left transition-all duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : isCompleted 
                    ? 'bg-white text-gray-700 hover:bg-gray-50' 
                    : 'bg-white text-gray-400 opacity-70'
                }
                ${isInactive ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                )}
              </div>
              
              <span className="flex items-center gap-1.5">
                <section.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`} />
                <span className="font-medium">{section.title}</span>
              </span>
              
              {index < sections.length - 1 && (
                <div className="hidden h-0.5 flex-1 bg-gray-200 md:block" />
              )}
            </button>
          );
        })}
      </div> */}
    </div>
  );
}