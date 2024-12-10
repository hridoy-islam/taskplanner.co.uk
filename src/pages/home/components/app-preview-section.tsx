import { Button } from '@/components/ui/button';
import tasklistLogo from '../../../assets/imges/home/tasklist.png';
import appleLogo from '../../../assets/imges/home/apple_logo.png';
import playstoreLogo from '../../../assets/imges/home/playstore_logo.png';

export function AppPreviewSection() {
  return (
    <section className=" py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={tasklistLogo}
                alt="Mobile App"
                width={593}
                height={480}
                className="rounded-[32px]"
              />
            </div>
          </div>
          <div className="flex h-[532px] w-[550px] flex-col justify-center space-y-8">
            <h2 className="text-navy-900 text-3xl font-bold md:text-4xl">
              Organize your web app easily with TaskPlanner
            </h2>
            <p className="text-lg text-gray-600">
              App landing pages are web pages designed to promote your mobile
              application & drive downloads. With Sharko your leads will land to
              get more information about your app and to download it.
            </p>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Get the app</h3>
              <div className="flex flex-col gap-8">
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
