/**
 * Costing Engine
 * Estimates material, labor, and total production costs
 */

const { calculateMaterialQuantity, MATERIALS } = require('./garmentSchema');

/**
 * Estimates production costs based on schema
 */
function estimateCost(schema) {
  const materialCost = calculateMaterialCost(schema);
  const laborCost = calculateLaborCost(schema);
  const overheadCost = calculateOverheadCost(schema, materialCost, laborCost);

  const totalCost = materialCost + laborCost + overheadCost;

  // Update schema with calculated costs
  schema.costing.material_cost = parseFloat(materialCost.toFixed(2));
  schema.costing.labor_cost = parseFloat(laborCost.toFixed(2));
  schema.costing.overhead_cost = parseFloat(overheadCost.toFixed(2));
  schema.costing.total_cost = parseFloat(totalCost.toFixed(2));

  return {
    material_cost: schema.costing.material_cost,
    labor_cost: schema.costing.labor_cost,
    overhead_cost: schema.costing.overhead_cost,
    total_cost: schema.costing.total_cost,
    currency: 'USD',
    breakdown: {
      material_percentage: ((schema.costing.material_cost / totalCost) * 100).toFixed(1),
      labor_percentage: ((schema.costing.labor_cost / totalCost) * 100).toFixed(1),
      overhead_percentage: ((schema.costing.overhead_cost / totalCost) * 100).toFixed(1),
    },
    per_unit_components: {
      fabric_and_trims: schema.costing.material_cost,
      labor_assembly: schema.costing.labor_cost,
      packaging_overhead: schema.costing.overhead_cost,
    },
  };
}

/**
 * Calculates material cost
 */
function calculateMaterialCost(schema) {
  const quantity = calculateMaterialQuantity(schema);
  const materialSpec = MATERIALS[schema.materials.primary];
  const costPerMeter = materialSpec.cost_per_meter;

  // Add 5% waste and quality allowance
  const totalCost = quantity * costPerMeter * 1.05;

  return totalCost;
}

/**
 * Calculates labor cost
 */
function calculateLaborCost(schema) {
  // Base hourly rate for garment production
  const LABOR_RATE_PER_HOUR = 8.5; // USD

  // Production time in hours
  const timeInHours = schema.manufacturing.estimated_production_time_minutes / 60;

  // Complexity multiplier
  let complexityMultiplier = 1.0;
  if (schema.manufacturing.complexity_level === 'low') {
    complexityMultiplier = 1.0;
  } else if (schema.manufacturing.complexity_level === 'medium') {
    complexityMultiplier = 1.2;
  } else {
    complexityMultiplier = 1.5;
  }

  // Material difficulty adjustment
  let materialMultiplier = 1.0;
  if (schema.materials.primary === 'denim') {
    materialMultiplier = 1.3; // Denim requires more skill
  } else if (schema.materials.primary === 'linen') {
    materialMultiplier = 1.2; // Linen is slippery
  } else if (schema.materials.primary === 'wool') {
    materialMultiplier = 1.15;
  }

  const laborCost = timeInHours * LABOR_RATE_PER_HOUR * complexityMultiplier * materialMultiplier;

  return laborCost;
}

/**
 * Calculates overhead cost
 */
function calculateOverheadCost(schema, materialCost, laborCost) {
  // Overhead includes facility, equipment, QC, packaging
  // Typically 15-25% of direct costs

  const directCosts = materialCost + laborCost;
  const overheadRate = 0.2; // 20% overhead

  // Additional quality control cost for complex items
  let qualityAdder = 0;
  if (schema.manufacturing.complexity_level === 'high') {
    qualityAdder = 0.5; // Add $0.50 for complex items
  }

  // Packaging
  const packagingCost = 0.3; // Basic packaging

  const overheadCost = directCosts * overheadRate + qualityAdder + packagingCost;

  return overheadCost;
}

/**
 * Generates cost variance analysis
 */
function analyzeCostVariance(schema, targetPrice) {
  const currentCost = schema.costing.total_cost;
  const variance = targetPrice - currentCost;
  const variancePercent = (variance / targetPrice) * 100;

  return {
    target_price: targetPrice,
    current_cost: currentCost,
    variance: variance,
    variance_percentage: parseFloat(variancePercent.toFixed(1)),
    status: variance >= 0 ? 'within_target' : 'exceeds_target',
    recommendations: generateCostOptimizations(schema, variance),
  };
}

/**
 * Generates cost optimization recommendations
 */
function generateCostOptimizations(schema, variance) {
  const recommendations = [];

  if (variance < 0) {
    // Over budget
    if (schema.manufacturing.complexity_level === 'high') {
      recommendations.push('Simplify design to reduce labor time');
    }

    if (schema.materials.primary === 'denim' || schema.materials.primary === 'wool') {
      recommendations.push(`Consider substituting material with lower-cost alternative`);
    }

    if (schema.construction.panel_count > 6) {
      recommendations.push('Reduce panel count to decrease assembly time');
    }

    recommendations.push('Optimize seam specifications to reduce thread usage');
  }

  return recommendations;
}

module.exports = {
  estimateCost,
  calculateMaterialCost,
  calculateLaborCost,
  calculateOverheadCost,
  analyzeCostVariance,
};
