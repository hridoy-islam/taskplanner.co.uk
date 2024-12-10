import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';

export function SiteFooter() {
  return (
    <footer className="py-12 md:py-24">
      <div className="container space-y-8">
        <div className="space-y-4 pb-24 text-center">
          <h3 className="pb-8 text-5xl font-bold text-[#00214C]">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600">
            Join thousands of teams already using TaskPlanner to boost their
            productivity.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className=" bg-white text-[#00214C] hover:bg-[#00214C] hover:text-[#fff]"
            >
              Sign Up Now
            </Button>
            <Button variant={'outline'} className="bg-[#00214C] text-white">
              Request Demo
            </Button>
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Subscribe</h4>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" type="email" />
              <Button className="rounded-full bg-[#00214C] text-white">
                Send{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="ml-1 size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>About Us</li>
              <li>Blog</li>
              <li>Contact</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Contact Us</h4>
            <div className="text-sm text-gray-600">
              <p>123 Business Street</p>
              <p>New York, NY 10001</p>
              <p>contact@taskplanner.com</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Get the app</h3>
            <div className="flex flex-col gap-8">
              <Button className="hover:bg-navy-800 h-14 w-[210px] rounded-[12px] bg-[#00214C] px-6 text-white">
                <img
                  src={appleLogo}
                  alt="App Store"
                  width={20}
                  height={24}
                  className="mr-2"
                />
                <div className="border-r-1 mx-4 h-10 border border-[#0e3261]"></div>

                <div className="flex flex-col items-start">
                  <p className="font-normal">Download on the</p>
                  <p className="font-bold"> App Store</p>
                </div>
              </Button>
              <Button className="hover:bg-navy-800 h-14 w-[210px] rounded-[12px] bg-[#00214C] px-6 text-white">
                <img
                  src={playstoreLogo}
                  alt="App Store"
                  width={20}
                  height={24}
                  className="mr-2"
                />
                <div className="border-r-1 mx-4 h-10 border border-[#0e3261]"></div>

                <div className="flex w-full flex-col items-start">
                  <p className="font-normal">Get it on</p>
                  <p className="font-bold"> Google Play</p>
                </div>
              </Button>
            </div>
          </div>
          {/* <div className="space-y-4">
            <h4 className="text-sm font-semibold">Get the app</h4>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start">
                App Store
              </Button>
              <Button variant="outline" className="justify-start">
                Google Play
              </Button>
            </div>
          </div> */}
        </div>
        <div className="text-center text-sm text-gray-600">
          <p>© 2024 TaskPlanner. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
