import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('11. Machine Learning Schema Contract Verification', () => {
  const contractsDir = path.resolve(process.cwd(), '../ml/contracts');

  it('loads and verifies prediction-input.schema.json', () => {
    const filePath = path.join(contractsDir, 'prediction-input.schema.json');
    assert.ok(fs.existsSync(filePath), 'prediction-input.schema.json must exist');

    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(schema.title, 'PricePredictionInput');
    assert.ok(schema.required.includes('crop'));
    assert.ok(schema.required.includes('historicalModalPrice'));
    assert.ok(schema.properties.historicalModalPrice.minimum === 0);
  });

  it('loads and verifies prediction-output.schema.json', () => {
    const filePath = path.join(contractsDir, 'prediction-output.schema.json');
    assert.ok(fs.existsSync(filePath), 'prediction-output.schema.json must exist');

    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(schema.title, 'PricePredictionOutput');
    assert.ok(schema.required.includes('predictedPrice1d'));
    assert.ok(schema.required.includes('predictedPrice3d'));
    assert.ok(schema.required.includes('predictedPrice7d'));
    assert.ok(schema.required.includes('confidence'));
    assert.ok(schema.required.includes('modelVersion'));
  });

  it('loads and verifies recommendation.schema.json', () => {
    const filePath = path.join(contractsDir, 'recommendation.schema.json');
    assert.ok(fs.existsSync(filePath), 'recommendation.schema.json must exist');

    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(schema.title, 'SellingRecommendation');
    assert.ok(schema.required.includes('primaryAction'));
    assert.ok(schema.required.includes('factors'));
    assert.ok(schema.required.includes('rankedMarkets'));
    assert.ok(schema.properties.primaryAction.enum.includes('SELL_NOW'));
    assert.ok(schema.properties.primaryAction.enum.includes('PARTIAL_SELL'));
    assert.ok(schema.properties.primaryAction.enum.includes('WAIT'));
  });

  it('loads and verifies quality-assessment.schema.json', () => {
    const filePath = path.join(contractsDir, 'quality-assessment.schema.json');
    assert.ok(fs.existsSync(filePath), 'quality-assessment.schema.json must exist');

    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(schema.title, 'QualityAssessment');
    assert.ok(schema.required.includes('qualityScore'));
    assert.ok(schema.required.includes('predictedGrade'));
    assert.ok(schema.properties.predictedGrade.enum.includes('Grade A'));
  });
});
