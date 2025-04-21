import React from 'react';
import { Link } from 'react-router-dom';

// Feature Item Component (Remains the same as previous refinement)
const FeatureItem: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <div className="flex items-start gap-3">
      {/* Icon placeholder */}
      <div className="w-2 h-2 rounded-full bg-blue-500 mt-[9px] flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};


const Hero: React.FC = () => {

  // Links Data
  const contactLinks = [
    { name: 'GitHub', href: 'https://github.com/cerebrum101/courseplanner', external: true },
    { name: 'cerebrumactio.tech', href: 'https://cerebrumactio.tech', external: true },
    { name: 'ataykimwork@gmail.com', href: 'mailto:ataykimwork@gmail.com', external: false },
  ];

  const seeAlsoLinks = [
    { name: 'NU Registrar', href: 'https://registrar.nu.edu.kz', external: true },
    { name: 'NU Academic Advising Office', href: 'https://aao.nu.edu.kz', external: true },
    { name: 'crashed.nu', href: 'https://crashed.nu', external: true },
    { name: 'NU Avenue > Course Registration', href: 'https://t.me/c/1261951893/398886', external: true },
    { name: 'VA Course & Prof evaluation', href: 'https://t.me/c/1881776823/290?thread=290', external: true },
  ];

  const features = [
     { title: "Search & Discover", description: "Find courses using the search bar in the planner." },
     { title: "Visual Planning", description: "Drag and drop courses onto your semester canvas." },
     { title: "Interactive Canvas", description: "Scroll and resize your planning canvas freely." },
     { title: "Course Details", description: "Instantly view prerequisites, corequisites, and antirequisites." },
     { title: "Validation", description: "Check for prerequisite conflicts and credit limits." },
     { title: "Theme Options", description: "Switch between light and dark modes for comfort." },
  ];


  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 sm:p-6 md:p-8 ">

      {/* Main Content Area (Takes up available space) */}
      <main className="flex-grow flex items-center justify-center lg:ml-20">
        {/* Two-Column Grid Layout */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Logo, Title, Tagline, CTA, See Also */}
          <div className="flex flex-col space-y-6 md:space-y-8 items-center md:items-start text-center md:text-left">
            {/* Logo and Title */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <img src="/logo.JPG" alt="Course Planner Logo" className="h-14 sm:h-16" />
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Course Planner
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-lg text-gray-400 max-w-lg text-left">
              Plan your academic journey at NU with ease. Search, visualize, and organize your courses interactively.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                to="/planner"
                className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors px-10 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg"
              >
                Start Planning Now
              </Link>
            </div>

            {/* See Also Section */}
            <div className="pt-4 md:pt-6 w-full">
              <h2 className="text-xl font-semibold mb-4">
                See Also
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2">
                {seeAlsoLinks.map((link, index) => (
                  <React.Fragment key={link.name}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : '_self'}
                      rel={link.external ? 'noopener noreferrer' : ''}
                      className="text-sm text-gray-300 hover:text-blue-400 transition-colors whitespace-nowrap items-start" // Added whitespace-nowrap
                    >
                      {link.name}
                    </a>
                    {index < seeAlsoLinks.length - 1 && (
                       // Show separators more consistently, adjust as needed
                      <span className="text-gray-600">&#8226;</span> // Using a bullet point separator
                    )}
                  </React.Fragment>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Note: Some external links may require login/membership.</p>
            </div>
          </div> 

          {/* Features col */}
          <div className="space-y-5 md:pt-4">
             {/* No "Key Features" title */}
             {features.map(feature => (
               <FeatureItem key={feature.title} title={feature.title} description={feature.description} />
             ))}
          </div>

          



        </div> {/* End Grid */}
      </main>

      {/* Footer */}
      <footer className="pt-8 pb-4 text-center text-xs text-gray-500">
         <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
             <span>Developed by <a href="https://cerebrumactio.tech" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">cerebrumactio.tech</a></span>
             <span className="hidden sm:inline text-gray-600">|</span>
             {contactLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="hover:text-gray-300 transition-colors"
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