import React from "react";
import { PricingSection } from "../home/components/pricing-section";

const plans = [
  {
    title: "Free",
    price: "$0",
    description: "Perfect for individuals just getting started.",
    features: [
      "1 Project",
      "Basic Support",
      "Community Access",
    ],
    button: "Get Started",
  },
  {
    title: "Pro",
    price: "$29/mo",
    description: "Great for freelancers or small teams.",
    features: [
      "10 Projects",
      "Priority Support",
      "Advanced Analytics",
    ],
    button: "Upgrade",
    highlighted: true,
  },
  {
    title: "Enterprise",
    price: "Contact Us",
    description: "Custom solutions for larger organizations.",
    features: [
      "Unlimited Projects",
      "Dedicated Support",
      "Custom Integrations",
    ],
    button: "Contact Sales",
  },
];

export default function PricingPage  () {
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      
      <PricingSection />
    </div>
  );
};


