import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export function PricingSection() {
  const plans = [
    {
      name: 'Basic',
      price: '$9.99',
      description: '/ Per user Month',
      features: [
        'Up to 10 User',
        'Basic task management',
        'Simple calendar view'
      ]
    },
    {
      name: 'Pro',
      price: '$19.99',
      description: '/ Per user Month',
      features: [
        'Up to 50 users',
        'Advanced task management',
        'Team calendar & planning',
        'Role-based access control'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Contact us for pricing',
      features: [
        'Unlimited users',
        'Custom integrations',
        'Advanced analytics',
        'Dedicated support'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-navy-900 text-3xl font-bold md:text-4xl">
            We offer great price plans for the application
          </h2>
          <p className="mx-auto max-w-[800px] text-gray-600">
            Objectively market-driven intellectual capital rather than covalent
            best practices facilitate strategic information before innovation.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'bg-navy-900 scale-105 text-white shadow-lg'
                  : 'bg-white'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription
                  className={
                    plan.highlighted ? 'text-gray-300' : 'text-gray-500'
                  }
                >
                  {plan.description}
                </CardDescription>
                <div className="mt-4 text-3xl font-bold">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'text-navy-900 bg-white hover:bg-gray-100'
                      : 'bg-navy-900 hover:bg-navy-800 text-white'
                  }`}
                >
                  Choose Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
