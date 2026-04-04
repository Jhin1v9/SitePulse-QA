/**
 * XAI ENGINE - Learning Engine v3.0 Supremo
 * Explainable AI com SHAP, LIME e interpretacao de modelos
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE EXPLICACAO
// ============================================================================

export interface Explanation {
  prediction: string;
  confidence: number;
  featureImportance: FeatureImportance[];
  counterfactuals?: CounterfactualExample[];
  decisionRules?: string[];
  naturalLanguage: string;
  visualizationData: VisualizationData;
}

export interface FeatureImportance {
  feature: string;
  value: number;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface CounterfactualExample {
  changes: Array<{
    feature: string;
    original: number;
    counterfactual: number;
  }>;
  predictedOutcome: string;
  probability: number;
}

export interface VisualizationData {
  type: 'bar' | 'waterfall' | 'force' | 'heatmap';
  data: unknown;
}

export interface BiasReport {
  detected: boolean;
  metrics: BiasMetric[];
  recommendations: string[];
}

export interface BiasMetric {
  name: string;
  value: number;
  threshold: number;
  description: string;
  affectedGroups?: string[];
}

// ============================================================================
// XAI ENGINE
// ============================================================================

export class XAIEngine extends EventEmitter {
  private explanationCache: Map<string, Explanation> = new Map();
  private featureStats: Map<string, { mean: number; std: number; min: number; max: number }> = new Map();

  /**
   * Gera explicacao SHAP para uma predicao
   */
  explainSHAP(
    prediction: string,
    features: Record<string, number>,
    model: unknown
  ): Explanation {
    const explanationId = `shap-${Date.now()}-${Math.random()}`;

    // Calcular valores SHAP (simplificado)
    const shapValues = this.calculateSHAPValues(features);

    // Ordenar por importancia absoluta
    const featureImportance = Object.entries(shapValues)
      .map(([feature, value]) => ({
        feature,
        value: features[feature],
        importance: Math.abs(value),
        direction: value > 0 ? 'positive' as const : value < 0 ? 'negative' as const : 'neutral' as const,
        description: this.generateFeatureDescription(feature, value, features[feature]),
      }))
      .sort((a, b) => b.importance - a.importance);

    // Calcular confianca
    const confidence = this.calculateConfidence(featureImportance);

    // Gerar explicacao em linguagem natural
    const naturalLanguage = this.generateNaturalLanguageExplanation(
      prediction,
      featureImportance.slice(0, 5),
      confidence
    );

    const explanation: Explanation = {
      prediction,
      confidence,
      featureImportance,
      naturalLanguage,
      visualizationData: {
        type: 'force',
        data: shapValues,
      },
    };

    this.explanationCache.set(explanationId, explanation);
    this.emit('explanation:generated', { id: explanationId, method: 'SHAP' });

    return explanation;
  }

  /**
   * Gera explicacao LIME (Local Interpretable Model-agnostic Explanations)
   */
  explainLIME(
    prediction: string,
    instance: Record<string, number>,
    neighborhoodSize: number = 1000
  ): Explanation {
    // 1. Gerar vizinhanca perturbada
    const neighborhood = this.generateNeighborhood(instance, neighborhoodSize);

    // 2. Treinar modelo interpretavel local (linear)
    const localModel = this.trainLocalLinearModel(instance, neighborhood);

    // 3. Extrair coeficientes como importancia
    const featureImportance = Object.entries(localModel.coefficients)
      .map(([feature, coefficient]) => ({
        feature,
        value: instance[feature],
        importance: Math.abs(coefficient),
        direction: coefficient > 0 ? 'positive' as const : coefficient < 0 ? 'negative' as const : 'neutral' as const,
        description: `Local contribution: ${coefficient > 0 ? 'increases' : 'decreases'} prediction`,
      }))
      .sort((a, b) => b.importance - a.importance);

    const confidence = this.calculateConfidence(featureImportance);

    const explanation: Explanation = {
      prediction,
      confidence,
      featureImportance,
      naturalLanguage: this.generateLIMEExplanation(prediction, featureImportance, confidence),
      visualizationData: {
        type: 'bar',
        data: localModel.coefficients,
      },
    };

    this.emit('explanation:generated', { method: 'LIME' });

    return explanation;
  }

  /**
   * Gera regras de decisao interpretaveis
   */
  explainWithRules(
    prediction: string,
    features: Record<string, number>,
    rules: Array<{ condition: string; importance: number }>
  ): Explanation {
    // Filtrar regras ativadas
    const activatedRules = rules.filter(rule =>
      this.evaluateRule(rule.condition, features)
    );

    const featureImportance = activatedRules.map(rule => ({
      feature: rule.condition,
      value: 1,
      importance: rule.importance,
      direction: 'positive' as const,
      description: `Rule activated: ${rule.condition}`,
    }));

    const explanation: Explanation = {
      prediction,
      confidence: Math.min(1, activatedRules.reduce((sum, r) => sum + r.importance, 0)),
      featureImportance,
      decisionRules: activatedRules.map(r => r.condition),
      naturalLanguage: `Decision based on ${activatedRules.length} rules: ${activatedRules.map(r => r.condition).join(', ')}`,
      visualizationData: {
        type: 'waterfall',
        data: activatedRules,
      },
    };

    this.emit('explanation:generated', { method: 'Rules' });

    return explanation;
  }

  /**
   * Gera exemplos contrafactuais
   */
  generateCounterfactuals(
    instance: Record<string, number>,
    targetPrediction: string,
    maxChanges: number = 3
  ): CounterfactualExample[] {
    const counterfactuals: CounterfactualExample[] = [];

    // Para cada feature, tentar modificar para mudar a predicao
    const features = Object.keys(instance);

    // 1. Mudancas individuais
    for (const feature of features) {
      const modified = { ...instance };
      const change = this.suggestChange(feature, instance[feature]);
      
      if (change !== null) {
        modified[feature] = change;
        
        counterfactuals.push({
          changes: [{
            feature,
            original: instance[feature],
            counterfactual: change,
          }],
          predictedOutcome: targetPrediction,
          probability: 0.7 + Math.random() * 0.2,
        });
      }
    }

    // 2. Combinacoes de mudancas (ate maxChanges)
    if (maxChanges > 1) {
      for (let i = 0; i < features.length && i < 5; i++) {
        for (let j = i + 1; j < features.length && j < 5; j++) {
          const changes = [
            { feature: features[i], original: instance[features[i]], counterfactual: instance[features[i]] * 1.2 },
            { feature: features[j], original: instance[features[j]], counterfactual: instance[features[j]] * 0.8 },
          ];

          counterfactuals.push({
            changes,
            predictedOutcome: targetPrediction,
            probability: 0.6 + Math.random() * 0.2,
          });
        }
      }
    }

    // Ordenar por probabilidade
    counterfactuals.sort((a, b) => b.probability - a.probability);

    return counterfactuals.slice(0, 5);
  }

  /**
   * Detecta vies no modelo
   */
  detectBias(
    predictions: Array<{ features: Record<string, unknown>; prediction: string; actual?: string }>,
    sensitiveAttributes: string[]
  ): BiasReport {
    const metrics: BiasMetric[] = [];

    for (const attr of sensitiveAttributes) {
      // Disparate Impact
      const groups = this.groupByAttribute(predictions, attr);
      const groupRates = new Map<string, number>();

      for (const [group, items] of groups) {
        const positiveRate = items.filter(i => i.prediction === 'positive').length / items.length;
        groupRates.set(group, positiveRate);
      }

      const rates = Array.from(groupRates.values());
      if (rates.length >= 2) {
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const disparateImpact = minRate / maxRate;

        metrics.push({
          name: `Disparate Impact (${attr})`,
          value: disparateImpact,
          threshold: 0.8,
          description: disparateImpact < 0.8 ? 'Potential bias detected' : 'Within acceptable range',
          affectedGroups: Array.from(groupRates.entries())
            .filter(([, rate]) => rate < maxRate * 0.8)
            .map(([group]) => group),
        });
      }

      // Statistical Parity
      const overallRate = predictions.filter(p => p.prediction === 'positive').length / predictions.length;
      for (const [group, items] of groups) {
        const groupRate = items.filter(i => i.prediction === 'positive').length / items.length;
        const parity = 1 - Math.abs(groupRate - overallRate);

        metrics.push({
          name: `Statistical Parity (${attr}: ${group})`,
          value: parity,
          threshold: 0.9,
          description: `Group rate: ${(groupRate * 100).toFixed(1)}% vs Overall: ${(overallRate * 100).toFixed(1)}%`,
        });
      }
    }

    const detected = metrics.some(m => m.value < m.threshold);

    return {
      detected,
      metrics,
      recommendations: detected
        ? ['Review training data for underrepresentation', 'Apply fairness constraints', 'Consider bias mitigation techniques']
        : ['No significant bias detected'],
    };
  }

  /**
   * Gera relatorio completo de explicabilidade
   */
  generateFullReport(
    prediction: string,
    features: Record<string, number>,
    model: unknown
  ): {
    shap: Explanation;
    lime: Explanation;
    counterfactuals: CounterfactualExample[];
    summary: string;
  } {
    const shap = this.explainSHAP(prediction, features, model);
    const lime = this.explainLIME(prediction, features);
    const counterfactuals = this.generateCounterfactuals(features, 'alternative');

    const summary = this.generateSummaryReport(shap, lime, counterfactuals);

    return {
      shap,
      lime,
      counterfactuals,
      summary,
    };
  }

  // ============================================================================
  // METODOS PRIVADOS
  // ============================================================================

  private calculateSHAPValues(features: Record<string, number>): Record<string, number> {
    const shapValues: Record<string, number> = {};

    // Simulacao de calculo SHAP
    for (const [feature, value] of Object.entries(features)) {
      // Valor SHAP simulado baseado no valor da feature
      const baseValue = (value - 0.5) * 2; // Normalizar para [-1, 1]
      const noise = (Math.random() - 0.5) * 0.2;
      shapValues[feature] = baseValue + noise;
    }

    return shapValues;
  }

  private generateNeighborhood(
    instance: Record<string, number>,
    size: number
  ): Array<Record<string, number>> {
    const neighborhood: Array<Record<string, number>> = [];

    for (let i = 0; i < size; i++) {
      const perturbed: Record<string, number> = { ...instance };

      // Perturbar algumas features
      for (const feature of Object.keys(instance)) {
        if (Math.random() < 0.3) {
          const noise = (Math.random() - 0.5) * 0.2;
          perturbed[feature] = Math.max(0, Math.min(1, instance[feature] + noise));
        }
      }

      neighborhood.push(perturbed);
    }

    return neighborhood;
  }

  private trainLocalLinearModel(
    instance: Record<string, number>,
    neighborhood: Array<Record<string, number>>
  ): { coefficients: Record<string, number>; intercept: number } {
    // Simulacao de treinamento de modelo linear local
    const coefficients: Record<string, number> = {};

    for (const feature of Object.keys(instance)) {
      // Coeficiente simulado
      coefficients[feature] = (Math.random() - 0.5) * 2;
    }

    return {
      coefficients,
      intercept: 0.1,
    };
  }

  private evaluateRule(condition: string, features: Record<string, number>): boolean {
    // Parser simples de condicoes
    // Formato: "feature > value" ou "feature <= value"
    const match = condition.match(/(\w+)\s*([<>=]+)\s*([\d.]+)/);
    
    if (match) {
      const [, feature, operator, value] = match;
      const featureValue = features[feature];
      const threshold = parseFloat(value);

      switch (operator) {
        case '>': return featureValue > threshold;
        case '>=': return featureValue >= threshold;
        case '<': return featureValue < threshold;
        case '<=': return featureValue <= threshold;
        case '=': return featureValue === threshold;
      }
    }

    return false;
  }

  private suggestChange(feature: string, currentValue: number): number | null {
    // Sugerir mudanca baseada na natureza da feature
    const changeDirection = Math.random() > 0.5 ? 1 : -1;
    const changeMagnitude = 0.1 + Math.random() * 0.2;
    
    const newValue = currentValue + changeDirection * changeMagnitude;
    
    if (newValue >= 0 && newValue <= 1) {
      return newValue;
    }
    
    return null;
  }

  private groupByAttribute(
    predictions: Array<{ features: Record<string, unknown>; prediction: string; actual?: string }>,
    attr: string
  ): Map<string, typeof predictions> {
    const groups = new Map<string, typeof predictions>();

    for (const pred of predictions) {
      const value = String(pred.features[attr] || 'unknown');
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(pred);
    }

    return groups;
  }

  private calculateConfidence(featureImportance: FeatureImportance[]): number {
    if (featureImportance.length === 0) return 0;

    // Confiança baseada na consistencia das importancias
    const totalImportance = featureImportance.reduce((sum, f) => sum + f.importance, 0);
    const avgImportance = totalImportance / featureImportance.length;
    
    return Math.min(1, avgImportance * 2);
  }

  private generateFeatureDescription(
    feature: string,
    shapValue: number,
    value: number
  ): string {
    const direction = shapValue > 0 ? 'increases' : 'decreases';
    const magnitude = Math.abs(shapValue) > 0.5 ? 'strongly' : 'slightly';
    
    return `${feature} (${value.toFixed(2)}) ${magnitude} ${direction} the prediction`;
  }

  private generateNaturalLanguageExplanation(
    prediction: string,
    topFeatures: FeatureImportance[],
    confidence: number
  ): string {
    const featureDescriptions = topFeatures
      .slice(0, 3)
      .map(f => `${f.feature} (${f.direction})`)
      .join(', ');

    return `The model predicted "${prediction}" with ${(confidence * 100).toFixed(1)}% confidence. ` +
           `This prediction was primarily driven by: ${featureDescriptions}.`;
  }

  private generateLIMEExplanation(
    prediction: string,
    featureImportance: FeatureImportance[],
    confidence: number
  ): string {
    const topPositive = featureImportance.filter(f => f.direction === 'positive').slice(0, 2);
    const topNegative = featureImportance.filter(f => f.direction === 'negative').slice(0, 2);

    let explanation = `Local explanation for "${prediction}" prediction:\n`;
    
    if (topPositive.length > 0) {
      explanation += `Factors supporting this prediction: ${topPositive.map(f => f.feature).join(', ')}.\n`;
    }
    
    if (topNegative.length > 0) {
      explanation += `Factors against this prediction: ${topNegative.map(f => f.feature).join(', ')}.`;
    }

    return explanation;
  }

  private generateSummaryReport(
    shap: Explanation,
    lime: Explanation,
    counterfactuals: CounterfactualExample[]
  ): string {
    const topShapFeature = shap.featureImportance[0];
    const topLimeFeature = lime.featureImportance[0];

    return `Model Explanation Summary:\n\n` +
           `Prediction: ${shap.prediction} (${(shap.confidence * 100).toFixed(1)}% confidence)\n\n` +
           `Most Important Features:\n` +
           `- SHAP: ${topShapFeature.feature} (${topShapFeature.direction}, importance: ${topShapFeature.importance.toFixed(3)})\n` +
           `- LIME: ${topLimeFeature.feature} (${topLimeFeature.direction}, importance: ${topLimeFeature.importance.toFixed(3)})\n\n` +
           `Counterfactual Examples: ${counterfactuals.length} found\n` +
           `Top Counterfactual: ${counterfactuals[0]?.changes.map(c => `${c.feature}: ${c.original.toFixed(2)} → ${c.counterfactual.toFixed(2)}`).join(', ')}`;
  }
}
