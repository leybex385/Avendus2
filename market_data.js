/**
 * Market Data Engine - Simulates Real-time Indian Stock Market Data
 * 
 * Features:
 * - Mock list of top NSE/BSE stocks
 * - Simulated price fluctuation
 * - Search capability
 */

(function () {
    // Top 50 Indian Stocks (Approximate Prices)
    const STOCK_DATA = [
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2985.45, change: 1.25, type: 'stock' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 4120.30, change: -0.45, type: 'stock' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1650.10, change: 0.80, type: 'stock' },
        { symbol: 'INFY', name: 'Infosys Ltd.', price: 1890.55, change: -1.10, type: 'stock' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1245.20, change: 0.55, type: 'stock' },
        { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', price: 1560.75, change: 2.10, type: 'stock' },
        { symbol: 'SBIN', name: 'State Bank of India', price: 820.40, change: 0.30, type: 'stock' },
        { symbol: 'LICI', name: 'Life Insurance Corporation of India', price: 1050.90, change: -0.20, type: 'stock' },
        { symbol: 'ITC', name: 'ITC Ltd.', price: 515.60, change: 0.15, type: 'stock' },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', price: 2850.25, change: -0.90, type: 'stock' },
        { symbol: 'LT', name: 'Larsen & Toubro Ltd.', price: 3670.80, change: 1.45, type: 'stock' },
        { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', price: 7230.15, change: -1.50, type: 'stock' },
        { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', price: 12450.00, change: 0.75, type: 'stock' },
        { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', price: 1680.40, change: -0.60, type: 'stock' },
        { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', price: 1890.10, change: 1.10, type: 'stock' },
        { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 980.50, change: 2.30, type: 'stock' },
        { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', price: 3150.25, change: -2.10, type: 'stock' },
        { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', price: 1780.60, change: 0.40, type: 'stock' },
        { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1290.30, change: 0.90, type: 'stock' },
        { symbol: 'NTPC', name: 'NTPC Ltd.', price: 410.15, change: 1.05, type: 'stock' },
        { symbol: 'WIPRO', name: 'Wipro Ltd.', price: 560.80, change: -0.85, type: 'stock' },
        { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', price: 11230.50, change: 0.65, type: 'stock' },
        { symbol: 'TITAN', name: 'Titan Company Ltd.', price: 3450.20, change: -1.20, type: 'stock' },
        { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', price: 1620.45, change: -0.75, type: 'stock' },
        { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', price: 2980.10, change: -2.50, type: 'stock' },
        { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', price: 2890.30, change: 1.80, type: 'stock' },
        { symbol: 'ADANIPORTS', name: 'Adani Ports and SEZ Ltd.', price: 1450.60, change: -1.30, type: 'stock' },
        { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', price: 340.25, change: 0.50, type: 'stock' },
        { symbol: 'COALINDIA', name: 'Coal India Ltd.', price: 510.80, change: 1.15, type: 'stock' },
        { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd.', price: 320.40, change: 0.95, type: 'stock' },
        { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', price: 2560.15, change: -0.40, type: 'stock' },
        { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', price: 2540.90, change: 0.25, type: 'stock' },
        { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', price: 980.35, change: 1.60, type: 'stock' },
        { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', price: 1540.20, change: -0.70, type: 'stock' },
        { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', price: 165.40, change: 1.90, type: 'stock' },
        { symbol: 'CIPLA', name: 'Cipla Ltd.', price: 1520.10, change: 0.35, type: 'stock' },
        { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd.', price: 1680.50, change: -0.15, type: 'stock' },
        { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd.', price: 6750.30, change: 0.85, type: 'stock' },
        { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd.', price: 640.20, change: 1.25, type: 'stock' },
        { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd.', price: 690.45, change: -0.55, type: 'stock' },
        { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', price: 5890.10, change: 0.60, type: 'stock' },
        { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', price: 5640.80, change: 1.35, type: 'stock' },
        { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', price: 4890.25, change: -1.10, type: 'stock' },
        { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd.', price: 4720.60, change: 0.45, type: 'stock' },
        { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', price: 6850.40, change: -0.30, type: 'stock' },
        { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', price: 1420.30, change: 1.15, type: 'stock' },
        { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', price: 1980.50, change: -2.80, type: 'stock' },
        { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 245.60, change: 3.40, type: 'stock' },
        { symbol: 'PAYTM', name: 'One 97 Communications (Paytm)', price: 420.30, change: -4.50, type: 'stock' },
        { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd.', price: 360.75, change: 1.90, type: 'stock' }
    ];

    const OTC_DATA = [
        { symbol: 'DELHIVERY-OTC', name: 'Delhivery Private Placement', price: 420.00, change: 0, type: 'OTC' },
        { symbol: 'BYJUS-OTC', name: 'Byju\'s Secondary Market', price: 2500.00, change: 0, type: 'OTC' },
        { symbol: 'SWIGGY-OTC', name: 'Swiggy Pre-IPO Shares', price: 310.00, change: 0, type: 'OTC' }
    ];

    const IPO_DATA = [
        { symbol: 'HYUNDAI-IPO', name: 'Hyundai India IPO', price: 1960.00, change: 0, type: 'IPO' },
        { symbol: 'OLA-IPO', name: 'Ola Electric IPO', price: 76.00, change: 0, type: 'IPO' },
        { symbol: 'NSDL-IPO', name: 'NSDL IPO', price: 920.00, change: 0, type: 'IPO' },
        { symbol: 'COLGATE-IPO', name: 'Colgate-Palmolive India', price: 1648.88, yield: '31.39%', level: 'Lv > 1', type: 'IPO' }
    ];

    const INDICES_DATA = [
        { symbol: 'SENSEX', name: 'BSE SENSEX', price: 83710.26, change: 396.33, changePercent: 0.48, type: 'index' },
        { symbol: 'NIFTY 50', name: 'NSE NIFTY 50', price: 25619.54, change: -156.46, changePercent: -0.61, type: 'index' },
        { symbol: 'NIFTY BANK', name: 'NSE NIFTY BANK', price: 60120.55, change: -563.00, changePercent: -0.09, type: 'index' },
        { symbol: 'NIFTY SMLCAP', name: 'NIFTY SMALLCAP 100', price: 16938.65, change: -45.53, changePercent: -0.27, type: 'index' },
        { symbol: 'NIFTY MIDCAP', name: 'NIFTY MIDCAP 100', price: 59502.70, change: -144.00, changePercent: -0.02, type: 'index' },
        { symbol: 'VIX', name: 'INDIA VIX', price: 15.1, change: 1.46, changePercent: 10.73, type: 'index' }
    ];

    class MarketEngine {
        constructor() {
            this.stocks = STOCK_DATA;
            this.otc = OTC_DATA;
            this.ipo = IPO_DATA;
            this.indices = INDICES_DATA;
            this.dbProducts = []; // Cache for database products
            this.listeners = [];
            this.startSimulation();
            this.syncFromDB();
        }

        async syncFromDB() {
            if (window.DB && window.DB.getProducts) {
                try {
                    const data = await window.DB.getProducts();
                    this.dbProducts = data.map(p => ({
                        symbol: p.name.split(' ')[0].toUpperCase() + '-IPO',
                        name: p.name,
                        price: parseFloat(p.price) || 0,
                        yield: p.profit || 'TBD',
                        subDate: p.start_date || 'TBD',
                        deadline: p.end_date || 'TBD',
                        listingDate: p.listing_date || 'TBD',
                        level: (parseFloat(p.min_invest) > 100000) ? 'Lv ≥ 2' : 'Lv ≥ 1',
                        type: p.type || 'IPO',
                        change: 0
                    }));
                    this.notifyListeners();
                } catch (e) {
                    console.error("Failed to sync products from DB:", e);
                }
            }
        }

        startSimulation() {
            setInterval(() => {
                // Fluctuate Stocks
                this.stocks.forEach(stock => {
                    const volatility = 0.005;
                    const changePercent = (Math.random() * volatility * 2) - volatility;
                    const changeAmount = stock.price * changePercent;
                    stock.price += changeAmount;
                    stock.change += (changePercent * 100);
                    if (changeAmount > 0) stock.change = Math.abs(stock.change);
                    else stock.change = -Math.abs(stock.change);
                });

                // Fluctuate OTC (New: Real-time fluctuation)
                this.otc.forEach(stock => {
                    const volatility = 0.003;
                    const changePercent = (Math.random() * volatility * 2) - volatility;
                    stock.price += (stock.price * changePercent);
                });

                // Fluctuate IPO (New: Real-time fluctuation)
                this.ipo.forEach(stock => {
                    const volatility = 0.002;
                    const changePercent = (Math.random() * volatility * 2) - volatility;
                    stock.price += (stock.price * changePercent);
                });

                // Fluctuate Indices
                this.indices.forEach(idx => {
                    const volatility = 0.002; // Indices are less volatile
                    const changePercent = (Math.random() * volatility * 2) - volatility;
                    const changeAmount = idx.price * changePercent;
                    idx.price += changeAmount;
                    idx.change += changeAmount;
                    idx.changePercent += (changePercent * 100);
                });

                this.notifyListeners();
            }, 1000);
        }

        search(query) {
            if (!query) return [];
            const q = query.toLowerCase();
            const all = [...this.stocks, ...this.otc, ...this.getIPO(), ...this.indices];
            return all.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q)
            );
        }

        getIndices() { return this.indices; }

        getAllStocks() { return this.stocks; }
        getOTC() { return this.otc; }
        getIPO() {
            return [...this.ipo, ...this.dbProducts];
        }

        getProduct(symbol) {
            const all = [...this.stocks, ...this.otc, ...this.getIPO(), ...this.indices];
            return all.find(s => s.symbol === symbol);
        }
    }

    // Expose Global Instance
    window.MarketEngine = new MarketEngine();
})();
