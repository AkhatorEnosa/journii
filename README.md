# Journii - Trade Journal

A beautiful, powerful trade journal built with Next.js, TypeScript, and shadcn/ui. Track your trades, analyze your performance, and become a more profitable trader.

## Features

### 📈 **Performance Analytics**
- Real-time PnL tracking and calculations
- Cumulative PnL visualization over time
- Win rate analysis by day of week
- Symbol performance tracking
- Direction performance (Long vs Short)
- Interactive charts using Recharts

### 🎯 **Trade Management**
- Add, edit, and delete trades
- Track entry/exit prices, PnL, direction, and notes
- Tag trades for easy categorization
- Manual PnL entry for flexibility

### 🛡️ **Secure & Private**
- Local storage for data privacy
- Supabase integration for cloud sync
- Authentication system with user management

### 🎨 **Beautiful UI**
- Light/Dark theme toggle
- Modern design with smooth transitions
- Built with shadcn/ui components
- Fully responsive design
- Accessible and keyboard-friendly

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components (built on Base UI)
- **Recharts** - Interactive data visualization
- **Lucide React** - Icon library
- **Supabase** - Backend (PostgreSQL)
- **Clerk** - Authentication system
- **next-themes** - Theme switching (light/dark mode)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd journii
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Supabase (optional):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Main dashboard with trade list
│   └── analytics/         # Performance analytics with charts
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── trades/           # Trade-related components
├── lib/                  # Utilities and services
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Utility functions
│   ├── store.ts          # State management
│   └── supabase/         # Supabase configuration
└── sections/             # Page section components
```

## Key Components

### Dashboard (`/dashboard`)
- Trade list with summary statistics
- Quick trade management
- Daily PnL overview

### Analytics (`/analytics`)
- Performance charts and graphs
- Cumulative PnL trend line
- Win rate analysis
- Symbol performance tracking
- Direction analysis (Long vs Short pie chart)
- Top traded symbols

### Trade Modal
- Form for adding/editing trades
- Real-time validation
- Tag management
- Error handling

### Trade List
- Detailed trade listing
- Sortable table with PnL, direction, date
- Edit and delete functionality
- Summary statistics

## Data Model

### Trade
```typescript
interface Trade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number; // Manual PnL - source of truth
  direction: 'long' | 'short';
  notes: string;
  tags: string[];
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string;
}
```

## Development

### Adding New Features

1. **Create Components**: Use shadcn/ui for consistent styling
2. **Type Safety**: Always define TypeScript interfaces
3. **State Management**: Use the existing trade service pattern
4. **Styling**: Follow the theme color scheme (supports light/dark)
5. **Accessibility**: Ensure all interactive elements are accessible

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## Screenshots

Dashboard
![dashboard](https://ik.imagekit.io/btlflc5goc/tradrjourney/tradrjourney.png?updatedAt=1777030242968)

Analytics
![analytics](https://ik.imagekit.io/btlflc5goc/tradrjourney/Screenshot%202026-04-27%20at%2011.01.48.png)