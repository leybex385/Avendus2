/**
 * Market Data Engine - Simulates Real-time Indian Stock Market Data
 * 
 * Features:
 * - Mock list of top NSE/BSE stocks
 * - Simulated price fluctuation
 * - Search capability
 */

(function() {
    // Top 50 Indian Stocks (Approximate Prices)
    const STOCK_DATA = [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2985.45, change: 1.25 },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 4120.30, change: -0.45 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1650.10, change: 0.80 },
        { symbol: 'INFY', name: 'Infosys Ltd.', price: 1890.55, change: -1.10 },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1245.20, change: 0.55 },
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1560.75, change: 2.10 },
        { symbol: 'SBIN', name: 'State Bank of India', price: 820.40, change: 0.30 },
        { symbol: 'LICI', name: 'Life Insurance Corporation of India', price: 1050.90, change: -0.20 },
        { symbol: 'ITC', name: 'ITC Ltd.', price: 515.60, change: 0.15 },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', price: 2850.25, change: -0.90 },
        { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3670.80, change: 1.45 },
        { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', price: 7230.15, change: -1.50 },
        { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', price: 12450.00, change: 0.75 },
        { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', price: 1680.40, change: -0.60 },
        { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', price: 1890.10, change: 1.10 },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 980.50, change: 2.30 },
        { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', price: 3150.25, change: -2.10 },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', price: 1780.60, change: 0.40 },
        { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1290.30, change: 0.90 },
        { symbol: 'NTPC', name: 'NTPC Ltd.', price: 410.15, change: 1.05 },
        { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 560.80, change: -0.85 },
        { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', price: 11230.50, change: 0.65 },
        { symbol: 'TITAN', name: 'Titan Company Ltd.', price: 3450.20, change: -1.20 },
        { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', price: 1620.45, change: -0.75 },
        { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', price: 2980.10, change: -2.50 },
        { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', price: 2890.30, change: 1.80 },
        { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', price: 1450.60, change: -1.30 },
        { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', price: 340.25, change: 0.50 },
        { symbol: 'COALINDIA', name: 'Coal India Ltd.', price: 510.80, change: 1.15 },
        { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd.', price: 320.40, change: 0.95 },
        { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', price: 2560.15, change: -0.40 },
        { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', price: 2540.90, change: 0.25 },
        { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', price: 980.35, change: 1.60 },
        { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', price: 1540.20, change: -0.70 },
        { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', price: 165.40, change: 1.90 },
        { symbol: 'CIPLA', name: 'Cipla Ltd.', price: 1520.10, change: 0.35 },
        { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', price: 1680.50, change: -0.15 },
        { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.', price: 6750.30, change: 0.85 },
        { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', price: 640.20, change: 1.25 },
        { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.', price: 690.45, change: -0.55 },
        { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', price: 5890.10, change: 0.60 },
        { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', price: 5640.80, change: 1.35 },
        { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', price: 4890.25, change: -1.10 },
        { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd.', price: 4720.60, change: 0.45 },
        { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', price: 6850.40, change: -0.30 },
        { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', price: 1420.30, change: 1.15 },
        { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', price: 1980.50, change: -2.80 },
        { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 245.60, change: 3.40 },
        { symbol: 'PAYTM', name: 'One 97 Communications (Paytm)', price: 420.30, change: -4.50 },
        { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', price: 360.75, change: 1.90 }
    ];

    class MarketEngine {
        constructor() {
            this.stocks = STOCK_DATA;
            this.listeners = [];
            this.startSimulation();
        }

        startSimulation() {
            setInterval(() => {
                this.stocks.forEach(stock => {
                    // Randomly fluctuate price by -0.5% to +0.5%
                    const volatility = 0.005; 
                    const changePercent = (Math.random() * volatility * 2) - volatility;
                    const changeAmount = stock.price * changePercent;
                    
                    stock.price += changeAmount;
                    stock.change += (changePercent * 100); // Accumulate simulated change for the day
                    
                    // Simple logic to keep change coherent with price direction locally
                    if (changeAmount > 0) stock.change = Math.abs(stock.change);
                    else stock.change = -Math.abs(stock.change);
                });
                this.notifyListeners();
            }, 3000); // Update every 3 seconds
        }

        search(query) {
            if (!query) return [];
            const q = query.toLowerCase();
            return this.stocks.filter(s => 
                s.symbol.toLowerCase().includes(q) || 
                s.name.toLowerCase().includes(q)
            );
        }

        subscribe(callback) {
            this.listeners.push(callback);
        }

        notifyListeners() {
            this.listeners.forEach(cb => cb(this.stocks));
        }

        getStock(symbol) {
            return this.stocks.find(s => s.symbol === symbol);
        }

        getAllStocks() {
            return this.stocks;
        }
    }

    // Expose Global Instance
    window.MarketEngine = new MarketEngine();
})();
