import React, { useState } from 'react';
import { X } from 'lucide-react';

interface InteractiveBookProps {
  className?: string;
}

const InteractiveBook: React.FC<InteractiveBookProps> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* 3D Book */}
      <div 
        className={`relative cursor-pointer group ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative w-24 h-32 transform-gpu transition-all duration-500 group-hover:scale-110 group-hover:rotate-y-12">
          {/* Book Cover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-r-lg shadow-xl transform-gpu perspective-1000">
            {/* Book Spine */}
            <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-blue-800 to-purple-800 rounded-l-lg shadow-inner"></div>
            
            {/* Cover Design */}
            <div className="p-3 h-full flex flex-col justify-between text-white">
              <div className="text-xs font-bold leading-tight">
                DEVLOOP
              </div>
              <div className="text-[10px] opacity-90 text-center leading-tight">
                Low-Code Platform Guide
              </div>
              <div className="text-[8px] opacity-75">
                v1.0
              </div>
            </div>
            
            {/* Book Pages Effect */}
            <div className="absolute right-0 top-1 w-[2px] h-[calc(100%-8px)] bg-white/20 rounded-full"></div>
            <div className="absolute right-1 top-2 w-[1px] h-[calc(100%-16px)] bg-white/15 rounded-full"></div>
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 rounded-r-lg transition-all duration-500 pointer-events-none"></div>
          
          {/* Shadow */}
          <div className="absolute -bottom-2 -right-1 w-24 h-6 bg-black/20 rounded-full blur-md transform scale-100 group-hover:scale-110 transition-transform duration-500"></div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Click to open guide
        </div>
      </div>

      {/* Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 z-10 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            
            {/* Open Book */}
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden animate-book-open">
              <div className="flex">
                {/* Left Page */}
                <div className="flex-1 p-8 bg-gradient-to-br from-slate-50 to-white">
                  <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
                    Welcome to DEVLOOP
                  </h1>
                  <div className="space-y-4 text-slate-700">
                    <p className="text-lg leading-relaxed">
                      Transform your ideas into reality with our revolutionary low-code platform.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Visual drag-and-drop interface</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>AI-powered code generation</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        <span>Real-time collaboration</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute bottom-4 left-8 text-xs text-slate-400">
                    Chapter 1: Getting Started
                  </div>
                </div>
                
                {/* Book Spine (Center) */}
                <div className="w-4 bg-gradient-to-b from-slate-200 to-slate-300 relative">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-slate-400 transform -translate-x-1/2"></div>
                </div>
                
                {/* Right Page */}
                <div className="flex-1 p-8 bg-gradient-to-bl from-slate-50 to-white">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">
                    Build 10x Faster
                  </h2>
                  <div className="space-y-4 text-slate-700">
                    <p className="leading-relaxed">
                      Our platform accelerates development through intelligent automation and pre-built components.
                    </p>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <h3 className="font-semibold text-slate-800 mb-2">Quick Start</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Create your account</li>
                        <li>Choose a template</li>
                        <li>Customize with drag & drop</li>
                        <li>Deploy instantly</li>
                      </ol>
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        Start Building
                      </button>
                    </div>
                  </div>
                  
                  {/* Page Number */}
                  <div className="absolute bottom-4 right-8 text-xs text-slate-400">
                    Page 2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes book-open {
          0% {
            transform: perspective(1000px) rotateY(-15deg) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: perspective(1000px) rotateY(0deg) scale(1);
            opacity: 1;
          }
        }
        
        .animate-book-open {
          animation: book-open 0.6s ease-out forwards;
        }
        
        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .group:hover .rotate-y-12 {
          transform: perspective(1000px) rotateY(12deg) scale(1.1);
        }
      `}</style>
    </>
  );
};

export default InteractiveBook;