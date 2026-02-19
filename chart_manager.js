/**
 * ChartManager - Secure & Real-time Trading Chart
 * Uses Lightweight Charts + Backend Proxy
 */
const ChartManager = {
    chart: null,
    candleSeries: null,
    volumeSeries: null,
    currentSymbol: null,
    pollingInterval: null,
    pollingTime: 5000, // 5 seconds

    // Container ID
    containerId: null,

    // Initialize the Chart Manager (just store ID)
    init: function (containerId) {
        this.containerId = containerId;
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("Chart container not found:", containerId);
            return;
        }
        // Handle Resize observer on the container
        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || entries[0].target !== container) { return; }
            if (this.chart) {
                const newRect = entries[0].contentRect;
                this.chart.applyOptions({ height: newRect.height, width: newRect.width });
            }
        });
        resizeObserver.observe(container);
    },

    createChartInstance: function () {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Strict Requirement: Clear chart container
        container.innerHTML = '';

        // Strict Requirement: Create new LightweightCharts instance
        this.chart = LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { type: 'solid', color: '#ffffff' },
                textColor: '#333',
            },
            grid: {
                vertLines: { color: '#f0f3fa' },
                horzLines: { color: '#f0f3fa' },
            },
            rightPriceScale: {
                borderVisible: false,
            },
            timeScale: {
                borderVisible: false,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        });

        // Add Series
        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });
    },

    // Load a Symbol
    loadSymbol: async function (symbol) {
        console.log(`Loading Symbol: ${symbol}`);

        // Stop polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log("Polling stopped.");
        }

        // Destroy existing chart and create new instance
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }
        this.createChartInstance();

        this.currentSymbol = symbol;

        // Fetch Historical Data
        try {
            const data = await this.fetchData(symbol);
            if (!data || data.status === 'error') {
                throw new Error(data?.message || "Market data unavailable");
            }
            if (!data.values || !Array.isArray(data.values)) {
                throw new Error("Invalid data format received");
            }

            // Transform Data for LightweightCharts
            // Twelve Data returns newest first, so reverse it
            const candles = data.values.map(d => ({
                time: this.parseTime(d.datetime),
                open: parseFloat(d.open),
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: parseFloat(d.close),
            })).reverse();

            this.candleSeries.setData(candles);
            console.log(`Loaded ${candles.length} candles for ${symbol}`);

            // Start Polling
            this.startPolling();

        } catch (e) {
            console.error("Chart Load Error:", e);
            // Display Error on UI if needed (using user's alert system maybe?)
            // Or just overlay on chart container
            if (window.CustomUI) {
                // window.CustomUI.alert(e.message, "Chart Error", "error"); 
                // Don't popup alert for chart fetch, just log or show text
            }
        }
    },

    startPolling: function () {
        if (!this.currentSymbol) return;
        console.log("Starting polling...");

        this.pollingInterval = setInterval(async () => {
            try {
                // Fetch latest candle (outputsize=1)
                // Note: The backend is hardcoded to 300, but we can update backend to accept outputsize 
                // or just fetch the standard and take the last one.
                // Re-fetching full 300 is inefficient but safe for MVP. 
                // Ideally, we add 'outputsize' param to backend.

                // Let's modify backend later to accept outputsize, or just live with it.
                // Actually, user spec: "Backend must... Return JSON".
                // User spec: "Polling... Fetch latest candle (outputsize=1)". 
                // So I SHOULD update backend to proxy query params properly.

                // I will add outputsize to the fetch URL query
                const data = await this.fetchData(this.currentSymbol, '1day', 1); // 1 candle

                if (data && data.values && data.values.length > 0) {
                    const d = data.values[0];
                    const candle = {
                        time: this.parseTime(d.datetime),
                        open: parseFloat(d.open),
                        high: parseFloat(d.high),
                        low: parseFloat(d.low),
                        close: parseFloat(d.close),
                    };

                    this.candleSeries.update(candle);
                    console.log("Candle updated:", candle.time);
                }
            } catch (e) {
                console.error("Polling Error:", e);
            }
        }, this.pollingTime);
    },

    fetchData: async function (symbol, interval = '1day', outputsize = 300) {
        // Call Backend Proxy
        // Map symbol if needed? User declared strict format, so pass as is.
        // The api.php I wrote hardcodes outputsize=300. I need to update api.php to allow dynamic outputsize.
        // Assuming I fix api.php:

        const url = `api.php?action=getMarketData&symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}`;
        console.log("Fetching:", url);

        const response = await fetch(url);
        const json = await response.json();
        return json;
    },

    parseTime: function (timeStr) {
        // Twelve Data returns YYYY-MM-DD for daily
        // createChart expects 'yyyy-mm-dd' string or unix timestamp
        return timeStr;
    }
};

// Auto-init if container exists
document.addEventListener('DOMContentLoaded', () => {
    // Check if on market page
    if (document.getElementById('chart-container-realtime')) {
        ChartManager.init('chart-container-realtime');

        // Load default symbol
        ChartManager.loadSymbol('BSE:SENSEX');
    }
});
