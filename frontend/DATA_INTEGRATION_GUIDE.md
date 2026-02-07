# 📊 OSU Energy Analysis - Data Integration Guide

## 🎯 Overview

This guide explains **how to replace placeholder data** in your HTML files with **real data from your Databricks notebooks**. All charts currently display example data that can be easily updated once you provide actual outputs from your analysis.

---

## 🔄 Data Update Workflow

### Step 1: Run Your Databricks Notebooks

1. Open your Databricks workspace: `https://dbc-5ecd4de1-8ac6.cloud.databricks.com`
2. Navigate to your notebooks folder
3. Run the following notebooks in order:
   - `01_load_join.ipynb`
   - `02_energy_trends.ipynb`
   - `03_efficiency_analysis.ipynb`
   - `04_regression_modelling.ipynb`
   - `06_regression_dashboard_only.ipynb`

### Step 2: Export Data from Notebooks

For each notebook, copy the output data I'll specify below. You can:
- Download outputs as CSV
- Copy table data directly
- Take screenshots of key metrics
- Export Delta tables to JSON

---

## 📈 Energy Trends Page (`energy-trends.html`)

### Chart 1: Monthly Trend Chart

**What I need:** Monthly total energy consumption

**From Notebook:** `02_energy_trends.ipynb` - Monthly aggregation

**Expected data format:**
```python
# Query the monthly_trend table
monthly_data = spark.sql("""
    SELECT month, SUM(total_usage) as total_usage
    FROM osu_energy.monthly_trend
    GROUP BY month
    ORDER BY month
""").toPandas()

print(monthly_data[['month', 'total_usage']].values.tolist())
```

**Where to update in HTML:**
Look for this section in `energy-trends.html` around line 450:
```javascript
const monthlyData = {
  labels: ['January 2025', 'February 2025', 'March 2025', 'April 2025'],  // ← REPLACE
  values: [125000, 118000, 105000, 95000]  // ← REPLACE
};
```

**Replace with your data:**
- `labels`: Month names from your data
- `values`: Total usage values for each month

---

### Chart 2: Hourly Pattern Chart

**What I need:** Average usage for each hour of the day (0-23)

**From Notebook:** `02_energy_trends.ipynb` - Hourly aggregation

**Expected query:**
```python
hourly_data = spark.sql("""
    SELECT hour, AVG(total_energy) as avg_usage
    FROM osu_energy.hourly_trend
    GROUP BY hour
    ORDER BY hour
""").toPandas()

print(hourly_data[['hour', 'avg_usage']].values.tolist())
```

**Where to update:** Line ~460 in `energy-trends.html`
```javascript
const hourlyData = {
  labels: [...],  // Hours 0-23
  values: [...]   // Average usage per hour
};
```

---

### Chart 3: Utility Mix Chart (Doughnut)

**What I need:** Total consumption by utility type

**Expected query:**
```python
utility_data = spark.sql("""
    SELECT utility, SUM(total_usage) as total
    FROM osu_energy.monthly_trend
    GROUP BY utility
    ORDER BY total DESC
""").toPandas()

print(utility_data[['utility', 'total']].values.tolist())
```

**Where to update:** Line ~475 in `energy-trends.html`
```javascript
const utilityData = {
  labels: ['Electricity', 'Steam', 'Chilled Water', 'Natural Gas'],  // ← REPLACE
  values: [185000, 142000, 98000, 18000]  // ← REPLACE
};
```

---

## ⚡ Efficiency Analysis Page (`efficiency-analysis.html`)

### Chart 1: Top Buildings by Energy Intensity

**What I need:** Top 15 buildings with highest energy per square meter

**From Notebook:** `03_efficiency_analysis.ipynb`

**Expected query:**
```python
top_buildings = spark.sql("""
    SELECT sitename, energy_per_sqm
    FROM workspace.default.daily_efficiency
    WHERE energy_per_sqm IS NOT NULL
    GROUP BY sitename, energy_per_sqm
    ORDER BY energy_per_sqm DESC
    LIMIT 15
""").toPandas()

# Also get the campus baseline
baseline = spark.sql("""
    SELECT AVG(energy_per_sqm) as baseline
    FROM workspace.default.daily_efficiency
""").collect()[0]['baseline']

print("Buildings:", top_buildings['sitename'].tolist())
print("Values:", top_buildings['energy_per_sqm'].tolist())
print("Baseline:", baseline)
```

**Where to update:** Line ~620 in `efficiency-analysis.html`
```javascript
const topBuildingsData = {
  labels: [
    'Science Lab A',  // ← REPLACE with real building names
    'Old Admin Building',
    ...
  ],
  values: [2.8, 2.6, 2.4, ...],  // ← REPLACE with actual energy_per_sqm
  baseline: 1.0  // ← REPLACE with campus baseline
};
```

---

### Chart 2: Pareto Chart (80/20 Analysis)

**What I need:** Buildings sorted by excess energy with cumulative percentage

**From Notebook:** `03_efficiency_analysis.ipynb` - Priority buildings Pareto analysis

**Expected output:**
```python
pareto_data = spark.sql("""
    SELECT sitename, excess_energy_kwh, cumulative_pct
    FROM workspace.default.priority_buildings
    WHERE cumulative_pct <= 95
    ORDER BY excess_energy_kwh DESC
    LIMIT 15
""").toPandas()

print("Labels:", pareto_data['sitename'].tolist())
print("Usage:", pareto_data['excess_energy_kwh'].tolist())
print("Cumulative %:", pareto_data['cumulative_pct'].tolist())
```

**Where to update:** Line ~650 in `efficiency-analysis.html`
```javascript
const paretoData = {
  labels: ['Building 1', 'Building 2', ...],  // ← REPLACE with sitename
  usage: [125000, 98000, 87000, ...],  // ← REPLACE with excess_energy_kwh
  cumulative: [15, 27, 37, 46, ...]  // ← REPLACE with cumulative_pct
};
```

---

## 🤖 Regression Model Page (`regression-model.html`)

### Chart 1: Actual vs Predicted Scatter Plot

**What I need:** Actual and predicted values from your test set

**From Notebook:** `04_regression_modelling.ipynb`

**Expected query:**
```python
predictions = spark.sql("""
    SELECT energy_per_sqm as actual, prediction as predicted
    FROM workspace.default.daily_efficiency_predictions
    LIMIT 100
""").toPandas()

# Format as points for scatter plot
points = [{'x': row['actual'], 'y': row['predicted']} 
          for _, row in predictions.iterrows()]

print("Points:", points[:50])  # First 50 for readability
```

**Where to update:** Line ~385 in `regression-model.html`
```javascript
const scatterData = {
  points: [
    {x: 25, y: 24}, {x: 32, y: 33}, ...  // ← REPLACE
  ],
  perfectLine: [{x: 20, y: 20}, {x: 60, y: 60}]  // Adjust range if needed
};
```

---

### Chart 2: Feature Importance

**What I need:** Model coefficients from linear regression

**From Notebook:** `04_regression_modelling.ipynb` - Model training section

**Get coefficients:**
```python
from pyspark.ml.regression import LinearRegression

# After training your model
coefficients = model.coefficients
intercept = model.intercept

# Feature names in the same order as your feature vector
feature_names = ['square_meters', 'n_readings', 'day_of_week', 'is_priority']

# Print coefficients
for name, coef in zip(feature_names, coefficients):
    print(f"{name}: {coef}")
print(f"Intercept: {intercept}")
```

**Where to update:** Line ~410 in `regression-model.html`
```javascript
const featureData = {
  labels: ['is_priority', 'n_readings', 'Intercept', ...],  // ← REPLACE
  values: [12.5, 0.05, 15.2, ...]  // ← REPLACE with actual coefficients
};
```

---

### Chart 3: Time Series Predictions

**What I need:** Daily actual vs predicted values over time

**From Notebook:** `04_regression_modelling.ipynb` or `06_regression_dashboard_only.ipynb`

**Expected query:**
```python
timeseries = spark.sql("""
    SELECT day, 
           AVG(energy_per_sqm) as actual,
           AVG(prediction) as predicted
    FROM workspace.default.daily_efficiency_predictions
    GROUP BY day
    ORDER BY day
    LIMIT 30
""").toPandas()

print("Dates:", timeseries['day'].tolist())
print("Actual:", timeseries['actual'].tolist())
print("Predicted:", timeseries['predicted'].tolist())
```

**Where to update:** Line ~430 in `regression-model.html`
```javascript
const timeSeriesData = {
  labels: ['2025-01-15', '2025-01-16', ...],  // ← REPLACE
  actual: [45, 48, 52, ...],  // ← REPLACE
  predicted: [44, 47, 50, ...]  // ← REPLACE
};
```

---

## 📱 Dashboard Page (`dashboard.html`)

### Chart 1: Daily KPIs

**What I need:** Daily total usage and average efficiency

**From Notebook:** `06_regression_dashboard_only.ipynb`

**Expected query:**
```python
daily_kpis = spark.sql("""
    SELECT day, total_usage, avg_energy_per_sqm
    FROM workspace.default.dashboard_daily_kpis
    ORDER BY day
""").toPandas()

print("Dates:", daily_kpis['day'].tolist())
print("Total Usage:", daily_kpis['total_usage'].tolist())
print("Avg Efficiency:", daily_kpis['avg_energy_per_sqm'].tolist())
```

**Where to update:** Line ~820 in `dashboard.html`
```javascript
const dailyKPIData = {
  labels: ['2025-01-15', '2025-01-16', ...],  // ← REPLACE
  totalUsage: [125000, 128000, ...],  // ← REPLACE
  avgEfficiency: [1.45, 1.48, ...]  // ← REPLACE
};
```

---

### Chart 2: Error Distribution

**What I need:** Histogram of prediction errors

**Expected query:**
```python
error_dist = spark.sql("""
    SELECT 
        FLOOR(abs_error / 2) * 2 as error_bucket,
        COUNT(*) as count
    FROM workspace.default.daily_efficiency_predictions
    GROUP BY error_bucket
    ORDER BY error_bucket
    LIMIT 10
""").toPandas()

print("Buckets:", error_dist['error_bucket'].tolist())
print("Counts:", error_dist['count'].tolist())
```

**Where to update:** Line ~860 in `dashboard.html`
```javascript
const errorData = {
  labels: ['0-2', '2-4', '4-6', ...],  // ← REPLACE
  values: [150, 220, 180, ...]  // ← REPLACE
};
```

---

## 🏢 Building Names in Tables

Throughout the HTML files, you'll see placeholder building names like:
- "Science Building A"
- "Old Admin Hall"
- "Modern Library"
- etc.

**To replace these:**

1. Get your actual building list:
```python
buildings = spark.sql("""
    SELECT DISTINCT sitename
    FROM workspace.default.silver_energy_joined_2025
    ORDER BY sitename
""").toPandas()

print(buildings['sitename'].tolist())
```

2. Search for "Science Building A" or "Old Admin" in your HTML files
3. Replace with real building names from your list

**Files with building name tables:**
- `efficiency-analysis.html` - Line ~450 (Priority buildings table)
- `regression-model.html` - Line ~480 (Prediction examples)
- `dashboard.html` - Line ~420 (Building summary table)

---

## 🎨 Chart Styling

All charts use a consistent dark theme with these colors:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Cyan | `#00d4ff` | Primary (lines, borders) |
| Green | `#00ff88` | Success, efficiency |
| Orange | `#ff9f1c` | Warning, baseline |
| Red | `#ff4d6d` | Danger, inefficiency |
| Purple | `#9d4edd` | Features, highlights |

You can customize colors in `charts.js` by modifying the `colors` object.

---

## 🚀 Quick Update Template

### For any chart in any HTML file:

1. **Open the HTML file** (e.g., `energy-trends.html`)

2. **Find the `<script>` section** at the bottom (before `</body>`)

3. **Locate the chart data** you want to update:
   ```javascript
   const someChartData = {
     labels: [...],  // ← Replace this array
     values: [...]   // ← Replace this array
   };
   ```

4. **Replace the arrays** with your actual data from Databricks

5. **Save and refresh** your browser to see updated charts

---

## 📋 Data Checklist

Before you send me data, please ensure:

- [ ] Data is in **chronological order** (for time series)
- [ ] **No null values** in critical fields
- [ ] Building names are **consistent** (same spelling throughout)
- [ ] Numbers are **formatted as numbers**, not strings
- [ ] Date format is **YYYY-MM-DD** or **YYYY-MM-DD HH:MM:SS**
- [ ] Arrays have **matching lengths** (labels and values)

---

## 🆘 Need Help?

**Common Issues:**

1. **Chart not appearing?**
   - Open browser console (F12) and check for JavaScript errors
   - Verify Chart.js CDN is loaded
   - Check that canvas element ID matches the chart initialization

2. **Data not formatted correctly?**
   - Ensure arrays use square brackets `[...]`
   - Use commas between values
   - Date strings need quotes: `'2025-01-15'`
   - Numbers don't need quotes: `125000`

3. **Want different colors or styles?**
   - Edit `charts.js` file
   - Modify the `colors` object or chart options

---

## 📤 Send Me Your Data Like This:

**Best Format:**

```
ENERGY TRENDS - Monthly Data:
Months: ['January 2025', 'February 2025', 'March 2025', 'April 2025']
Values: [1250000, 1180000, 1050000, 950000]

EFFICIENCY ANALYSIS - Top 15 Buildings:
Buildings: ['Thompson Library', 'Ohio Union', 'Dreese Labs', ...]
Energy per sqm: [2.8, 2.6, 2.4, 2.3, 2.2, ...]
Campus Baseline: 1.52

REGRESSION MODEL - Performance:
R²: 0.72
RMSE: 8.5
Coefficients:
  - is_priority: 12.5
  - n_readings: 0.05
  - square_meters: -0.0001
  - Intercept: 15.2
```

Just copy outputs from your notebooks and paste them - I'll format them for the HTML!

---

## 🎉 Once Updated

Your frontend will show:
✅ **Real OSU building names** instead of placeholders
✅ **Actual energy consumption data** from your Delta tables
✅ **Beautiful interactive charts** with your real trends
✅ **Accurate model predictions** from your regression analysis

All charts will remain interactive with tooltips, hover effects, and the same professional dark theme!
