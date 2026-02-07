// ===================================
// CHART.JS CONFIGURATIONS & UTILITIES
// ===================================

// Common chart options for consistent styling
const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#e0e0e0',
                font: {
                    size: 12,
                    family: "'Inter', sans-serif"
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(30, 30, 46, 0.95)',
            titleColor: '#00d4ff',
            bodyColor: '#e0e0e0',
            borderColor: '#00d4ff',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        // Format large numbers with K, M, B, T
                        const value = context.parsed.y;
                        label += formatLargeNumber(value);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                color: '#888',
                font: {
                    size: 11
                },
                callback: function(value) {
                    return formatLargeNumber(value);
                }
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.05)'
            }
        },
        x: {
            ticks: {
                color: '#888',
                font: {
                    size: 11
                },
                maxRotation: 45,
                minRotation: 0
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.05)'
            }
        }
    }
};

// Format large numbers with K, M, B, T abbreviations
function formatLargeNumber(num) {
    const absNum = Math.abs(num);
    
    if (absNum >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    } else if (absNum >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (absNum >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (absNum >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else if (absNum < 1) {
        // For small decimals, use 4 decimal places for better precision
        return num.toFixed(4);
    } else {
        return num.toFixed(2);
    }
}

// Color schemes
const colors = {
    primary: '#00d4ff',
    success: '#00ff88',
    warning: '#ffbb00',
    danger: '#ff4d6d',
    purple: '#9d4edd',
    orange: '#ff9f1c',
    gradients: {
        cyan: 'rgba(0, 212, 255, 0.6)',
        green: 'rgba(0, 255, 136, 0.6)',
        orange: 'rgba(255, 159, 28, 0.6)',
        red: 'rgba(255, 77, 109, 0.6)',
        purple: 'rgba(157, 78, 221, 0.6)'
    }
};

// ===================================
// ENERGY TRENDS CHARTS
// ===================================

function createMonthlyTrendChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Total Energy Usage',
                data: data.values,
                borderColor: colors.primary,
                backgroundColor: colors.gradients.cyan,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#1a1a2e',
                pointBorderWidth: 2
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Monthly Energy Consumption Trend',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Total Usage',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Month',
                        color: '#888'
                    }
                }
            }
        }
    });
}

function createUtilityMixChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.danger
                ],
                borderColor: '#1a1a2e',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e0e0e0',
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Energy Mix by Utility Type',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatLargeNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createHourlyPatternChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Average Usage per Hour',
                data: data.values,
                backgroundColor: colors.gradients.green,
                borderColor: colors.success,
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Hourly Energy Consumption Pattern',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Average Usage',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Hour of Day',
                        color: '#888'
                    }
                }
            }
        }
    });
}

// ===================================
// EFFICIENCY ANALYSIS CHARTS
// ===================================

function createTopBuildingsChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',  // Changed from 'horizontalBar' (deprecated) to 'bar'
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Energy per Sq Meter',
                data: data.values,
                backgroundColor: data.values.map(v => 
                    v > data.baseline ? colors.gradients.red : colors.gradients.green
                ),
                borderColor: data.values.map(v => 
                    v > data.baseline ? colors.danger : colors.success
                ),
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',  // This makes it horizontal
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Top 15 Buildings by Energy Intensity',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                annotation: {
                    annotations: {
                        baseline: {
                            type: 'line',
                            xMin: data.baseline,
                            xMax: data.baseline,
                            borderColor: colors.warning,
                            borderWidth: 3,
                            borderDash: [10, 5],
                            label: {
                                content: 'Campus Baseline',
                                enabled: true,
                                position: 'end',
                                color: colors.warning
                            }
                        }
                    }
                }
            },
            scales: {
                ...chartDefaults.scales,
                x: {
                    ...chartDefaults.scales.x,
                    type: 'logarithmic',  // Use log scale for huge value range
                    title: {
                        display: true,
                        text: 'Energy per Sq Meter (Log Scale)',
                        color: '#888',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function createParetoChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Excess Energy',
                    data: data.usage,
                    backgroundColor: colors.gradients.cyan,
                    borderColor: colors.primary,
                    borderWidth: 2,
                    borderRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Cumulative % (80% Target)',
                    data: data.cumulative,
                    type: 'line',
                    borderColor: colors.warning,
                    backgroundColor: 'transparent',
                    borderWidth: 4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: colors.warning,
                    pointBorderColor: '#1a1a2e',
                    pointBorderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Pareto Analysis - 80/20 Energy Distribution',
                    color: '#e0e0e0',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    ...chartDefaults.plugins.legend,
                    labels: {
                        ...chartDefaults.plugins.legend.labels,
                        font: {
                            size: 13
                        },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    ...chartDefaults.scales.y,
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Excess Energy (units)',
                        color: '#00d4ff',
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 100,
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Cumulative Percentage',
                        color: colors.warning,
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ...chartDefaults.scales.x,
                    ticks: {
                        color: '#888',
                        font: {
                            size: 10
                        },
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// ===================================
// REGRESSION MODEL CHARTS
// ===================================

function createActualVsPredictedChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Predictions',
                data: data.points,
                backgroundColor: colors.gradients.cyan,
                borderColor: colors.primary,
                pointRadius: 6,
                pointHoverRadius: 8
            }, {
                label: 'Perfect Prediction Line',
                data: data.perfectLine,
                type: 'line',
                borderColor: colors.danger,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [10, 5],
                pointRadius: 0
            }]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Actual vs Predicted Energy Consumption',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return [
                                `Actual: ${formatLargeNumber(point.x)}`,
                                `Predicted: ${formatLargeNumber(point.y)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Predicted',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Actual',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function createFeatureImportanceChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',  // Changed from 'horizontalBar' (deprecated) to 'bar'
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Coefficient Value',
                data: data.values,
                backgroundColor: data.values.map(v => 
                    v > 0 ? colors.gradients.purple : colors.gradients.orange
                ),
                borderColor: data.values.map(v => 
                    v > 0 ? colors.purple : colors.orange
                ),
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',  // This makes it horizontal
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Feature Importance (Model Coefficients)',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                ...chartDefaults.scales,
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Coefficient Value',
                        color: '#888'
                    }
                }
            }
        }
    });
}

function createTimeSeriesPredictionChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Actual',
                    data: data.actual,
                    borderColor: colors.success,
                    backgroundColor: colors.gradients.green,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Predicted',
                    data: data.predicted,
                    borderColor: colors.primary,
                    backgroundColor: colors.gradients.cyan,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Time Series: Actual vs Predicted Energy',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                ...chartDefaults.scales,
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Energy per Sq Meter',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Date',
                        color: '#888'
                    }
                }
            }
        }
    });
}

// ===================================
// DASHBOARD KPI CHARTS
// ===================================

function createDailyKPIChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Total Usage',
                    data: data.totalUsage,
                    borderColor: colors.primary,
                    backgroundColor: colors.gradients.cyan,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Avg Efficiency',
                    data: data.avgEfficiency,
                    borderColor: colors.success,
                    backgroundColor: colors.gradients.green,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...chartDefaults,
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Daily KPIs - Usage & Efficiency Trends',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                y: {
                    ...chartDefaults.scales.y,
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Total Usage',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Avg Efficiency',
                        color: '#888'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: chartDefaults.scales.x
            }
        }
    });
}

// ===================================
// SPIKE ANALYSIS CHART
// ===================================

function createEnergySpikeChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Energy Spike (kWh)',
                data: data.values,
                backgroundColor: colors.gradients.red,
                borderColor: colors.danger,
                borderWidth: 2,
                borderRadius: 4
            }]
        },
        options: {
            ...chartDefaults,
            indexAxis: 'y',
            plugins: {
                ...chartDefaults.plugins,
                title: {
                    display: true,
                    text: 'Top 20 Energy Consumption Spikes',
                    color: '#e0e0e0',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: false
                },
                tooltip: {
                    ...chartDefaults.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return `${formatLargeNumber(context.parsed.x)} kWh`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ...chartDefaults.scales.x,
                    title: {
                        display: true,
                        text: 'Energy Consumption (kWh)',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return formatLargeNumber(value);
                        }
                    }
                },
                y: {
                    ...chartDefaults.scales.y,
                    title: {
                        display: true,
                        text: 'Spike Event',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function destroyChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
}

function updateChartData(chartInstance, newData) {
    if (chartInstance) {
        chartInstance.data = newData;
        chartInstance.update();
    }
}

// Export for use in other files
window.ChartUtils = {
    createMonthlyTrendChart,
    createUtilityMixChart,
    createHourlyPatternChart,
    createTopBuildingsChart,
    createParetoChart,
    createActualVsPredictedChart,
    createFeatureImportanceChart,
    createTimeSeriesPredictionChart,
    createDailyKPIChart,
    createEnergySpikeChart,
    destroyChart,
    updateChartData,
    formatLargeNumber,
    colors
};
