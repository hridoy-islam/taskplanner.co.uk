import { CalendarDays, Users2, Notebook } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Notebook,
      title: 'Smart Notes',
      description:
        'Create, organize, and share notes effortlessly. Keep all your ideas in one place.'
    },
    {
      icon: CalendarDays,
      title: 'Planner & Calendar',
      description:
        'Plan your tasks and events with an intuitive calendar interface. Stay on top of your schedule.'
    },
    {
      icon: Users2,
      title: 'Team Management',
      description:
        'Set up your company, add team members, and assign roles. Collaborate seamlessly across your organization.'
    }
  ];

  return (
    <section id="features" className="py-24">
      <div className="container">
        <h2 className="text-navy-900 mb-16 text-center text-3xl font-bold md:text-4xl">
          Key Features
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center rounded-lg border bg-white p-6 text-center"
            >
              <div className="bg-navy-900 mb-4 rounded-full p-3">
                <feature.icon className="h-6 w-6 text-white" />
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
