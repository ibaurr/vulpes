import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface StepResearchingProps {
  topic: string;
  onComplete: (facts: string[]) => void;
}

export function StepResearching({ topic, onComplete }: StepResearchingProps) {
  useEffect(() => {
    const fetchResearch = async () => {
      try {
        const response = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic })
        });
        if (!response.ok) throw new Error("Failed to fetch research");
        
        const data = await response.json();
        onComplete(data.facts || []);
      } catch (error) {
        console.error(error);
        // Fallback for demo purposes if API fails
        onComplete([
          "Fallback Fact 1 due to error", 
          "Fallback Fact 2 due to error"
        ]);
      }
    };
    
    fetchResearch();
  }, [topic, onComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 shadow-lg">
      <CardHeader className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold">Researching the web...</CardTitle>
        <CardDescription>
          Gathering objective facts about &quot;{topic}&quot; to ground the AI generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
