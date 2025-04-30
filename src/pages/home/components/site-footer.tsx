import { useState } from 'react';
import { Clipboard, Facebook, Instagram, Linkedin, Twitter, Youtube, Globe, ChevronDown } from 'lucide-react';
import tlogo from '@/assets/imges/home/tpw.png';
import { Link } from 'react-router-dom';

// Language options for the language selector
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' },
];

// Footer navigation links
const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Task Planner Guide', href: 'guide' },
      { label: 'Pricing', href: 'pricing' },
      { label: 'Download Apps', href: 'download-app' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Productivity Method', href: '/productivity-method' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Career', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Security Policy', href: '/security-policy' },
    ],
  },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  // Footer section component (inline)
  const FooterSection = ({ title, description }) => (
    <div className="mb-6 md:mb-0">
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );

  // Social icon component (inline)
  const SocialIcon = ({ Icon, href, label }) => (
    <a
      href={href}
      aria-label={label}
      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center justify-center h-10 w-10 rounded-full hover:bg-white/10"
    >
      <Icon size={20} />
    </a>
  );

  return (
    <footer className="bg-taskplanner text-white py-6">
      {/* Top section with logo and login */}
      <div className="container mx-auto px-4 ">
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0 gap-2">
            <div className=" w-24">
              <img src={tlogo} className="object-cover scale-125" alt="Task Planner Logo" />
            </div>
          </div>
          
        </div> */}

        {/* Main footer sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-6">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-medium mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <Link
                  to={link.href}
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200 block"
                >
                  {link.label}
                </Link>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex flex-col-reverse md:flex-row justify-between items-center">
            {/* Language selector */}
            <div className="flex items-center mt-4 md:mt-0">
              {/* Language dropdown */}
              
              {/* Legal links */}
              <div className="flex items-center space-x-4 text-sm">
                
                <span className="text-gray-300">
                  Copyright © {currentYear} Task Planner
                </span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex space-x-2">
              <SocialIcon Icon={Twitter} href="https://twitter.com" label="Twitter" />
              <SocialIcon Icon={Facebook} href="https://facebook.com" label="Facebook" />
              <SocialIcon Icon={Linkedin} href="https://linkedin.com" label="LinkedIn" />
              <SocialIcon Icon={Instagram} href="https://instagram.com" label="Instagram" />
              <SocialIcon Icon={Youtube} href="https://youtube.com" label="YouTube" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}