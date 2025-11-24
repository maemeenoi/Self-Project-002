'use client';

import React from 'react';
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Image 
              src="/logo.png" 
              alt="makeStuffGo Logo" 
              width={24} 
              height={24} 
              className="rounded"
            />
            <span className="text-lg font-semibold">makeStuffGo Company Portal</span>
          </div>
          <div className="text-sm text-gray-400">
            <p>For technical support, contact IT Department</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

