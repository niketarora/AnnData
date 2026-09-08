# Machine Learning Service Contracts & Specifications

> **AgriFintech Operating System (KrishiNetra 2.0 Architecture)**  
> **Phase 3 Specification Document**  
> Status: Authoritative Contract (v1.2.0)

---

## 1. Executive Summary

This document defines the formal API contracts, schemas, input/output structures, and error-handling requirements between the **Node.js Express 5 Backend** and external **Machine Learning Services**.

In accordance with Phase 3 non-negotiable safety rules:
1. **Never invent an ML contract without a typed schema**: All inference exchanges conform to the JSON schemas in `ml/contracts/`.
2. **Never fabricate prediction values**: If an ML service fails, the system returns either an approved deterministic fallback or marks the prediction as unavailable.
3. **Never fabricate confidence**: If the model does not produce a calibrated confidence score, the field is `null`, and the UI renders `"Confidence unavailable"`.
4. **All monetary values are calculated server-side** in minor units/standard INR with no autonomous transaction execution.

---

## 2. Model 1: OASSM-10 Price Forecast Transformer

### 2.1 Model Profile
- **Model Identifier**: `OASSM-10-PriceTransformer`
- **Current Version**: `1.2.0`
- **Architecture**: Agri-Commodity Specific Temporal Transformer with seasonality embedding.
- **Contract Schema**:
  - Input: [`ml/contracts/prediction-input.schema.json`](file:///d:/Coding/IIC/ml/contracts/prediction-input.schema.json)
  - Output: [`ml/contracts/prediction-output.schema.json`](file:///d:/Coding/IIC/ml/contracts/prediction-output.schema.json)

### 2.2 Input Schema (`PricePredictionRequest`)
| Field | Type | Required | Units / Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `date` | `string (ISO 8601)` | Yes | UTC timestamp | Forecast origin time |
| `crop` | `string` | Yes | Min 2 chars | Reference commodity (e.g. `Wheat`, `Paddy`, `Mustard`) |
| `variety` | `string` | Yes | Min 2 chars | Variety specification (e.g. `Sharbati`, `Basmati 1121`) |
| `state` | `string` | Yes | String | State (e.g. `Haryana`) |
| `district` | `string` | Yes | String | District (e.g. `Karnal`, `Kurukshetra`) |
| `marketCode` | `string` | Yes | String | Authoritative APMC market code (`MKT-B-TARAORI`) |
| `historicalModalPrice` | `number` | Yes | ₹/Quintal (> 0) | 30-day baseline modal wholesale price |
| `arrivalsQuintals` | `number` | No | Quintals (>= 0) | Daily arrival volume at target yard |
| `temperatureCelsius` | `number` | No | °C | Ambient 24h average temperature |
| `rainfallMm` | `number` | No | mm (>= 0) | Cumulative 72h precipitation anomaly |
| `humidityPercent` | `number` | No | 0 – 100% | Relative humidity |
| `msp` | `number` | No | ₹/Quintal | Statutory Government MSP floor |

### 2.3 Output Schema (`PricePredictionResponse`)
| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `predictedPrice1d` | `number` | No | Modal price estimate for tomorrow (t+1) |
| `predictedPrice3d` | `number` | No | Modal price estimate in 3 days (t+3) |
| `predictedPrice7d` | `number` | No | Modal price estimate in 7 days (t+7) |
| `confidence` | `number` | Yes | Calibrated model confidence score ($0.00 - 1.00$) |
| `predictionInterval`| `object` | No | Lower and upper bound interval |
| `modelVersion` | `string` | No | Exact model registry version string (`1.2.0`) |
| `generatedAt` | `string (ISO 8601)` | No | Timestamp of model inference execution |

---

## 3. Model 2: CatBoost Selling Decision Engine

### 3.1 Model Profile
- **Model Identifier**: `CatBoost-SellingDecisionEngine`
- **Current Version**: `2.1.0`
- **Architecture**: Gradient Boosted Decision Tree Ranker optimizing True Net Realization across regional mandis.
- **Contract Schema**: [`ml/contracts/recommendation.schema.json`](file:///d:/Coding/IIC/ml/contracts/recommendation.schema.json)

### 3.2 Decision Formulation
- **Primary Actions**:
  - `SELL_NOW`: Immediate sale optimal due to high immediate yard liquidity, minimal queue wait, or perishable quality.
  - `PARTIAL_SELL`: Liquidate 40–50% to secure working capital; hold remaining 50–60% to capture forecasted regional price gains.
  - `WAIT`: Hold grain on farm due to severe mandi queue congestion (> 60m delay) or adverse weather transit window.

### 3.3 Explainability Factors
Every generated recommendation includes structured contributing factors:
- `factor`: Factor title (e.g. `Net Realization Spread`, `Mandi Gate Congestion`, `7-Day Price Forecast`)
- `value`: Human-readable impact summary (`+₹1,450 vs regional average`, `25 min turnaround`)
- `weight`: Algorithmic influence weight ($0.00 - 1.00$)
- `impact`: Semantic direction (`positive`, `negative`, `neutral`)
- `direction`: Internal feature tag (`higher_net_payout`, `rapid_throughput`, `queue_bottleneck`)

---

## 4. Model 3: Computer Vision Quality Assessment

### 4.1 Model Profile
- **Model Identifier**: `Vision-GrainQualityClassifier`
- **Current Version**: `1.0.4`
- **Architecture**: Fine-tuned Vision Transformer / EfficientNet on Indian APMC grain sample imagery.
- **Contract Schema**: [`ml/contracts/quality-assessment.schema.json`](file:///d:/Coding/IIC/ml/contracts/quality-assessment.schema.json)

### 4.2 Output Fields
- `qualityScore`: Overall composite quality rating ($0 - 100$)
- `predictedGrade`: `Grade A` | `Grade B` | `Grade C` | `Rejection`
- `confidence`: Confidence score ($0.00 - 1.00$)
- `moisturePercent`: Estimated moisture content percentage
- `damagePercent`: Estimated damaged / weeviled grain percentage
- `foreignMatterPercent`: Estimated chaff, stone, and dirt percentage
