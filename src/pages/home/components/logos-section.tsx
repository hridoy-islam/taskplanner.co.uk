import airbnbLogo from '../../../assets/imges/home/logos/airbnb-logo.png';
import dropboxLogo from '../../../assets/imges/home/logos/dropbox-logo.png';
import facebookLogo from '../../../assets/imges/home/logos/facebook-logo.png';
import netflixLogo from '../../../assets/imges/home/logos/netflix-logo.png';
import ticketLogo from '../../../assets/imges/home/logos/ticket-logo.png';

export function LogosSection() {
  const logos = [
    { name: 'Ticket', width: '136.92px', height: '42.72px', src: ticketLogo },
    { name: 'Netflix', width: '136.92px', height: '42.72px', src: netflixLogo },
    {
      name: 'Facebook',
      width: '136.92px',
      height: '42.72px',
      src: facebookLogo
    },
    { name: 'Dropbox', width: '136.92px', height: '42.72px', src: dropboxLogo },
    { name: 'Airbnb', width: '136.92px', height: '42.72px', src: airbnbLogo }
  ];

  return (
    <section className="py-40">
      <div className="container">
        <div className="flex items-center justify-center gap-12 opacity-70 grayscale md:gap-16 lg:gap-24">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center">
              <img
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-[42px] w-[136px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
