'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from './sections/Header';
import Footer from './sections/Footer';

export default function NotFound() {

  return (
    <div className="flex flex-col min-h-screen gap-10">
      <Header />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Animated 404 Text */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="py-8"
          >
            <div className="relative inline-block">
              <Search className="w-32 h-32 text-muted-foreground/30 mx-auto" />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </Button>
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-sm text-muted-foreground"
          >
            If you believe this is a mistake, please contact support.
          </motion.p>
        </div>
      </div>
      <Footer />
    </div>
  );
}