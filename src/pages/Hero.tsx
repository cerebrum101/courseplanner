import React from 'react';
import { Link } from 'react-router-dom';

const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-[9px] flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-base sm:text-lg mb-1">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};


const Hero: React.FC = () => {

  // Links Data
  const contactLinks = [
    { name: 'GitHub', href: 'https://github.com/cerebrum101/courseplanner', external: true },
    { name: 'ataykimwork@gmail.com', href: 'mailto:ataykimwork@gmail.com', external: false },
  ];

  const seeAlsoLinks = [
    { name: 'NU Registrar', href: 'https://registrar.nu.edu.kz', external: true },
    { name: 'NU Academic Advising Office', href: 'https://aao.nu.edu.kz', external: true },
    { name: 'crashed.nu', href: 'https://crashed.nu', external: true },
    { name: 'nuspace.kz', href: 'https://nuspace.kz', external: true },
    { name: 'innu.kz', href: 'https://innu.kz', external: true },
    { name: 'SENU Mentorship', href: 'https://t.me/+b88gbfIWqUo2Yjli', external: true },
    { name: 'NU Avenue > Course Registration', href: 'https://t.me/c/1261951893/398886', external: true },
    { name: 'VA Course & Prof evaluation', href: 'https://t.me/c/1881776823/290?thread=290', external: true },
  ];

  const features = [
     { title: "Search & Discover", description: "Find courses using the search bar in the planner." },
     { title: "Visual Planning", description: "Drag and drop courses onto your semester canvas." },
     { title: "Interactive Canvas", description: "Scroll and resize your planning canvas freely." },
     { title: "Course Details", description: "Instantly view prerequisites, corequisites, antirequisites and credits" },
     { title: "Theme Options", description: "Switch between light and dark modes for comfort." },
     { title: "Save and Restore", description: "Save selected courses and restore them later. Works after reloading." },
  ];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-8">

      <main className="flex-grow flex items-center justify-center lg:ml-20">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-start">

          <div className="flex flex-col space-y-5 sm:space-y-6 md:space-y-8 items-center md:items-start text-center md:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
              <img src="/logo.png" alt="Course Planner Logo" className="h-12 sm:h-14 md:h-16 w-auto" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Course Planner
              </h1>
            </div>

            <p className="text-base sm:text-lg text-gray-400 max-w-lg text-center md:text-left px-1">
              Plan your academic journey at NU with ease. Search, visualize, and organize your courses interactively.
            </p>

            <div className="pt-1 w-full sm:w-auto">
              <Link
                to="/planner"
                className="inline-block w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 transition-colors px-8 sm:px-10 py-3 rounded-lg font-medium text-base sm:text-lg shadow-md hover:shadow-lg"
              >
                Start Planning Now
              </Link>
            </div>

            <div className="w-full p-3 sm:p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-sm text-center md:text-left">
              <span className="text-blue-400 font-semibold">New:</span>{' '}
              <span className="text-gray-300">Fall 2026 courses available</span>
            </div>

            <div className="pt-2 md:pt-4 w-full">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center md:text-left">
                See Also
              </h2>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center md:justify-start items-stretch sm:items-center gap-2 sm:gap-x-4 sm:gap-y-2">
                {seeAlsoLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : '_self'}
                      rel={link.external ? 'noopener noreferrer' : ''}
                      className="text-sm text-gray-300 hover:text-blue-400 transition-colors py-1 sm:py-0 text-center sm:text-left break-words sm:break-normal"
                    >
                      {link.name}
                    </a>
                    {index < seeAlsoLinks.length - 1 && (
                      <span className="hidden sm:inline text-gray-600">&#8226;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center md:text-left">Note: Some external links may require login/membership.</p>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5 md:pt-4 w-full max-w-xl mx-auto md:mx-0 md:max-w-none">
             {features.map(feature => (
               <FeatureItem key={feature.title} title={feature.title} description={feature.description} />
             ))}
          </div>

        </div>
      </main>

      <footer className="pt-8 sm:pt-10 pb-4 sm:pb-6 text-center text-xs text-gray-500">
         <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-2 sm:gap-x-4 sm:gap-y-1 px-2">
             <span>
               Developed by{' '}
               <a
                 href="https://atay.top"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
               >
                 Atay
               </a>
             </span>
             <span className="hidden sm:inline text-gray-600">|</span>
             {contactLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="hover:text-gray-300 transition-colors break-all sm:break-normal"
                  >
                    {link.name}
                  </a>
                   {index < contactLinks.length - 1 && (
                     <span className="hidden sm:inline text-gray-600">|</span>
                   )}
               </React.Fragment>
             ))}
         </div>
      </footer>
    </div>
  );
};

export default Hero;