import { Button } from '@/components/ui/button';
import tasklistLogo from '../../../assets/imges/home/tasklist.png';
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';

export function AppPreviewSection() {
  return (
    <section className="pt-8 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:justify-between lg:gap-8">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={tasklistLogo}
                alt="Mobile App"
                className="h-[321px] w-[320px] rounded-[32px] md:h-[580px] md:w-[593px]"
              />
            </div>
          </div>
          <div className="mt-24 flex h-full w-full flex-col justify-center space-y-8 md:mt-0 md:h-[532px] md:w-[550px]">
            <h2 className="text-navy-900 text-[32px] font-bold leading-[54px] md:text-4xl">
              Organize your web app easily with TaskPlanner
            </h2>
            <p className="text-[16px] leading-[30px] text-gray-600">
              App landing pages are web pages designed to promote your mobile
              application & drive downloads. With Sharko your leads will land to
              get more information about your app and to download it.
            </p>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Get the app</h3>
              <div className="flex flex-col gap-5">
                <Button className="hover:bg-navy-800 h-16 w-[210px] rounded-[12px] bg-[#00214C] px-6 text-white">
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
                <Button className="hover:bg-navy-800 h-16 w-[210px] rounded-[12px] bg-[#00214C] px-6 text-white">
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
          </div>
        </div>
      </div>
    </section>
  );
}
