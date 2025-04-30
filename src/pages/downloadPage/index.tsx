import a from "@/assets/imges/home/task1.png"

export default function DownloadApp () {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Download Our App
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Experience the best of our services right from your phone. Available
          on both Android and iOS.
        </p>

        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <a
            href="#"
            className="bg-black text-white px-5 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Get it on Google Play"
              className="h-10"
            />
          </a>

          <a
            href="#"
            className="bg-black text-white px-5 py-3 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition"
          >
            <img
              src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
              alt="Download on the App Store"
              className="h-10"
            />
          </a>
        </div>

        <img
          src={a}
          alt="App Preview"
          className="mx-auto max-w-xs md:max-w-md rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};


