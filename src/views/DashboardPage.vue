<template>
    <v-main>
        <v-container>
            <div class="d-flex align-center justify-space-between mb-6">
                <h2 class="mb-0">Dashboard</h2>
                <v-btn color="primary" variant="flat" @click="triggerFilePick">Upload CSV</v-btn>
                <input ref="fileInput" type="file" accept=".csv,text/csv" class="d-none" @change="handleFileChange" />
            </div>

            <div v-if="chips.length" class="d-flex flex-wrap gap-2">
                <v-chip v-for="chip in chips" :key="chip" class="ma-1"
                    :color="chip === selected ? 'primary' : undefined" variant="elevated" @click="selected = chip">
                    {{ chip }}
                </v-chip>
            </div>

            <div v-else class="text-medium-emphasis">No symbols yet. Upload a Yahoo CSV to begin.</div>

            <!-- Portfolio Analysis Results -->
            <div v-if="analysis && analysis.symbolAnalysis" class="mt-8">
                <div class="d-flex align-center mb-4">
                    <span class="text-h5 font-weight-bold">Symbols</span>
                </div>
                <v-row>
                    <!-- All Portfolio Card -->
                    <v-col cols="12" sm="6" md="4" lg="3">
                        <v-card class="portfolio-card h-100" elevation="3" rounded="lg"
                            :class="{ 'selected-card': selected === 'All' }">
                            <v-card-text class="pa-3">
                                <div class="d-flex align-center justify-space-between mb-2">
                                    <div class="d-flex align-center">
                                        <v-avatar color="success" size="28" class="mr-2">
                                            <span class="text-white text-caption font-weight-bold">A</span>
                                        </v-avatar>
                                        <div class="text-subtitle-1 font-weight-bold">All Portfolio</div>
                                    </div>
                                    <v-chip color="success" variant="flat" size="x-small">
                                        Total
                                    </v-chip>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Total Value</span>
                                    <span class="text-subtitle-1 font-weight-bold text-success">
                                        ${{ totalPortfolioValue.toFixed(2) }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Avg Price</span>
                                    <span class="text-body-2 font-weight-bold">
                                        ${{ analysis.totalAveragePrice?.toFixed(2) || 'N/A' }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Symbols</span>
                                    <span class="text-body-2 font-weight-bold">
                                        {{ sortedSymbols.length }} stocks
                                    </span>
                                </div>

                                <v-divider class="my-2"></v-divider>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Total Gain/Loss</span>
                                    <span class="text-body-2 font-weight-bold"
                                        :class="analysis.totalGain >= 0 ? 'text-success' : 'text-error'">
                                        ${{ analysis.totalGain?.toFixed(2) || '0.00' }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Gain %</span>
                                    <span class="text-body-2 font-weight-bold"
                                        :class="analysis.totalGainPercentage >= 0 ? 'text-success' : 'text-error'">
                                        {{ analysis.totalGainPercentage?.toFixed(1) || '0.0' }}%
                                    </span>
                                </div>

                                <v-divider class="my-2"></v-divider>

                                <div class="d-flex justify-space-between align-center">
                                    <span class="text-caption text-medium-emphasis">Avg Value</span>
                                    <span class="text-body-2 font-weight-bold text-primary">
                                        ${{ sortedSymbols.length > 0 ? (totalPortfolioValue /
                                            sortedSymbols.length).toFixed(2) : '0.00' }}
                                    </span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <!-- Individual Symbol Cards -->
                    <v-col v-for="symbol in sortedSymbols" :key="symbol" cols="12" sm="6" md="4" lg="3">
                        <v-card class="portfolio-card h-100" elevation="3" rounded="lg"
                            :class="{ 'selected-card': selected === symbol }">
                            <v-card-text class="pa-3">
                                <div class="d-flex align-center justify-space-between mb-2">
                                    <div class="d-flex align-center">
                                        <v-avatar color="primary" size="28" class="mr-2">
                                            <span class="text-white text-caption font-weight-bold">{{
                                                symbol.charAt(0)
                                            }}</span>
                                        </v-avatar>
                                        <div class="text-subtitle-1 font-weight-bold">{{ symbol }}</div>
                                    </div>
                                    <v-chip :color="analysis.symbolAnalysis[symbol].totalValue > 0 ? 'success' : 'grey'"
                                        variant="flat" size="x-small">
                                        {{ analysis.symbolAnalysis[symbol].totalValue > 0 ? 'Active' :
                                            'Inactive' }}
                                    </v-chip>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Current Price</span>
                                    <span class="text-body-2 font-weight-bold text-primary">
                                        ${{ analysis.symbolAnalysis[symbol].currentPrice?.toFixed(2) || 'N/A' }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Avg Price</span>
                                    <span class="text-body-2 font-weight-bold">
                                        ${{ analysis.symbolAnalysis[symbol].averagePrice?.toFixed(2) || 'N/A' }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Quantity</span>
                                    <span class="text-body-2 font-weight-bold">
                                        {{ analysis.symbolAnalysis[symbol].totalQuantity }} units
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Total Spent</span>
                                    <span class="text-body-2 font-weight-bold text-warning">
                                        ${{ analysis.symbolAnalysis[symbol].totalExpended?.toFixed(2) || '0.00' }}
                                    </span>
                                </div>

                                <v-divider class="my-2"></v-divider>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Gain/Loss</span>
                                    <span class="text-body-2 font-weight-bold"
                                        :class="analysis.symbolAnalysis[symbol].gain >= 0 ? 'text-success' : 'text-error'">
                                        ${{ analysis.symbolAnalysis[symbol].gain?.toFixed(2) || '0.00' }}
                                    </span>
                                </div>

                                <div class="d-flex justify-space-between align-center mb-1">
                                    <span class="text-caption text-medium-emphasis">Gain %</span>
                                    <span class="text-body-2 font-weight-bold"
                                        :class="analysis.symbolAnalysis[symbol].gainPercentage >= 0 ? 'text-success' : 'text-error'">
                                        {{ analysis.symbolAnalysis[symbol].gainPercentage?.toFixed(1) || '0.0' }}%
                                    </span>
                                </div>

                                <v-divider class="my-2"></v-divider>

                                <div class="d-flex justify-space-between align-center">
                                    <span class="text-caption text-medium-emphasis">Total Value</span>
                                    <span class="text-subtitle-1 font-weight-bold text-success">
                                        ${{ analysis.symbolAnalysis[symbol].totalValue?.toFixed(2) || '0.00' }}
                                    </span>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Portfolio Performance Charts -->
                <div v-if="portfolioHistory.length > 0" class="mt-8">
                    <div class="d-flex align-center mb-4">
                        <span class="text-h5 font-weight-bold">Portfolio Performance</span>
                    </div>

                    <v-card class="mb-4" elevation="2" rounded="lg">
                        <v-card-title class="text-h6">Total Spent vs Total Value Over Time</v-card-title>
                        <v-card-text>
                            <div class="chart-container" style="height: 400px;">
                                <canvas ref="portfolioChart"></canvas>
                            </div>
                        </v-card-text>
                    </v-card>

                    <!-- Individual Symbol Charts -->
                    <v-row>
                        <v-col v-for="symbol in sortedSymbols" :key="`chart-${symbol}`" cols="12" md="6">
                            <v-card elevation="2" rounded="lg">
                                <v-card-title class="text-subtitle-1">{{ symbol }} Performance</v-card-title>
                                <v-card-text>
                                    <div class="chart-container" style="height: 300px;">
                                        <canvas :data-symbol="symbol"></canvas>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-container>
    </v-main>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Portfolio } from '../services/analyzerService'
import { portfolioFromCsv, savePortfolioToSession, loadPortfolioFromSession } from '../services/portfolioDataService'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
    name: 'DashboardPage',
    setup() {
        const fileInput = ref(null)
        const selected = ref('All')
        const symbols = ref([])
        const portfolio = ref(null)
        const analysis = ref(null)
        const portfolioChart = ref(null)
        const symbolCharts = ref({})

        const chips = computed(() => {
            const unique = Array.from(new Set(symbols.value))
            return unique.length ? ['All', ...unique] : []
        })

        const sortedSymbols = computed(() => {
            if (!analysis.value?.symbolAnalysis) return []
            return Object.entries(analysis.value.symbolAnalysis)
                .sort(([, a], [, b]) => (b.totalValue || 0) - (a.totalValue || 0))
                .map(([symbol]) => symbol)
        })

        const totalPortfolioValue = computed(() => {
            if (!analysis.value?.symbolAnalysis) return 0
            return Object.values(analysis.value.symbolAnalysis)
                .reduce((total, data) => total + (data.totalValue || 0), 0)
        })

        const portfolioHistory = computed(() => {
            if (!portfolio.value) return []
            return portfolio.value.getPortfolioHistory()
        })

        const chartData = computed(() => {
            if (!portfolioHistory.value.length) return { labels: [], datasets: [] }

            const labels = portfolioHistory.value.map(day => day.date)
            const spentData = portfolioHistory.value.map(day => day.totalSpent)
            const valueData = portfolioHistory.value.map(day => day.totalValue)

            return {
                labels,
                datasets: [
                    {
                        label: 'Total Spent',
                        data: spentData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Total Value',
                        data: valueData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.1
                    }
                ]
            }
        })

        function triggerFilePick() {
            if (fileInput.value) fileInput.value.click()
        }

        async function handleFileChange(event) {
            const file = event.target.files && event.target.files[0]
            if (!file) return
            try {
                const text = await file.text()
                portfolio.value = portfolioFromCsv(text)
                savePortfolioToSession(portfolio.value)
                analysis.value = portfolio.value.analyze()
                symbols.value = analysis.value.symbols
                selected.value = 'All'
            } catch (err) {
                console.error('Failed to read CSV', err)
            } finally {
                event.target.value = ''
            }
        }

        function createPortfolioChart() {
            if (!portfolioChart.value || !chartData.value.labels.length) return

            const ctx = portfolioChart.value.getContext('2d')
            new Chart(ctx, {
                type: 'line',
                data: chartData.value,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '$' + value.toFixed(2)
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return context.dataset.label + ': $' + context.parsed.y.toFixed(2)
                                }
                            }
                        }
                    }
                }
            })
        }

        function createSymbolChart(symbol) {
            if (!portfolioHistory.value.length) return

            const symbolData = portfolioHistory.value.map(day => ({
                date: day.date,
                spent: day.symbols[symbol]?.spent || 0,
                value: day.symbols[symbol]?.value || 0
            }))

            // Find the canvas element for this symbol
            const canvas = document.querySelector(`canvas[data-symbol="${symbol}"]`)
            if (!canvas) return

            const ctx = canvas.getContext('2d')
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: symbolData.map(d => d.date),
                    datasets: [
                        {
                            label: 'Spent',
                            data: symbolData.map(d => d.spent),
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.1
                        },
                        {
                            label: 'Value',
                            data: symbolData.map(d => d.value),
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '$' + value.toFixed(2)
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return context.dataset.label + ': $' + context.parsed.y.toFixed(2)
                                }
                            }
                        }
                    }
                }
            })
        }

        function createAllCharts() {
            nextTick(() => {
                createPortfolioChart()
                // Wait a bit more for individual symbol canvases to be rendered
                setTimeout(() => {
                    sortedSymbols.value.forEach(symbol => {
                        createSymbolChart(symbol)
                    })
                }, 100)
            })
        }

        watch(portfolioHistory, () => {
            if (portfolioHistory.value.length > 0) {
                createAllCharts()
            }
        }, { deep: true })

        onMounted(() => {
            const saved = loadPortfolioFromSession()
            if (saved) {
                portfolio.value = saved
                analysis.value = saved.analyze()
                symbols.value = analysis.value.symbols
                selected.value = 'All'
            }
        })

        return { fileInput, triggerFilePick, handleFileChange, chips, selected, analysis, sortedSymbols, totalPortfolioValue, portfolioHistory, chartData, portfolioChart, symbolCharts }
    }
}
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}

.portfolio-card {
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.portfolio-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.selected-card {
    border-color: rgb(var(--v-theme-primary)) !important;
    box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2) !important;
}

.selected-chip {
    background-color: rgb(var(--v-theme-primary)) !important;
    color: white !important;
}

.portfolio-card .v-card-title {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.05));
}

.portfolio-card .v-avatar {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary))) !important;
}
</style>
