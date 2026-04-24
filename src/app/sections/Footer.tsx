import { TrendingUp } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold text-foreground">TradrJourney</span>
                </div>
                <p className="text-muted-foreground text-sm">
                    © {new Date().getFullYear()} TradrJourney. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
  )
}

export default Footer