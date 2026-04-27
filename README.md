# Journii - Trade Journal

A beautiful, powerful trade journal built with Next.js, TypeScript, and shadcn/ui. Track your trades, analyze your performance, and become a more profitable trader.

## Features

### 📊 **Calendar View**
- Visualize your trades on an interactive calendar
- Color-coded PnL indicators (green for profit, red for loss)
- Click on any day to add new trades

### 📈 **Performance Analytics**
- Real-time PnL tracking and calculations
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
- Optional Supabase integration for cloud sync
- Authentication system with user management

### 🎨 **Beautiful UI**
- Dark theme with modern design
- Built with shadcn/ui components
- Fully responsive design
- Accessible and keyboard-friendly

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Recharts** - Interactive data visualization
- **FullCalendar** - Calendar component
- **Lucide React** - Icon library
- **Supabase** - Optional backend (PostgreSQL + Auth)

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
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── dashboard/         # Main dashboard with calendar
│   └── analytics/         # Performance analytics
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   └── trades/           # Trade-related components
├── lib/                  # Utilities and services
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Utility functions
│   ├── store.ts          # State management
│   └── supabase/         # Supabase configuration
└── middleware.ts         # Next.js middleware
```

## Key Components

### Dashboard (`/dashboard`)
- Interactive calendar view
- Daily PnL visualization
- Quick trade addition
- Summary statistics

### Analytics (`/analytics`)
- Performance charts and graphs
- Win rate analysis
- Symbol performance tracking
- Direction analysis

### Trade Modal
- Form for adding/editing trades
- Real-time PnL calculation preview
- Tag management
- Validation and error handling

### Trade List (Sidebar)
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
4. **Styling**: Follow the dark theme color scheme
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

<!-- ## Future Roadmap

- [ ] Mobile app version
- [ ] Advanced analytics and machine learning insights
- [ ] Trade import/export functionality
- [ ] Multi-currency support
- [ ] Team/collaboration features
- [ ] Advanced charting and technical indicators
- [ ] Trading journal templates
- [ ] Performance benchmarks and goals

## Screenshots -->

## Screenshots

Dashboard![dashboard](https://ik.imagekit.io/btlflc5goc/tradrjourney/tradrjourney.png?updatedAt=1777030242968)

Analytics![analytics](https://ik.imagekit.io/btlflc5goc/tradrjourney/Screenshot%202026-04-27%20at%2011.01.48.png)


<!-- ## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details. -->
<!-- 
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->