import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';

export function SiteFooter() {
  return (
    <footer className="bg-white  ">
      <div className="container space-y-8 ">
        <div className="space-y-4 pb-40 text-center">
          <h3 className="pb-8 text-5xl font-bold text-taskplanner">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600">
            Join thousands of teams already using TaskPlanner to boost their
            productivity.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className=" bg-white border-gray-200 text-taskplanner hover:bg-taskplanner hover:text-[#fff]"
            >
              Sign Up Now
            </Button>
            <Button variant={'outline'} className="bg-taskplanner border-gray-200 text-white">
              Request Demo
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F9FB]">
      <div className="container mx-auto px-4 py-8">
        {/* Grid layout */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Subscribe Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Subscribe</h4>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto"
              />
              <button className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto">
                Send →
              </button>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-1 sm:gap-0 sm:space-y-2">
              <li className="cursor-pointer hover:text-blue-600">About Us</li>
              <li className="cursor-pointer hover:text-blue-600">Blog</li>
              <li className="cursor-pointer hover:text-blue-600">Contact</li>
              <li className="cursor-pointer hover:text-blue-600">FAQ</li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Us</h4>
            <div className="text-sm text-gray-600">
              <p className="hover:text-blue-600">123 Business Street</p>
              <p className="hover:text-blue-600">New York, NY 10001</p>
              <p className="cursor-pointer hover:text-blue-600">contact@taskplanner.com</p>
            </div>
          </div>

          {/* Get the App Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Get the app</h3>
            <div className="flex flex-col gap-3">
              <Button className="h-14 bg-taskplanner hover:bg-taskplanner/90 text-white sm:h-16">
                <div className="flex items-center">
                  <img
                    src={appleLogo}
                    alt="App Store"
                    width={16}
                    height={16}
                  />
                  <div className="mx-3 h-6 border-l border-[#0e3261]"></div>
                  <div className="flex flex-col items-start">
                    <p className="text-xs font-normal sm:text-sm">Download on the</p>
                    <p className="text-sm font-bold sm:text-base">App Store</p>
                  </div>
                </div>
              </Button>
              <Button className="h-14 bg-taskplanner hover:bg-taskplanner/90 text-white sm:h-16">
                <div className="flex items-center">
                  <img
                    src={playstoreLogo}
                    alt="Google Play"
                    width={16}
                    height={16}
                  />
                  <div className="mx-3 h-6 border-l border-[#0e3261]"></div>
                  <div className="flex flex-col items-start">
                    <p className="text-xs font-normal sm:text-sm">Get it on</p>
                    <p className="text-sm font-bold sm:text-base">Google Play</p>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-5 text-center text-sm text-gray-600">
          <p>© 2024 TaskPlanner. All rights reserved.</p>
        </div>
      </div>
    </div>
    </footer>
  );
}
