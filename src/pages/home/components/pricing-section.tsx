
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PricingSection({ id }: { id: string }) {
  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      description: "/ Per user Month",
      features: ["Up to 10 User", "Basic task management", "Simple calendar view", "Email support"],
    },
    {
      name: "Pro",
      price: "$19.99",
      description: "/ Per user Month",
      features: [
        "Up to 50 users",
        "Advanced task management",
        "Team calendar & planning",
        "Role-based access control",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Contact us for pricing",
      features: [
        "Unlimited users",
        "Custom integrations",
        "Advanced analytics",
        "Dedicated support",
        "SLA guarantees",
        "Custom training",
      ],
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <section id={id} className="bg-white py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-taskplanner text-3xl font-bold leading-tight md:text-5xl">
            We offer great price plans for the application
          </h2>
          <p className="mx-auto mt-4 max-w-[800px] text-gray-600">
            Objectively market-driven intellectual capital rather than covalent best practices facilitate strategic
            information before innovation.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={{
                y: -10,
                transition: { duration: 0.3 },
              }}
            >
              <Card
                className={`relative h-full ${
                  plan.highlighted ? "bg-taskplanner text-white shadow-xl" : "bg-white border-2 border-gray-100"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-black px-4 py-1 text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className={plan.highlighted ? "text-gray-300" : "text-gray-500"}>
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4 text-3xl font-bold">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <div
                          className={`mr-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted ? "bg-white text-taskplanner" : "bg-[#1876FB] text-white"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-white text-[taskplanner] hover:bg-gray-200 text-black"
                        : "bg-white text-taskplanner border border-taskplanner hover:bg-taskplanner hover:text-white"
                    }`}
                  >
                    Choose Plan
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
