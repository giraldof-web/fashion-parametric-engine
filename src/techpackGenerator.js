/**
 * Technical Pack Generator
 * Creates comprehensive manufacturing specification sheets from schema
 */

const { calculateMaterialQuantity, MATERIALS } = require('./garmentSchema');

/**
 * Generates a complete technical specification package
 */
function techpackGenerator(schema) {
  const techpack = {
    metadata: {
      version: '1.0',
      generated_at: new Date().toISOString(),
      garment_type: schema.garment.type,
      description: schema.garment.description,
    },

    measurements: generateMeasurements(schema),
    materials: generateMaterials(schema),
    construction: generateConstruction(schema),
    quality_specifications: generateQualitySpecs(schema),
    production_guide: generateProductionGuide(schema),
    cost_estimate: generateCostEstimate(schema),
  };

  return techpack;
}

/**
 * Generates measurement specification table
 */
function generateMeasurements(schema) {
  const measurements = [];

  const dimensionMap = {
    chest_width: 'Chest Width',
    length: 'Total Length',
    sleeve_length: 'Sleeve Length',
    shoulder_width: 'Shoulder Width',
    waist_width: 'Waist Width',
    hip_width: 'Hip Width',
    neck_opening: 'Neck Opening',
    arm_hole_depth: 'Armhole Depth',
    sleeve_width_cuff: 'Sleeve Width (Cuff)',
  };

  Object.entries(schema.dimensions).forEach(([key, value]) => {
    if (dimensionMap[key]) {
      measurements.push({
        name: dimensionMap[key],
        value: value,
        unit: 'cm',
        tolerance: '±1.0cm',
      });
    }
  });

  return measurements;
}

/**
 * Generates material specification
 */
function generateMaterials(schema) {
  const materialQuantity = calculateMaterialQuantity(schema);
  const materialSpec = MATERIALS[schema.materials.primary];

  return {
    primary_fabric: {
      fiber_content: schema.materials.primary,
      weight_gsm: schema.materials.weight_gsm,
      quantity_meters: materialQuantity,
      color: schema.materials.color,
      finish: schema.materials.finish,
      supplier_specs: {
        shrinkage_max_percent: 3.0,
        tensile_strength_min: 40, // kg
        tear_strength_min: 2.5, // kg
      },
    },
    trims_notions: [
      {
        item: 'Thread',
        type: 'Polyester',
        quantity: Math.ceil(materialQuantity * 50), // meters
        notes: 'Color matched to fabric',
      },
      {
        item: 'Buttons (if applicable)',
        type: 'Plastic',
        quantity: 4,
        notes: 'Optional',
      },
    ],
    care_instructions: generateCareInstructions(schema.materials.primary),
  };
}

/**
 * Generates construction specifications
 */
function generateConstruction(schema) {
  return {
    seam_specifications: schema.construction.seams.map((seam) => ({
      location: seam.position,
      type: seam.type,
      stitch_density: seam.type === 'flat_felled' ? 10 : 8, // stitches per cm
      thread_tension: 'medium',
      notes: `${seam.name}: ${seam.length}cm long`,
    })),
    hem_specifications: Object.entries(schema.construction.hems).map(([location, spec]) => ({
      location,
      type: spec,
      width: 1.5, // cm
      finish: 'clean',
    })),
    closure_specifications: schema.construction.closures.length > 0 ? schema.construction.closures : ['none'],
    assembly_sequence: [
      'Cut all pattern pieces with 1.5cm seam allowance',
      'Match and align shoulder seams',
      'Construct side seams using flat felled stitch',
      'Attach sleeves to armhole',
      'Apply neckline binding',
      'Hem sleeve cuffs',
      'Hem bottom length',
      'Final pressing',
      'Quality inspection',
    ],
  };
}

/**
 * Generates quality specifications
 */
function generateQualitySpecs(schema) {
  return {
    dimension_tolerance: schema.manufacturing.quality_tolerance.dimension_variance_cm,
    weight_tolerance: schema.manufacturing.quality_tolerance.weight_variance_gsm,
    quality_checks: schema.manufacturing.quality_checks.map((check) => ({
      check_type: check,
      frequency: 'every_piece',
      acceptance_criteria: getAcceptanceCriteria(check),
    })),
    defect_classification: {
      critical: ['broken_seams', 'color_mismatch', 'holes_stains'],
      major: ['skewed_seams', 'uneven_hem', 'pulled_thread'],
      minor: ['loose_thread', 'small_stain'],
    },
  };
}

/**
 * Generates production guide
 */
function generateProductionGuide(schema) {
  return {
    complexity_level: schema.manufacturing.complexity_level,
    estimated_time_minutes: schema.manufacturing.estimated_production_time_minutes,
    operator_skill_level: getSkillLevel(schema.manufacturing.complexity_level),
    machine_requirements: getMachineRequirements(schema),
    production_warnings: schema.notes.production_warnings,
    production_notes: schema.notes.production_notes || [],
    pattern_grading: {
      xs: 'reduce by 5%',
      s: 'reduce by 2.5%',
      m: 'base size',
      l: 'increase by 2.5%',
      xl: 'increase by 5%',
      xxl: 'increase by 7.5%',
    },
  };
}

/**
 * Generates cost estimate
 */
function generateCostEstimate(schema) {
  const { material_cost, labor_cost, overhead_cost, total_cost } = schema.costing;

  return {
    material_cost,
    labor_cost,
    overhead_cost,
    total_cost,
    currency: 'USD',
    breakdown: {
      fabric_percentage: material_cost > 0 ? ((material_cost / total_cost) * 100).toFixed(1) : 0,
      labor_percentage: labor_cost > 0 ? ((labor_cost / total_cost) * 100).toFixed(1) : 0,
      overhead_percentage: overhead_cost > 0 ? ((overhead_cost / total_cost) * 100).toFixed(1) : 0,
    },
  };
}

// Helper functions

function generateCareInstructions(material) {
  const instructions = {
    cotton: ['Machine wash cold', 'Tumble dry low', 'Iron at medium heat'],
    polyester: ['Machine wash warm', 'Tumble dry medium', 'Low iron if needed'],
    linen: ['Hand wash or gentle cycle', 'Hang dry', 'Iron while damp'],
    denim: ['Wash inside out cold', 'Air dry', 'Iron if needed'],
    wool: ['Hand wash in cold water', 'Lay flat to dry', 'No bleach'],
  };

  return instructions[material] || instructions.cotton;
}

function getAcceptanceCriteria(checkType) {
  const criteria = {
    seam_strength: 'No breaking under 5kg tension',
    color_consistency: 'ΔE < 1.0 between pieces',
    dimension_tolerance: '±1.0cm from spec',
    hem_quality: 'Stitching even and secure',
  };

  return criteria[checkType] || 'Visual inspection pass';
}

function getSkillLevel(complexity) {
  if (complexity === 'low') return 'Entry level';
  if (complexity === 'medium') return 'Intermediate';
  return 'Advanced';
}

function getMachineRequirements(schema) {
  const machines = ['Straight stitch sewing machine', 'Serger (overlock)', 'Heat press'];

  if (schema.construction.seams.some((s) => s.type === 'flat_felled')) {
    machines.push('Flatlock or double needle machine');
  }

  if (schema.materials.primary === 'denim') {
    machines.push('Heavy duty sewing machine with industrial thread');
  }

  return machines;
}

module.exports = techpackGenerator;
