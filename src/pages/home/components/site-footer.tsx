import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';

export function SiteFooter() {
  return (
    <footer className="bg-white pt-12 md:pt-32">
      <div className="container space-y-8 ">
        <div className="space-y-4 pb-40 text-center">
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
      </div>

      <div className="bg-[#F9F9FB] pt-11">
        <div className="container">
          <div className="flex items-center justify-center gap-8 pb-28">
            <p>Follow Us</p>
            <div className="flex items-center gap-5">
              {/* fb */}
              <svg fill="none" viewBox="0 0 24 24" height="15px" width="15px">
                <path
                  fill="currentColor"
                  d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 011-1h3v-4h-3a5 5 0 00-5 5v2.01h-2l-.396 3.98h2.396v8.01z"
                />
              </svg>
              {/* twitter */}
              <svg
                viewBox="0 0 1024 1024"
                fill="currentColor"
                height="15px"
                width="15px"
              >
                <path d="M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0075-94 336.64 336.64 0 01-108.2 41.2A170.1 170.1 0 00672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 00-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 01-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 01-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z" />
              </svg>
              {/* instagram */}
              <svg
                viewBox="0 0 1024 1024"
                fill="currentColor"
                height="15px"
                width="15px"
              >
                <path d="M512 306.9c-113.5 0-205.1 91.6-205.1 205.1S398.5 717.1 512 717.1 717.1 625.5 717.1 512 625.5 306.9 512 306.9zm0 338.4c-73.4 0-133.3-59.9-133.3-133.3S438.6 378.7 512 378.7 645.3 438.6 645.3 512 585.4 645.3 512 645.3zm213.5-394.6c-26.5 0-47.9 21.4-47.9 47.9s21.4 47.9 47.9 47.9 47.9-21.3 47.9-47.9a47.84 47.84 0 00-47.9-47.9zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zm-88 235.8c-7.3 18.2-16.1 31.8-30.2 45.8-14.1 14.1-27.6 22.9-45.8 30.2C695.2 844.7 570.3 840 512 840c-58.3 0-183.3 4.7-235.9-16.1-18.2-7.3-31.8-16.1-45.8-30.2-14.1-14.1-22.9-27.6-30.2-45.8C179.3 695.2 184 570.3 184 512c0-58.3-4.7-183.3 16.1-235.9 7.3-18.2 16.1-31.8 30.2-45.8s27.6-22.9 45.8-30.2C328.7 179.3 453.7 184 512 184s183.3-4.7 235.9 16.1c18.2 7.3 31.8 16.1 45.8 30.2 14.1 14.1 22.9 27.6 30.2 45.8C844.7 328.7 840 453.7 840 512c0 58.3 4.7 183.2-16.2 235.8z" />
              </svg>
              {/* linkedin */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                height="15px"
                width="15px"
              >
                <path d="M7.170999999999999 5.009 A2.188 2.188 0 0 1 4.983 7.197000000000001 A2.188 2.188 0 0 1 2.7949999999999995 5.009 A2.188 2.188 0 0 1 7.170999999999999 5.009 z" />
                <path d="M9.237 8.855v12.139h3.769v-6.003c0-1.584.298-3.118 2.262-3.118 1.937 0 1.961 1.811 1.961 3.218v5.904H21v-6.657c0-3.27-.704-5.783-4.526-5.783-1.835 0-3.065 1.007-3.568 1.96h-.051v-1.66H9.237zm-6.142 0H6.87v12.139H3.095z" />
              </svg>
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
      </div>
    </footer>
  );
}
