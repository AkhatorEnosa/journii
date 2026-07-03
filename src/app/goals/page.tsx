'use client';

import GoalsSection from '@/components/goals/GoalsSection';
import DashboardHeader from '../sections/DashboardHeader';
import Footer from '../sections/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function GoalsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking authentication
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <>
        <DashboardHeader />
        {/* <div className='container mx-auto px-4 group'>
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-foreground scale-0 group-hover:scale-100 group-hover:flex">
              <ArrowLeft className="w-4 h-4" />
            </Button>
        </div> */}
        {/* <div className="container mx-auto px-4 py-8 max-w-6xl"> */}
            <GoalsSection />
        {/* </div> */}
        <Footer />
    </>
  );
}