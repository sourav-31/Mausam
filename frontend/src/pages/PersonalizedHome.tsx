import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ComponentConfig {
  type: string;
  props: any;
  priority: number;
}

export default function PersonalizedHome() {
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await api.get('/personalized-home');
        setComponents(res.data.components || []);
      } catch (err) {
        console.error('Failed to load personalized home', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Personalized Weather Dashboard</h1>
      {components.length === 0 ? (
        <p>No components to display yet. This area will render dynamic widgets based on your profile.</p>
      ) : (
        <div className="grid gap-4">
          {components.map((c, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle>{c.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap">{JSON.stringify(c.props, null, 2)}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
