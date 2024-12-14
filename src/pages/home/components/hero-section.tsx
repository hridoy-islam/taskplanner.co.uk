import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import dashboardPreview from '../../../assets/imges/home/dashbaord_preview.png';
import bannerBg from '../../../assets/imges/home/banner_bg.png';
import arrowRight from '../../../assets/imges/home/arrow-right.png';

export function HeroSection() {
  return (
    <section
      style={{ backgroundImage: `url(${bannerBg})` }}
      className="relative py-16 md:py-20"
    >
      {/* <div className="bg-grid-white/[0.05] absolute inset-0 bg-[size:16px]" /> */}
      <div className="container relative h-[440px] md:h-[850px]">
        <div className="space-y-8 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl lg:text-7xl">
            TaskPlanner brings all your task,
            <br />
            Teammates together
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-gray-300 md:text-xl">
            Streamline your workflow, collaborate effortlessly, and boost
            productivity with our comprehensive task management solution.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="text-navy-900 relative rounded-full bg-white hover:bg-gray-100"
            >
              Get Started
              <img
                src={arrowRight}
                alt=""
                className="absolute right-[-20px] ml-2 h-[38px] w-[38px] rounded-full bg-[#1876FB]"
              />
            </Button>
          </div>
        </div>
      </div>
      <div className="container absolute top-[400px] mx-auto mt-16 w-full rounded-lg">
        <img
          src={dashboardPreview}
          alt="Dashboard Preview"
          height={564}
          className="hidden w-full rounded-lg shadow-lg md:block"
        />
      </div>
    </section>
  );
}
