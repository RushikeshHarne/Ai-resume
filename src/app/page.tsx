import { Briefcase } from 'lucide-react';
import { ResumeBuilder } from '@/components/ResumeBuilder';
import { ChatBot } from '@/components/ChatBot';

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <div className="flex items-center gap-3 justify-start mb-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold font-headline text-foreground">ResumeAI</h1>
                     <p className="text-md sm:text-lg text-muted-foreground">
                        Build your professional, ATS-friendly resume with the power of AI.
                    </p>
                </div>
            </div>
        </header>
        <main>
          <ResumeBuilder />
        </main>
      </div>
      <ChatBot />
    </div>
  );
}
