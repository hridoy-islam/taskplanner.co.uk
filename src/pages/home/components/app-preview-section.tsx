import { Button } from '@/components/ui/button';

export function AppPreviewSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-72">
              <img
                src="/tasklist.png"
                alt="Mobile App"
                width={288}
                height={576}
                className="rounded-[32px] shadow-2xl"
              />
            </div>
          </div>
          <div className="space-y-8">
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
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="bg-navy-900 hover:bg-navy-800 h-14 px-6 text-white"
                >
                  <img
                    src="/tasklist.png"
                    alt="App Store"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Download on the
                  <br />
                  App Store
                </Button>
                <Button variant="outline" className="h-14 px-6">
                  <img
                    src="/tasklist.png"
                    alt="Play Store"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Get it on
                  <br />
                  Google Play
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
