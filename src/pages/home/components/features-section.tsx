import notesLogo from '../../../assets/imges/home/logos/notes.svg';
import teamLogo from '../../../assets/imges/home/logos/team.svg';
import calendarLogo from '../../../assets/imges/home/logos/calender.svg';

export function FeaturesSection() {
  const features = [
    {
      icon: notesLogo,
      title: 'Smart Notes',
      description:
        'Create, organize, and share notes effortlessly. Keep all your ideas in one place.'
    },
    {
      icon: calendarLogo,
      title: 'Planner & Calendar',
      description:
        'Plan your tasks and events with an intuitive calendar interface. Stay on top of your schedule.'
    },
    {
      icon: teamLogo,
      title: 'Team Management',
      description:
        'Set up your company, add team members, and assign roles. Collaborate seamlessly across your organization.'
    }
  ];

  return (
    <section id="features" className="pb-24 pt-32">
      <div className="container">
        <h2 className="text-navy-900 mb-16 text-center text-3xl font-bold md:text-4xl">
          Key Features
        </h2>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col rounded-lg border border-[#12141D1A] bg-white p-6"
            >
              <div className="bg-navy-900 mb-4 items-start rounded-full p-3">
                <img
                  src={feature.icon}
                  alt=""
                  className="h-[60px] w-[60px] text-white"
                />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
