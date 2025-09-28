import { Portfolio } from './analyzerService'

// CSV parsing
export function parseYahooPortfolioCsv(csvText) {
    if (!csvText || typeof csvText !== 'string') return []

    const lines = csvText
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)

    if (lines.length === 0) return []

    const rawHeader = safeCsvSplit(lines[0]).map(h => h.trim())
    const headerKeys = rawHeader.map(mapHeaderToKey)

    const numericKeys = new Set([
        'currentPrice', 'change', 'open', 'high', 'low',
        'volume', 'purchasePrice', 'quantity', 'commission',
        'highLimit', 'lowLimit'
    ])

    const records = []
    for (let i = 1; i < lines.length; i++) {
        const row = safeCsvSplit(lines[i])
        if (row.length === 1 && row[0] === '') continue
        const record = {}
        for (let c = 0; c < headerKeys.length; c++) {
            const key = headerKeys[c] || `col_${c}`
            const raw = (row[c] ?? '').trim()
            if (numericKeys.has(key)) {
                const num = raw === '' ? null : Number(raw)
                record[key] = Number.isFinite(num) ? num : null
            } else if (key === 'date' || key === 'tradeDate') {
                // Format dates as yyyy-mm-dd
                record[key] = formatDate(raw)
            } else {
                record[key] = raw
            }
        }
        records.push(record)
    }

    return records
}

export function portfolioFromCsv(csvText) {
    const records = parseYahooPortfolioCsv(csvText)
    return Portfolio.fromRecords(records)
}

// Session storage
export const PORTFOLIO_SESSION_KEY = 'etracker:portfolio:v1'

export function savePortfolioToSession(portfolio) {
    try {
        const data = JSON.stringify(portfolio)
        sessionStorage.setItem(PORTFOLIO_SESSION_KEY, data)
    } catch (err) {
        console.error('Failed to save portfolio to session', err)
    }
}

export function loadPortfolioFromSession() {
    try {
        const raw = sessionStorage.getItem(PORTFOLIO_SESSION_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        return Portfolio.fromJSON(parsed)
    } catch (err) {
        console.error('Failed to load portfolio from session', err)
        return null
    }
}

// Internal helpers
function safeCsvSplit(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current)
            current = ''
        } else {
            current += char
        }
    }
    result.push(current)
    return result
}

function formatDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return ''

    const cleaned = dateStr.trim()

    // Handle various date formats
    // YYYYMMDD format (like 20240228)
    if (/^\d{8}$/.test(cleaned)) {
        const year = cleaned.substring(0, 4)
        const month = cleaned.substring(4, 6)
        const day = cleaned.substring(6, 8)
        return `${year}-${month}-${day}`
    }

    // YYYY/MM/DD format
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleaned)) {
        const parts = cleaned.split('/')
        const year = parts[0]
        const month = parts[1].padStart(2, '0')
        const day = parts[2].padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // MM/DD/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
        const parts = cleaned.split('/')
        const month = parts[0].padStart(2, '0')
        const day = parts[1].padStart(2, '0')
        const year = parts[2]
        return `${year}-${month}-${day}`
    }

    // DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
        const parts = cleaned.split('/')
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2]
        return `${year}-${month}-${day}`
    }

    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned
    }

    // Try to parse as Date and format
    try {
        const date = new Date(cleaned)
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }
    } catch (e) {
        // Fall through to return original
    }

    // Return original if can't parse
    return cleaned
}

function mapHeaderToKey(label) {
    const normalized = label.trim().toLowerCase()
    const dictionary = {
        'symbol': 'symbol',
        'current price': 'currentPrice',
        'date': 'date',
        'time': 'time',
        'change': 'change',
        'open': 'open',
        'high': 'high',
        'low': 'low',
        'volume': 'volume',
        'trade date': 'tradeDate',
        'purchase price': 'purchasePrice',
        'quantity': 'quantity',
        'commission': 'commission',
        'high limit': 'highLimit',
        'low limit': 'lowLimit',
        'comment': 'comment',
        'transaction type': 'transactionType'
    }
    if (dictionary[normalized]) return dictionary[normalized]
    return normalized
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(' ')
        .map((w, idx) => idx === 0 ? w : (w.charAt(0).toUpperCase() + w.slice(1)))
        .join('')
}


