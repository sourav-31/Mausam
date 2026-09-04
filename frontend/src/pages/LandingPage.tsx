import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind, CloudLightning, MapPin, BrainCircuit, Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <header className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <Sun className="h-8 w-8 text-amber-500" />
          <span className="font-bold text-2xl tracking-tight text-blue-950 dark:text-blue-50">MAUSAM</span>
        </div>
        <nav>
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.h1 
            className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Weather. <span className="text-blue-600">Personalized for You.</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-slate-600 dark:text-slate-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Get intelligent weather insights that adapt to your location, lifestyle, preferences, and daily activities.
          </motion.p>
          
          <motion.div 
            className="flex justify-center space-x-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8" asChild>
              <Link to="/register">Explore My Weather</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/login">Explore Demo</Link>
            </Button>
          </motion.div>
        </div>

        <div className="mt-32">
          <h2 className="text-3xl font-bold text-center mb-12">Why Personalized Weather?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<MapPin className="h-10 w-10 text-blue-500" />}
              title="Location Aware"
              description="Weather information strictly relevant to where you are right now."
            />
            <FeatureCard 
              icon={<BrainCircuit className="h-10 w-10 text-purple-500" />}
              title="Intelligent Insights"
              description="Raw meteorological data automatically converted into meaningful daily recommendations."
            />
            <FeatureCard 
              icon={<Bell className="h-10 w-10 text-red-500" />}
              title="Smart Alerts"
              description="Important warnings prioritized automatically so you never miss critical information."
            />
            <FeatureCard 
              icon={<UserCircle className="h-10 w-10 text-green-500" />}
              title="Built Around You"
              description="Different users receive different weather priorities based on their lifestyle (e.g. Farmer vs Student)."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
