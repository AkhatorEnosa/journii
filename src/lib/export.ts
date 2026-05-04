import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Trade } from './types';

/**
 * Convert trade data to CSV format and trigger download
 */
export function exportTradesToCSV(trades: Trade[], filename?: string) {
  if (!trades || trades.length === 0) {
    console.warn('No trades to export');
    return;
  }

  // CSV headers
  const headers = [
    'Date',
    'Symbol',
    'Direction',
    'Entry Price',
    'Exit Price',
    'PnL',
    'Result',
    'Tags',
    'Notes'
  ];

  // CSV rows
  const rows = trades.map(trade => [
    trade.date,
    trade.symbol.toUpperCase(),
    trade.direction.toUpperCase(),
    trade.entryPrice.toFixed(2),
    trade.exitPrice.toFixed(2),
    trade.pnl.toFixed(2),
    trade.result.toUpperCase(),
    trade.tags.join(', '),
    `"${trade.notes.replace(/"/g, '""')}"` // Escape quotes in notes
  ]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `trades_export_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate a PDF report with trade data and analytics
 */
export function exportTradesToPDF(
  trades: Trade[], 
  stats: {
    totalTrades: number;
    totalPnL: number;
    winRate: number;
    avgPnL: number;
  },
  timeFilter: string,
  filename?: string
) {
  if (!trades || trades.length === 0) {
    console.warn('No trades to export');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Journii - Trading Report', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle with date range
  doc.setFontSize(12);
  doc.setTextColor(100);
  const periodLabel = timeFilter === 'all' ? 'All Time' : 
                      timeFilter === 'year' ? 'This Year' : 
                      timeFilter === 'month' ? 'This Month' : 'This Week';
  doc.text(`Period: ${periodLabel}`, pageWidth / 2, 28, { align: 'center' });
  
  // Generated date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 34, { align: 'center' });

  // Statistics Summary
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Performance Summary', 14, 48);

  // Calculate additional stats
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const totalWins = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : 'N/A';

  // Stats grid
  const statsData = [
    ['Total Trades', stats.totalTrades.toString()],
    ['Total PnL', `$${stats.totalPnL.toFixed(2)}`],
    ['Win Rate', `${stats.winRate.toFixed(1)}%`],
    ['Average PnL', `$${stats.avgPnL.toFixed(2)}`],
    ['Winning Trades', winningTrades.toString()],
    ['Losing Trades', losingTrades.toString()],
    ['Profit Factor', profitFactor.toString()],
    ['Best Trade', `$${Math.max(...trades.map(t => t.pnl)).toFixed(2)}`],
    ['Worst Trade', `$${Math.min(...trades.map(t => t.pnl)).toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Metric', 'Value']],
    body: statsData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Blue header
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 70 }
    },
    margin: { left: 14, right: 14 },
  });

  // Trade Details Table
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Check if we need a new page
  if (finalY > 200) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Trade Details', 14, finalY);

  // Prepare trade data for table
  const tradeTableData = trades
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(trade => [
      trade.date,
      trade.symbol.toUpperCase(),
      trade.direction.toUpperCase(),
      `$${trade.entryPrice.toFixed(2)}`,
      `$${trade.exitPrice.toFixed(2)}`,
      `$${trade.pnl.toFixed(2)}`,
      trade.result.toUpperCase(),
      trade.tags.length > 0 ? trade.tags.join(', ') : '-'
    ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Date', 'Symbol', 'Dir', 'Entry', 'Exit', 'PnL', 'Result', 'Tags']],
    body: tradeTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    columnStyles: {
      0: { cellWidth: 25 },  // Date
      1: { cellWidth: 20 },  // Symbol
      2: { cellWidth: 12 },  // Direction
      3: { cellWidth: 20 },  // Entry
      4: { cellWidth: 20 },  // Exit
      5: { cellWidth: 22 },  // PnL
      6: { cellWidth: 18 },  // Result
      7: { cellWidth: 33 }   // Tags
    },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Color code PnL column
      if (data.section === 'body' && data.column.index === 5) {
        const rawValue = data.cell.raw?.toString().replace('$', '') || '0';
        const pnl = parseFloat(rawValue);
        if (pnl > 0) {
          data.cell.styles.textColor = [16, 185, 129]; // Green
        } else if (pnl < 0) {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
      // Color code Result column
      if (data.section === 'body' && data.column.index === 6) {
        if (data.cell.raw === 'PROFIT') {
          data.cell.styles.textColor = [16, 185, 129]; // Green
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
        }
      }
    }
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - Generated by Journii`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(filename || `trading_report_${timestamp}.pdf`);
}

/**
 * Export analytics summary to PDF (simplified version for quick reports)
 */
export function exportAnalyticsSummaryToPDF(
  stats: {
    totalTrades: number;
    totalPnL: number;
    winRate: number;
    avgPnL: number;
  },
  timeFilter: string,
  filename?: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text('Journii Analytics Summary', pageWidth / 2, 30, { align: 'center' });
  
  // Period
  doc.setFontSize(14);
  doc.setTextColor(100);
  const periodLabel = timeFilter === 'all' ? 'All Time' : 
                      timeFilter === 'year' ? 'This Year' : 
                      timeFilter === 'month' ? 'This Month' : 'This Week';
  doc.text(`Period: ${periodLabel}`, pageWidth / 2, 45, { align: 'center' });
  
  // Main stats in a grid
  const statsGrid = [
    { label: 'Total Trades', value: stats.totalTrades.toString(), color: [59, 130, 246] },
    { label: 'Total PnL', value: `$${stats.totalPnL.toFixed(2)}`, color: stats.totalPnL >= 0 ? [16, 185, 129] : [239, 68, 68] },
    { label: 'Win Rate', value: `${stats.winRate.toFixed(1)}%`, color: [139, 92, 246] },
    { label: 'Avg PnL', value: `$${stats.avgPnL.toFixed(2)}`, color: stats.avgPnL >= 0 ? [16, 185, 129] : [239, 68, 68] }
  ];

  let yPos = 70;
  statsGrid.forEach((stat, index) => {
    if (index % 2 === 0 && index > 0) {
      yPos += 40;
    }
    
    const xPos = index % 2 === 0 ? 30 : pageWidth / 2 + 10;
    
    // Card background
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(xPos - 10, yPos - 10, pageWidth / 2 - 30, 35, 3, 3, 'F');
    
    // Label
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(stat.label, xPos, yPos + 5);
    
    // Value
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(stat.value, xPos, yPos + 20);
  });

  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 140, { align: 'center' });

  // Footer
  doc.text('Powered by Journii - Your Trading Journal', pageWidth / 2, 150, { align: 'center' });

  // Save
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(filename || `analytics_summary_${timestamp}.pdf`);
}