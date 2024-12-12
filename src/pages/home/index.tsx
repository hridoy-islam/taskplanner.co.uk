import { SiteHeader } from './components/site-header';
import { HeroSection } from './components/hero-section';
import { LogosSection } from './components/logos-section';
import { FeaturesSection } from './components/features-section';
import { AppPreviewSection } from './components/app-preview-section';
import { PricingSection } from './components/pricing-section';
import { SiteFooter } from './components/site-footer';
import HowItWorkSection from './components/how-it-work-section';

export default function HomePage() {
  return (
    // <div className="flex min-h-screen flex-col">

    //   <main className="flex-1">
    //     <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
    //       <div className="container px-4 md:px-6">
    //         <div className="flex flex-col items-center space-y-4 text-center">
    //           <div className="space-y-2">
    //             <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
    //               Manage Tasks with Ease
    //             </h1>
    //             <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
    //               Streamline your workflow, collaborate effortlessly, and boost
    //               productivity with our comprehensive task management solution.
    //             </p>
    //           </div>
    //           <div className="space-x-4">
    //             <Button>Get Started</Button>
    //             <Button variant="outline" className="text-white">
    //               Learn More
    //             </Button>
    //           </div>
    //         </div>
    //       </div>
    //     </section>
    //     <section
    //       id="features"
    //       className="w-full bg-gray-100 py-12 md:py-24 lg:py-32"
    //     >
    //       <div className="container px-4 md:px-6">
    //         <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
    //           Key Features
    //         </h2>
    //         <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
    //           <Card>
    //             <CardHeader>
    //               <ClipboardList className="mb-2 h-10 w-10" />
    //               <CardTitle>Smart Notes</CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               Create, organize, and share notes effortlessly. Keep all your
    //               ideas in one place.
    //             </CardContent>
    //           </Card>
    //           <Card>
    //             <CardHeader>
    //               <Calendar className="mb-2 h-10 w-10" />
    //               <CardTitle>Planner & Calendar</CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               Plan your tasks and events with an intuitive calendar
    //               interface. Stay on top of your schedule.
    //             </CardContent>
    //           </Card>
    //           <Card>
    //             <CardHeader>
    //               <Users className="mb-2 h-10 w-10" />
    //               <CardTitle>Team Management</CardTitle>
    //             </CardHeader>
    //             <CardContent>
    //               Set up your company, add team members, and assign roles.
    //               Collaborate seamlessly across your organization.
    //             </CardContent>
    //           </Card>
    //         </div>
    //       </div>
    //     </section>
    //     <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
    //       <div className="container px-4 md:px-6">
    //         <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
    //           How It Works
    //         </h2>
    //         <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
    //           <div className="flex flex-col items-center text-center">
    //             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background text-white">
    //               1
    //             </div>
    //             <h3 className="mb-2 text-xl font-bold">
    //               Set Up Your Workspace
    //             </h3>
    //             <p className="text-gray-500 dark:text-gray-400">
    //               Create your company profile and invite team members.
    //             </p>
    //           </div>
    //           <div className="flex flex-col items-center text-center">
    //             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background text-white">
    //               2
    //             </div>
    //             <h3 className="mb-2 text-xl font-bold">
    //               Create and Assign Tasks
    //             </h3>
    //             <p className="text-gray-500 dark:text-gray-400">
    //               Add tasks, set deadlines, and assign them to team members.
    //             </p>
    //           </div>
    //           <div className="flex flex-col items-center text-center">
    //             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background text-white">
    //               3
    //             </div>
    //             <h3 className="mb-2 text-xl font-bold">Track Progress</h3>
    //             <p className="text-gray-500 dark:text-gray-400">
    //               Monitor task completion and team productivity in real-time.
    //             </p>
    //           </div>
    //         </div>
    //       </div>
    //     </section>
    //     <section
    //       id="pricing"
    //       className="w-full bg-gray-100 py-12 md:py-24 lg:py-32 "
    //     >
    //       <div className="container px-4 md:px-6">
    //         <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
    //           Pricing Plans
    //         </h2>
    //         <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Basic</CardTitle>
    //               <CardDescription>
    //                 For individuals and small teams
    //               </CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="mb-2 text-4xl font-bold">$9.99</div>
    //               <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
    //                 per user / month
    //               </div>
    //               <ul className="space-y-2">
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Up to 10 users
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Basic task management
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Simple calendar view
    //                 </li>
    //               </ul>
    //             </CardContent>
    //             <CardFooter>
    //               <Button variant={'outline'} className="w-full">
    //                 Choose Plan
    //               </Button>
    //             </CardFooter>
    //           </Card>
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Pro</CardTitle>
    //               <CardDescription>For growing businesses</CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="mb-2 text-4xl font-bold">$19.99</div>
    //               <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
    //                 per user / month
    //               </div>
    //               <ul className="space-y-2">
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Up to 50 users
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Advanced task management
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Team calendar & planning
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Role-based access control
    //                 </li>
    //               </ul>
    //             </CardContent>
    //             <CardFooter>
    //               <Button variant={'outline'} className="w-full">
    //                 Choose Plan
    //               </Button>
    //             </CardFooter>
    //           </Card>
    //           <Card>
    //             <CardHeader>
    //               <CardTitle>Enterprise</CardTitle>
    //               <CardDescription>For large organizations</CardDescription>
    //             </CardHeader>
    //             <CardContent>
    //               <div className="mb-2 text-4xl font-bold">Custom</div>
    //               <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
    //                 Contact us for pricing
    //               </div>
    //               <ul className="space-y-2">
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Unlimited users
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Custom integrations
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Advanced analytics
    //                 </li>
    //                 <li className="flex items-center">
    //                   <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
    //                   Dedicated support
    //                 </li>
    //               </ul>
    //             </CardContent>
    //             <CardFooter>
    //               <Button variant={'outline'} className="w-full">
    //                 Contact Sales
    //               </Button>
    //             </CardFooter>
    //           </Card>
    //         </div>
    //       </div>
    //     </section>
    //     <section className="w-full py-12 md:py-24 lg:py-32">
    //       <div className="container px-4 md:px-6">
    //         <div className="flex flex-col items-center space-y-4 text-center">
    //           <div className="space-y-2">
    //             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
    //               Ready to Get Started?
    //             </h2>
    //             <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
    //               Join thousands of teams already using TaskMaster to boost
    //               their productivity.
    //             </p>
    //           </div>
    //           <div className="space-x-4">
    //             <Button size="lg">Sign Up Now</Button>
    //             <Button size="lg" variant="outline">
    //               Request Demo
    //             </Button>
    //           </div>
    //         </div>
    //       </div>
    //     </section>
    //   </main>
    //   <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-gray-300 px-4 py-6 sm:flex-row md:px-6">
    //     <p className="text-xs text-gray-500 dark:text-gray-400">
    //       © 2024 Task Planner. All rights reserved.
    //     </p>
    //     <nav className="flex gap-4 sm:ml-auto sm:gap-6">
    //       <Link className="text-xs underline-offset-4 hover:underline" to="/">
    //         Terms of Service
    //       </Link>
    //       <Link className="text-xs underline-offset-4 hover:underline" to="/">
    //         Privacy
    //       </Link>
    //     </nav>
    //   </footer>
    // </div>

    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-white">
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <AppPreviewSection />
        <HowItWorkSection />
        <PricingSection />
      </main>
      <SiteFooter />
    </div>
  );
}
