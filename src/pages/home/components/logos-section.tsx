export function LogosSection() {
  const logos = [
    { name: 'Netflix', width: 120 },
    { name: 'Facebook', width: 140 },
    { name: 'Dropbox', width: 130 },
    { name: 'Airbnb', width: 120 }
  ];

  return (
    <section className="border-y bg-gray-50 py-16">
      <div className="container">
        <div className="flex items-center justify-center gap-12 opacity-70 grayscale md:gap-16 lg:gap-24">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center">
              <img
                src="/placeholder.svg"
                alt={logo.name}
                width={logo.width}
                height={40}
                className="h-8 w-auto md:h-10"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
