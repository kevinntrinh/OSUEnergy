# Databricks notebook source
path = "/Volumes/workspace/default/osu-energy-analysis/DATA I-O 2026 Advanced Datasets/advanced_core/advanced_core/meter-readings-jan-2025.csv"

df = (spark.read
      .option("header", True)
      .option("inferSchema", True)
      .csv(path))

display(df)

# COMMAND ----------

base = "/Volumes/workspace/default/osu-energy-analysis/DATA I-O 2026 Advanced Datasets/advanced_core/advanced_core"
meter_path = f"{base}/meter-readings-*-2025.csv"

meter_raw = (spark.read
    .option("header", True)
    .option("inferSchema", True)
    .csv(meter_path)
)

display(meter_raw.limit(5))
print(meter_raw.count())
meter_raw.printSchema()


# COMMAND ----------

from pyspark.sql import functions as F

meter_silver = (meter_raw
    .withColumn("ts", F.to_timestamp("readingtime"))  # Spark usually parses this ISO Z format fine
    .withColumn("date", F.to_date("ts"))
    .withColumn("hour", F.date_trunc("hour", F.col("ts")))
    .withColumn("readingvalue", F.col("readingvalue").cast("double"))
    .withColumn("siteid", F.col("siteid").cast("string"))
    .withColumn("meterid", F.col("meterid").cast("string"))
)

meter_silver.write.mode("overwrite").format("delta").saveAsTable("workspace.default.silver_meter_2025")


# COMMAND ----------

# MAGIC %sql
# MAGIC SELECT utility, COUNT(*) rows
# MAGIC FROM workspace.default.silver_meter_2025
# MAGIC GROUP BY utility
# MAGIC ORDER BY rows DESC;
# MAGIC

# COMMAND ----------

meta_path = f"{base}/building_metadata.csv"

bmeta = (spark.read
    .option("header", True)
    .option("inferSchema", True)
    .csv(meta_path)
)

display(bmeta.limit(5))
bmeta.printSchema()

bmeta.write.mode("overwrite").format("delta").saveAsTable("workspace.default.dim_buildings")


# COMMAND ----------

meter = spark.table("workspace.default.silver_meter_2025")
build = spark.table("workspace.default.dim_buildings")

fact = (meter
    .join(build, meter.siteid == build.buildingnumber, how="left")
)

fact.write.mode("overwrite").format("delta").saveAsTable("workspace.default.fact_energy_2025")

# COMMAND ----------

query = """
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN buildingname IS NULL THEN 1 ELSE 0 END) AS unmatched_rows,
  SUM(CASE WHEN buildingname IS NOT NULL THEN 1 ELSE 0 END) AS matched_rows,
  ROUND(100.0 * SUM(CASE WHEN buildingname IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) AS match_pct
FROM workspace.default.fact_energy_2025
"""

display(spark.sql(query))

# COMMAND ----------

weather_path = f"{base}/weather_data_hourly_2025.csv"

weather = (spark.read
    .option("header", True)
    .option("inferSchema", True)
    .csv(weather_path)
)

display(weather.limit(5))
weather.printSchema()

weather_silver = (weather
    .withColumn("ts_weather", F.to_timestamp(F.col(weather.columns[0])))  # adjust once we see the real column name
    .withColumn("hour", F.date_trunc("hour", F.col("ts_weather")))
)

weather_silver.write.mode("overwrite").format("delta").saveAsTable("workspace.default.dim_weather_hourly_2025")


# COMMAND ----------

fact = spark.table("workspace.default.fact_energy_2025")
w = spark.table("workspace.default.dim_weather_hourly_2025")

fact_w = fact.join(w, on="hour", how="left")
fact_w.write.mode("overwrite").format("delta").saveAsTable("workspace.default.fact_energy_weather_2025")


# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TABLE workspace.default.gold_building_monthly AS
# MAGIC SELECT
# MAGIC   siteid,
# MAGIC   sitename,
# MAGIC   utility,
# MAGIC   year,
# MAGIC   month,
# MAGIC   SUM(readingvalue) AS usage_total,
# MAGIC   AVG(readingvalue) AS usage_avg,
# MAGIC   MAX(readingvalue) AS usage_peak
# MAGIC FROM workspace.default.silver_meter_2025
# MAGIC GROUP BY 1,2,3,4,5;
# MAGIC

# COMMAND ----------

# MAGIC %sql
# MAGIC CREATE OR REPLACE TABLE workspace.default.gold_afterhours AS
# MAGIC WITH base AS (
# MAGIC   SELECT
# MAGIC     siteid,
# MAGIC     sitename,
# MAGIC     utility,
# MAGIC     year,
# MAGIC     month,
# MAGIC     hour(ts) AS hr,
# MAGIC     readingvalue
# MAGIC   FROM workspace.default.silver_meter_2025
# MAGIC )
# MAGIC SELECT
# MAGIC   siteid, sitename, utility, year, month,
# MAGIC   try_divide(
# MAGIC     SUM(CASE WHEN hr < 8 OR hr >= 18 THEN readingvalue ELSE 0 END),
# MAGIC     SUM(readingvalue)
# MAGIC   ) AS afterhours_share
# MAGIC FROM base
# MAGIC GROUP BY 1,2,3,4,5;

# COMMAND ----------

bmeta.columns
