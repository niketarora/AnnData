/**
 * Prediction API Controller
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 28: Prediction API Endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { predictionService } from '../services/intelligence/prediction.service.js';
import { predictionsRepository } from '../repositories/intelligenceRepositories.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export class PredictionsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body;
      if (!body.crop || !body.variety || !body.historicalModalPrice) {
        throw new ValidationError('crop, variety, and historicalModalPrice are required');
      }

      const prediction = await predictionService.predictPrice({
        crop: body.crop,
        variety: body.variety,
        state: body.state || 'Haryana',
        district: body.district || 'Karnal',
        marketCode: body.marketCode || 'MKT-B-TARAORI',
        historicalModalPrice: Number(body.historicalModalPrice),
        arrivalsQuintals: body.arrivalsQuintals,
        temperatureCelsius: body.temperatureCelsius,
        rainfallMm: body.rainfallMm,
        humidityPercent: body.humidityPercent,
        msp: body.msp,
        forceRefresh: body.forceRefresh,
      });

      res.status(201).json({
        success: true,
        data: {
          prediction: prediction.value_json,
          confidence: prediction.confidence,
          modelVersion: prediction.model_version,
          generatedAt: prediction.generated_at,
          expiresAt: prediction.expires_at,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const prediction = await predictionsRepository.findById(id);
      if (!prediction) {
        throw new NotFoundError(`Prediction not found with id: ${id}`);
      }

      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (err) {
      next(err);
    }
  }

  async getByEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const prediction = await predictionsRepository.findByEntity(entityType, entityId);
      if (!prediction) {
        throw new NotFoundError(`No active prediction found for ${entityType}:${entityId}`);
      }

      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const predictionsController = new PredictionsController();
