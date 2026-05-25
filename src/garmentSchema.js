/**
 * Normalized garment schema factory
 * Represents all parametric data required for manufacturing pipeline
 */

const GARMENT_TYPES = {
  tshirt: 'tshirt',
  shirt: 'shirt',
  pants: 'pants',
  jacket: 'jacket',
  dress: 'dress',
  skirt: 'skirt',
  hoodie: 'hoodie',
};

const FITS = {
  slim: 'slim',
  regular: 'regular',
  relaxed: 'relaxed',
  oversized: 'oversized',
};

const MATERIALS = {
  cotton: { cost_per_meter: 8.5, weight_gsm: 180, stretch: 5 },
  polyester: { cost_per_meter: 5.2, weight_gsm: 150, stretch: 8 },
  linen: { cost_per_meter: 12.0, weight_gsm: 200, stretch: 3 },
  denim: { cost_per_meter: 14.5, weight_gsm: 600, stretch: 2 },
  wool: { cost_per_meter: 18.0, weight_gsm: 300, stretch: 4 },
};

/**
 * Creates a default garment schema
 */
function createSchema() {
  return {
    metadata: {
      version: '1.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    garment: {
      type: GARMENT_TYPES.tshirt,
      silhouette: 'basic',
      description: '',
    },
    dimensions: {
      chest_width: 50, // cm
      length: 70, // cm
      sleeve_length: 20, // cm
      shoulder_width: 42, // cm
      waist_width: 48, // cm
      hip_width: 52, // cm
      neck_opening: 20, // cm
      arm_hole_depth: 22, // cm
      sleeve_width_cuff: 18, // cm
    },
    fit: {
      type: FITS.regular,
      ease_percentage: 8, // Design ease above body measurements
    },
    materials: {
      primary: 'cotton',
      weight_gsm: 180,
      color: 'natural',
      finish: 'none',
    },
    construction: {
      seam_type: 'flat_felled', // flat_felled, safety_stitch, overlock
      panel_count: 4,
      seams: [
        { name: 'side_seam', length: 70, type: 'flat_felled', position: 'sides' },
        { name: 'shoulder_seam', length: 42, type: 'flat_felled', position: 'shoulders' },
        { name: 'neck_binding', length: 20, type: 'binding', position: 'neckline' },
        { name: 'sleeve_hem', length: 56, type: 'hemmed', position: 'sleeve_cuff' },
      ],
      closures: [], // buttons, zippers, snaps
      hems: {
        bottom: 'single_fold_2cm',
        sleeves: 'single_fold_2cm',
        neckline: 'binding_1cm',
      },
    },
    manufacturing: {
      manufacturability_score: 8.5, // 0-10
      complexity_level: 'low', // low, medium, high
      estimated_production_time_minutes: 15,
      production_constraints: [],
      quality_checks: [
        'seam_strength',
        'color_consistency',
        'dimension_tolerance',
        'hem_quality',
      ],
      quality_tolerance: {
        dimension_variance_cm: 1.0,
        weight_variance_gsm: 5,
      },
    },
    costing: {
      material_cost: 0,
      labor_cost: 0,
      overhead_cost: 0,
      total_cost: 0,
      currency: 'USD',
    },
    notes: {
      design_notes: '',
      construction_notes: '',
      quality_notes: '',
      production_warnings: [],
    },
  };
}

/**
 * Validates schema against requirements
 */
function validateSchema(schema) {
  const errors = [];

  if (!schema.garment.type || !Object.values(GARMENT_TYPES).includes(schema.garment.type)) {
    errors.push('Invalid garment type');
  }

  if (schema.dimensions.chest_width < 20 || schema.dimensions.chest_width > 200) {
    errors.push('Chest width out of valid range');
  }

  if (schema.dimensions.length < 30 || schema.dimensions.length > 150) {
    errors.push('Length out of valid range');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates material quantity needed
 */
function calculateMaterialQuantity(schema) {
  const baseWidth = schema.dimensions.chest_width / 100; // meters
  const baseLength = schema.dimensions.length / 100; // meters
  const quantity = (baseWidth + 0.15) * (baseLength + 0.20); // 15% waste width, 20% waste length
  return parseFloat(quantity.toFixed(2));
}

module.exports = {
  createSchema,
  validateSchema,
  calculateMaterialQuantity,
  GARMENT_TYPES,
  FITS,
  MATERIALS,
};
