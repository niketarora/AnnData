# Machine Learning Integration Layer (Future Phase)
AgriFintech Operating System — KrishiNetra 2.0 Architecture

This directory defines the contracts, schemas, and future integration points for machine learning services.

## Architecture

```
Node.js Express Backend
         │
         ▼
FastAPI ML Integration Layer
         │
  ┌──────┼──────────────┐
  ▼      ▼              ▼
OASSM-10 CatBoost    Vision Quality
Price    Selling     Assessment
Forecast Recommendation (CNN/ViT)
```

## Model Specifications

### 1. Price Prediction Service
- **Model Architecture**: OASSM-10 Transformer (Agri-Commodity Specific Temporal Transformer)
- **Features**:
  - `date`: Forecast origin timestamp
  - `crop`, `variety`: Commodity specification
  - `state`, `district`, `market`: Geospatial resolution
  - `historical_prices`: 30-day lookback window (min, max, modal)
  - `arrivals_quintals`: Market arrival volume
  - `weather_features`: Temperature, precipitation, humidity (Open-Meteo)
  - `msp`: Government Minimum Support Price floor
- **Outputs**:
  - `predicted_price_1d`, `predicted_price_3d`, `predicted_price_7d`
  - `confidence_score` (0.00 – 1.00)
  - `prediction_interval` (lower_bound, upper_bound)
  - `model_version`

### 2. Selling Recommendation Engine
- **Model Architecture**: CatBoost Gradient Boosting Classifier & Ranker
- **Features**:
  - Distance (km) & Freight rate (₹/km)
  - Real-time Mandi queue congestion & wait time
  - Price premium over local benchmark
  - Buyer reliability & payment history
  - Crop perishability & quality tier
- **Outputs**:
  - Action: `SELL_NOW` | `WAIT` | `PARTIAL_SELL`
  - Score (0.00 – 1.00)
  - Realization gain estimate (₹)

### 3. Visual Crop Quality Assessment
- **Model Architecture**: Vision Transformer / EfficientNet fine-tuned on Indian agricultural mandi datasets
- **Features**: Multi-angle smartphone photographs (overview, close-up, hand-held sample)
- **Outputs**:
  - `preliminary_grade`: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejection'
  - `quality_score`: (0 – 100)
  - `estimated_moisture`: (%)
  - `defects_percentage`: (%)
  - `foreign_matter_percentage`: (%)
  - `confidence`: (0.00 – 1.00)
