'use client';

import GoalsSection from '@/components/goals/GoalsSection';
import Header from '../sections/Header';
import Footer from '../sections/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GoalsPage() {
  const router = useRouter();
  
  return (
    <>
        <Header />
        <div className='container mx-auto px-4'>
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="py-8 mt-10 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <GoalsSection />
        </div>
        <Footer />
    </>
  );
}