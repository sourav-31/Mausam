import { Link } from 'react-router-dom';
import { Sun, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop")',
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-md">
        
        {/* Icon Composition */}
        <div className="mb-6 relative flex items-center justify-center h-24 w-24">
          <Sun className="h-14 w-14 text-yellow-400 fill-yellow-400 absolute top-1 right-2 drop-shadow-sm" />
          <Cloud className="h-20 w-20 text-white fill-white absolute bottom-1 left-2 drop-shadow-md" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
          Mausam for You
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-white/95 mb-10 font-medium drop-shadow-lg max-w-[260px] leading-snug">
          Personalized weather for a smarter tomorrow
        </p>

        {/* Call to Action Button */}
        <Button 
          asChild 
          size="lg" 
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl py-6 text-lg font-semibold shadow-xl transition-all border-0"
        >
          <Link to="/register">Get Started</Link>
        </Button>

        {/* Secondary Links */}
        <div className="mt-8 text-white font-medium text-sm drop-shadow-lg tracking-wide">
          <Link to="/login" className="hover:text-white/80 transition-colors">Login</Link>
          <span className="mx-4 opacity-70">/</span>
          <Link to="/register" className="hover:text-white/80 transition-colors">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
