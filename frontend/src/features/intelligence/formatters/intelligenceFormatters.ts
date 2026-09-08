/**
 * Intelligence Formatters & Helpers
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 21, 22, 34: UI Display Formatters
 */

import {
  DataFreshnessStatus,
  IntelligenceAction,
} from '../types/intelligence.types';

export class IntelligenceFormatters {
  /**
   * Formats relative observation time for freshness indicators
   */
  public static formatRelativeTime(timestampIso?: string): string {
    if (!timestampIso) return 'Time unavailable';
    const time = new Date(timestampIso).getTime();
    if (isNaN(time) || time === 0) return 'Time unavailable';

    const diffMs = Date.now() - time;
    const diffMins = Math.floor(diffMs / (60 * 1000));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    return `Updated ${Math.floor(diffHours / 24)}d ago`;
  }

  /**
   * Formats confidence percentage with strict fallback (Section 22: Never fabricate confidence)
   */
  public static formatConfidence(confidence: number | null | undefined): string {
    if (confidence === null || confidence === undefined || isNaN(confidence)) {
      return 'Confidence unavailable';
    }
    const percent = Math.round(confidence * 100);
    return `${percent}% Algorithmic Confidence`;
  }

  /**
   * Translates internal action to user-facing action title
   */
  public static formatActionTitle(action?: IntelligenceAction): string {
    switch (action) {
      case 'SELL_NOW':
        return 'Sell Immediately';
      case 'PARTIAL_SELL':
        return 'Partial Sell & Hold';
      case 'WAIT':
        return 'Hold & Wait';
      default:
        return 'Analysis Pending';
    }
  }

  /**
   * Returns human-readable label for freshness status
   */
  public static formatFreshnessLabel(status: DataFreshnessStatus, observedAtIso?: string): string {
    switch (status) {
      case 'LIVE':
        return 'LIVE MANDI FEED';
      case 'RECENT':
        return 'RECENT';
      case 'STALE':
        return `STALE • ${this.formatRelativeTime(observedAtIso)}`;
      case 'UNAVAILABLE':
      default:
        return 'DATA UNAVAILABLE';
    }
  }
}
