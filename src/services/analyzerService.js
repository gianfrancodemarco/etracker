// Classes to represent portfolio data
export class PortfolioRow {
    constructor(fields) {
        this.symbol = fields.symbol || ''
        this.currentPrice = fields.currentPrice ?? null
        this.date = fields.date || ''
        this.time = fields.time || ''
        this.change = fields.change ?? null
        this.open = fields.open ?? null
        this.high = fields.high ?? null
        this.low = fields.low ?? null
        this.volume = fields.volume ?? null
        this.tradeDate = fields.tradeDate || ''
        this.purchasePrice = fields.purchasePrice ?? null
        this.quantity = fields.quantity ?? null
        this.commission = fields.commission ?? null
        this.highLimit = fields.highLimit ?? null
        this.lowLimit = fields.lowLimit ?? null
        this.comment = fields.comment || ''
        this.transactionType = fields.transactionType || ''
        // Keep any extra fields
        for (const key in fields) {
            if (!(key in this)) this[key] = fields[key]
        }
    }

    static fromRecord(record) {
        return new PortfolioRow(record || {})
    }

    toObject() {
        const obj = {}
        for (const key in this) {
            obj[key] = this[key]
        }
        return obj
    }
}

export class Portfolio {
    constructor(rows) {
        this.rows = Array.isArray(rows) ? rows : []
    }

    static fromRecords(records) {
        const rows = (records || []).map(r => PortfolioRow.fromRecord(r))
        return new Portfolio(rows)
    }


    getSymbols() {
        return Array.from(new Set(
            this.rows
                .map(r => (r && r.symbol) ? String(r.symbol).trim() : '')
                .filter(s => s.length > 0)
        ))
    }

    getSymbolPrice(symbol) {
        // Get the latest trade date price for a symbol
        const symbolRows = this.rows.filter(row => row.symbol === symbol)
        if (symbolRows.length === 0) return null

        // Sort by trade date descending to get the latest
        const sortedRows = symbolRows.sort((a, b) => {
            const dateA = a.tradeDate || a.date || ''
            const dateB = b.tradeDate || b.date || ''
            if (!dateA && !dateB) return 0
            if (!dateA) return 1
            if (!dateB) return -1
            return dateB.localeCompare(dateA)
        })

        return sortedRows[0].currentPrice
    }

    getCurrentHolding(symbol) {
        // Calculate total quantity for a symbol
        const symbolRows = this.rows.filter(row => row.symbol === symbol)
        return symbolRows.reduce((total, row) => {
            const quantity = row.quantity || 0
            return total + quantity
        }, 0)
    }

    getCurrentHoldingPrice(symbol) {
        // Calculate total value (quantity * current price) for a symbol
        const quantity = this.getCurrentHolding(symbol)
        const currentPrice = this.getSymbolPrice(symbol)
        return quantity * (currentPrice || 0)
    }

    getAveragePrice(symbol) {
        // Calculate weighted average purchase price for a symbol
        const symbolRows = this.rows.filter(row => row.symbol === symbol)
        if (symbolRows.length === 0) return null

        let totalCost = 0
        let totalQuantity = 0

        symbolRows.forEach(row => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            if (quantity > 0 && purchasePrice > 0) {
                totalCost += quantity * purchasePrice
                totalQuantity += quantity
            }
        })

        return totalQuantity > 0 ? totalCost / totalQuantity : null
    }

    getGain(symbol) {
        // Calculate gain/loss for a symbol
        const currentPrice = this.getSymbolPrice(symbol)
        const averagePrice = this.getAveragePrice(symbol)
        const quantity = this.getCurrentHolding(symbol)

        if (!currentPrice || !averagePrice || quantity <= 0) return null

        const currentValue = quantity * currentPrice
        const costBasis = quantity * averagePrice
        return currentValue - costBasis
    }

    getGainPercentage(symbol) {
        // Calculate gain/loss percentage for a symbol
        const averagePrice = this.getAveragePrice(symbol)
        const currentPrice = this.getSymbolPrice(symbol)

        if (!averagePrice || !currentPrice || averagePrice <= 0) return null

        return ((currentPrice - averagePrice) / averagePrice) * 100
    }

    getTotalExpended(symbol) {
        // Calculate total amount spent (cost basis) for a symbol
        const symbolRows = this.rows.filter(row => row.symbol === symbol)
        return symbolRows.reduce((total, row) => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            return total + (quantity * purchasePrice)
        }, 0)
    }

    getAllTradeDates() {
        // Extract all unique trade dates from the portfolio
        const dates = new Set()
        this.rows.forEach(row => {
            const tradeDate = row.tradeDate || row.date
            if (tradeDate && tradeDate.trim()) {
                dates.add(tradeDate.trim())
            }
        })
        return Array.from(dates).sort()
    }

    getHistoricalSpending(symbol, date) {
        // Calculate cumulative spending for a symbol up to a specific date
        const symbolRows = this.rows.filter(row => {
            if (row.symbol !== symbol) return false
            const rowDate = row.tradeDate || row.date || ''
            return rowDate && rowDate <= date
        })

        return symbolRows.reduce((total, row) => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            return total + (quantity * purchasePrice)
        }, 0)
    }

    getHistoricalValue(symbol, date) {
        // Calculate total value for a symbol at a specific date (only for shares already bought)
        const symbolRows = this.rows.filter(row => {
            if (row.symbol !== symbol) return false
            const rowDate = row.tradeDate || row.date || ''
            return rowDate && rowDate <= date
        })

        if (symbolRows.length === 0) return 0

        // Get the price at that date (latest price up to that date)
        const sortedRows = symbolRows.sort((a, b) => {
            const dateA = a.tradeDate || a.date || ''
            const dateB = b.tradeDate || b.date || ''
            return dateB.localeCompare(dateA)
        })

        const priceAtDate = sortedRows[0].currentPrice || 0
        const totalQuantity = symbolRows.reduce((total, row) => {
            return total + (row.quantity || 0)
        }, 0)

        return totalQuantity * priceAtDate
    }

    getPortfolioHistory() {
        // Get complete portfolio history with spending and values over time
        const dates = this.getAllTradeDates()
        const symbols = this.getSymbols()
        const history = []

        dates.forEach(date => {
            const dayData = {
                date,
                totalSpent: 0,
                totalValue: 0,
                symbols: {}
            }

            symbols.forEach(symbol => {
                const spent = this.getHistoricalSpending(symbol, date)
                const value = this.getHistoricalValue(symbol, date)

                dayData.symbols[symbol] = { spent, value }
                dayData.totalSpent += spent
                dayData.totalValue += value
            })

            history.push(dayData)
        })

        return history
    }

    getTotalAveragePrice() {
        // Calculate weighted average purchase price across all symbols
        let totalCost = 0
        let totalQuantity = 0

        this.rows.forEach(row => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            if (quantity > 0 && purchasePrice > 0) {
                totalCost += quantity * purchasePrice
                totalQuantity += quantity
            }
        })

        return totalQuantity > 0 ? totalCost / totalQuantity : null
    }

    getTotalGain() {
        // Calculate total gain/loss across all symbols
        const totalCurrentValue = this.getSymbols().reduce((sum, symbol) => {
            return sum + this.getCurrentHoldingPrice(symbol)
        }, 0)

        const totalCostBasis = this.rows.reduce((sum, row) => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            return sum + (quantity * purchasePrice)
        }, 0)

        return totalCurrentValue - totalCostBasis
    }

    getTotalGainPercentage() {
        // Calculate total gain/loss percentage across all symbols
        const totalCostBasis = this.rows.reduce((sum, row) => {
            const quantity = row.quantity || 0
            const purchasePrice = row.purchasePrice || 0
            return sum + (quantity * purchasePrice)
        }, 0)

        if (totalCostBasis <= 0) return null

        const totalGain = this.getTotalGain()
        return (totalGain / totalCostBasis) * 100
    }

    analyze() {
        const symbols = this.getSymbols()
        const symbolAnalysis = {}

        symbols.forEach(symbol => {
            symbolAnalysis[symbol] = {
                currentPrice: this.getSymbolPrice(symbol),
                totalQuantity: this.getCurrentHolding(symbol),
                totalValue: this.getCurrentHoldingPrice(symbol),
                averagePrice: this.getAveragePrice(symbol),
                gain: this.getGain(symbol),
                gainPercentage: this.getGainPercentage(symbol),
                totalExpended: this.getTotalExpended(symbol)
            }
        })

        return {
            totalRecords: this.rows.length,
            symbols,
            symbolAnalysis,
            totalAveragePrice: this.getTotalAveragePrice(),
            totalGain: this.getTotalGain(),
            totalGainPercentage: this.getTotalGainPercentage()
        }
    }

    toJSON() {
        return {
            rows: this.rows.map(r => r.toObject())
        }
    }

    static fromJSON(json) {
        if (!json || !Array.isArray(json.rows)) return new Portfolio([])
        const rows = json.rows.map(r => PortfolioRow.fromRecord(r))
        return new Portfolio(rows)
    }
}



