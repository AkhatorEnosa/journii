# Export Feature Guide

## Overview

The Journii dashboard now includes a powerful export feature that allows you to export your trade data and analytics reports in both CSV and PDF formats. This feature is accessible directly from the dashboard header.

## Features

### 📊 Export Trade Data

Export all your trade data with complete details including:
- Date
- Symbol
- Direction (Long/Short)
- Entry Price
- Exit Price
- PnL (Profit/Loss)
- Result (Profit/Loss)
- Tags
- Notes

**Available Formats:**
- **CSV** - Perfect for importing into spreadsheets (Excel, Google Sheets) or other analysis tools
- **PDF** - Professional formatted report with all trade details

### 📈 Export Analytics Summary

Export a visual summary of your trading performance including:
- Total Trades
- Total PnL
- Win Rate
- Average PnL per trade

**Available Format:**
- **PDF** - Clean, visual summary report perfect for sharing or record-keeping

## How to Use

### Step 1: Access Export Menu
1. Navigate to your dashboard at `/dashboard`
2. Look for the **"Export"** button in the top-right corner of the header
3. Click the button to open the export menu

### Step 2: Choose Export Type

The export menu provides three options:

#### Option 1: Export as CSV
- Downloads all trade data in CSV format
- File name: `trades_export_YYYY-MM-DD.csv`
- Best for: Data analysis, importing into spreadsheets, backup

#### Option 2: Export as PDF
- Downloads a comprehensive PDF report with:
  - Performance summary statistics
  - Detailed trade table with color-coded PnL
  - Professional formatting
- File name: `trading_report_YYYY-MM-DD.pdf`
- Best for: Sharing, printing, official records

#### Option 3: Summary Report (PDF)
- Downloads a visual summary with key metrics
- File name: `analytics_summary_YYYY-MM-DD.pdf`
- Best for: Quick overview, presentations, sharing performance highlights

### Step 3: Time Filter Consideration

**Important:** The export will include only the trades visible based on your current time filter selection:
- **All Time** - Exports all trades in your journal
- **This Year** - Exports trades from the current year
- **This Month** - Exports trades from the current month
- **This Week** - Exports trades from the current week

Make sure to select the appropriate time filter before exporting to get the data you need.

## File Locations

Exported files are automatically downloaded to your browser's default download location (usually the "Downloads" folder).

## PDF Report Details

### Full Trade Report (PDF)
The comprehensive PDF report includes:

1. **Header Section**
   - Journii branding
   - Selected time period
   - Generation timestamp

2. **Performance Summary**
   - Total Trades
   - Total PnL
   - Win Rate
   - Average PnL
   - Winning Trades count
   - Losing Trades count
   - Profit Factor
   - Best Trade
   - Worst Trade

3. **Trade Details Table**
   - All trades sorted by date (most recent first)
   - Color-coded PnL values (green for profit, red for loss)
   - Color-coded Result column
   - All trade details including tags

4. **Footer**
   - Page numbers
   - Journii branding

### Analytics Summary Report (PDF)
A clean, visual summary featuring:

- Large, easy-to-read metrics
- Color-coded values (green for positive, red for negative)
- Professional layout perfect for sharing
- Generation timestamp and branding

## CSV Format Details

The CSV export includes the following columns:

```
Date,Symbol,Direction,Entry Price,Exit Price,PnL,Result,Tags,Notes
2024-01-15,EURUSD,LONG,1.0850,1.0920,70.00,PROFIT,"trend-following,news","Strong momentum trade"
```

### CSV Best Practices

1. **Opening in Excel/Google Sheets:**
   - Simply double-click the CSV file
   - Or import it using the spreadsheet's import function

2. **Data Analysis:**
   - Use filters to sort by date, symbol, or PnL
   - Create pivot tables for deeper analysis
   - Generate custom charts and graphs

3. **Backup:**
   - Store CSV files in a safe location
   - Consider versioning your backups (e.g., `trades_2024_01.csv`)

## Tips & Best Practices

### 1. Regular Exports
- Export your data regularly for backup purposes
- Consider monthly exports to track progress over time

### 2. Time Filter Usage
- Use the time filter to export specific periods
- Export "This Month" at month-end for monthly reports
- Export "This Year" for annual reviews

### 3. Data Analysis
- Use CSV exports for detailed analysis in Excel/Google Sheets
- Calculate custom metrics not shown in the dashboard
- Create your own charts and visualizations

### 4. Sharing Reports
- Use PDF exports for sharing with mentors, coaches, or trading groups
- Summary reports are perfect for social media or trading journals
- Full reports provide complete transparency for accountability

### 5. Record Keeping
- Keep PDF reports for tax purposes
- Use CSV exports for detailed record-keeping
- Maintain a folder structure by year/month

## Troubleshooting

### No Data Exported
If your export is empty:
1. Check that you have trades in your journal
2. Verify the time filter is set correctly
3. Try refreshing the page and exporting again

### File Not Downloading
If files aren't downloading:
1. Check your browser's download settings
2. Ensure pop-ups aren't blocked
3. Try a different browser

### PDF Formatting Issues
If PDF formatting looks incorrect:
1. Ensure you're using a modern browser
2. Try updating your browser
3. Check that JavaScript is enabled

## Technical Details

### Dependencies
The export feature uses the following libraries:
- **jsPDF** - For PDF generation
- **jspdf-autotable** - For creating tables in PDFs

### Browser Compatibility
The export feature works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### File Size
- CSV files are typically small (< 100KB for hundreds of trades)
- PDF files vary based on trade count (typically 100KB - 1MB)

## Future Enhancements

Potential future improvements:
- Export to Excel format (.xlsx)
- Custom date range selection
- Export specific symbols or tags
- Automated scheduled exports
- Export to Google Sheets integration
- Chart exports (export dashboard charts as images)

## Support

If you encounter any issues with the export feature:
1. Check this guide for troubleshooting tips
2. Try refreshing the page
3. Clear your browser cache
4. Contact support if issues persist

---

**Happy Trading! 📈**

*Last Updated: April 5, 2026*