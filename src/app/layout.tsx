import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from '@clerk/ui/themes'
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Logo from '@/app/logo.png';

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const APP_NAME = "TradrJourney";
const APP_DEFAULT_TITLE = "TradrJourney | Professional Trading Journal & Analytics";
const APP_TITLE_TEMPLATE = "%s | TradrJourney";
const APP_DESCRIPTION = "Track, analyze, and improve your trading performance with TradrJourney - the professional trading journal trusted by 10K+ traders worldwide. Features deep analytics, goal tracking, and automated insights.";
const APP_URL = "https://tradrjourney.netlify.app";
// const APP_ICON_URL = Logo;
// const APP_ICON_512_URL = "/icon-512.png";

export const metadata: Metadata = {
  // Basic metadata
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "journii",
    "tradr journey",
    "tradrjourney",
    "trader journey",
    "trading journal",
    "trade tracker",
    "trading analytics",
    "performance tracking",
    "trading journal app",
    "stock trading journal",
    "forex trading journal",
    "crypto trading journal",
    "day trading journal",
    "swing trading journal",
    "trading performance",
    "trading insights",
    "profit and loss tracking",
    "win rate analysis",
    "trading goals",
  ],
  authors: [{ name: "TradrJourney" }],
  creator: "TradrJourney",
  publisher: "TradrJourney",

  // Canonical URL
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },

  // OpenGraph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Professional Trading Journal`,
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: ["/logo.png"],
    creator: "@tradrjourney",
    site: "@tradrjourney",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification
  verification: {
    google: "Pa2S6hxKK6-LGDDy3Oz2Am6Fte06fUyvY9edbIMEzfs",
  },


  // Apple specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },

  // Format detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Icons
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },

  // Manifest
  manifest: "/manifest.json",
};

// Structured data for JSON-LD
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: APP_NAME,
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://twitter.com/tradrjourney",
        "https://github.com/journii",
      ],
      description: APP_DESCRIPTION,
    },
    {
      "@type": "WebApplication",
      "@id": `${APP_URL}/#application`,
      name: APP_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      url: APP_URL,
      description: APP_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available with basic features",
      },
      featureList: [
        "TradrJourney is a professional trading journal and analytics platform designed to help traders track, analyze, and improve their trading performance. With TradrJourney, traders can easily log their trades, monitor their performance, and gain valuable insights to enhance their trading strategies.",
        "",
        "Trade tracking and journaling",
        "Performance analytics and insights",
        "Win rate analysis",
        "PnL tracking",
        "Goal setting and challenges",
        "Multi-timeframe analysis",
        "Currency and symbol performance",
        "Export to CSV and PDF",
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1000",
        bestRating: "5",
        worstRating: "1",
      },
      applicationSuite: APP_NAME,
      screenshot: `${APP_URL}/logo.png`,
      isAccessibleForFree: true,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/#software`,
      name: APP_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "1000",
      },
      description: APP_DESCRIPTION,
      featureList: [
        "TradrJourney",
        "Tradr journey",
        "Trade journaling",
        "Analytics dashboard",
        "Performance tracking",
        "Goal management",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="Pa2S6hxKK6-LGDDy3Oz2Am6Fte06fUyvY9edbIMEzfs" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              theme: shadcn
            }}
          >
            <QueryProvider>
              <TooltipProvider>
                <main className="flex-1 bg-background">
                  {children}
                </main>
              </TooltipProvider>
            </QueryProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}