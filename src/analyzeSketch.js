/**
 * Sketch Analysis Module
 * Simulates AI extraction from garment sketches and prompts
 * In production, this would integrate with vision API
 */

const { createSchema, GARMENT_TYPES, FITS } = require('./garmentSchema');

/**
 * Extracts design parameters from sketch image and text prompt
 * Returns a populated garment schema
 */
async function analyzeSketch({ sketchPath, prompt, garmentType }) {
  const schema = createSchema();

  // Set garment type
  if (garmentType && Object.values(GARMENT_TYPES).includes(garmentType)) {
    schema.garment.type = garmentType;
  }

  // Parse prompt for design intent
  schema.garment.description = prompt || 'Custom parametric garment';

  // Simulate AI analysis of sketch - extract silhouette characteristics
  const silhouetteAnalysis = analyzePrompt(prompt);

  // Apply extracted parameters to schema
  if (silhouetteAnalysis.fit) {
    schema.fit.type = silhouetteAnalysis.fit;
  }

  if (silhouetteAnalysis.dimensions) {
    Object.assign(schema.dimensions, silhouetteAnalysis.dimensions);
  }

  if (silhouetteAnalysis.material) {
    schema.materials.primary = silhouetteAnalysis.material;
  }

  if (silhouetteAnalysis.complexity) {
    schema.manufacturing.complexity_level = silhouetteAnalysis.complexity;
  }

  // Calculate manufacturing implications
  updateManufacturingParameters(schema);

  // Add production warnings for complex geometries
  schema.notes.production_warnings = identifyProductionWarnings(schema);

  schema.metadata.updated_at = new Date().toISOString();

  return schema;
}

/**
 * Parses natural language prompt for design parameters
 */
function analyzePrompt(prompt) {
  if (!prompt) return {};

  const result = {
    dimensions: {},
  };

  const lower = prompt.toLowerCase();

  // Detect fit
  if (lower.includes('slim') || lower.includes('tight')) {
    result.fit = FITS.slim;
  } else if (lower.includes('oversized') || lower.includes('baggy')) {
    result.fit = FITS.oversized;
  } else if (lower.includes('relaxed') || lower.includes('loose')) {
    result.fit = FITS.relaxed;
  } else {
    result.fit = FITS.regular;
  }

  // Detect material
  if (lower.includes('linen')) {
    result.material = 'linen';
  } else if (lower.includes('denim')) {
    result.material = 'denim';
  } else if (lower.includes('wool')) {
    result.material = 'wool';
  } else if (lower.includes('polyester')) {
    result.material = 'polyester';
  } else {
    result.material = 'cotton';
  }

  // Detect sleeve length
  if (lower.includes('sleeveless')) {
    result.dimensions.sleeve_length = 0;
  } else if (lower.includes('short sleeve')) {
    result.dimensions.sleeve_length = 18;
  } else if (lower.includes('three quarter')) {
    result.dimensions.sleeve_length = 50;
  } else if (lower.includes('long sleeve')) {
    result.dimensions.sleeve_length = 65;
  }

  // Detect length
  if (lower.includes('cropped')) {
    result.dimensions.length = 45;
  } else if (lower.includes('oversized')) {
    result.dimensions.length = 85;
  } else if (lower.includes('long')) {
    result.dimensions.length = 95;
  }

  // Detect complexity
  if (lower.includes('complex') || lower.includes('intricate') || lower.includes('detailed')) {
    result.complexity = 'high';
  } else if (lower.includes('simple') || lower.includes('basic')) {
    result.complexity = 'low';
  } else {
    result.complexity = 'medium';
  }

  return result;
}

/**
 * Updates manufacturing parameters based on schema complexity
 */
function updateManufacturingParameters(schema) {
  const complexity = schema.manufacturing.complexity_level;
  const panelCount = schema.construction.panel_count;

  // Base production time: 15 minutes for simple tshirt
  let timeMultiplier = 1;

  if (complexity === 'high') {
    timeMultiplier = 2.5;
  } else if (complexity === 'medium') {
    timeMultiplier = 1.5;
  }

  timeMultiplier *= (panelCount / 4); // Adjust for panel count

  schema.manufacturing.estimated_production_time_minutes = Math.round(15 * timeMultiplier);

  // Manufacturability score decreases with complexity
  if (complexity === 'low') {
    schema.manufacturing.manufacturability_score = 9.0;
  } else if (complexity === 'medium') {
    schema.manufacturing.manufacturability_score = 7.5;
  } else {
    schema.manufacturing.manufacturability_score = 6.0;
  }
}

/**
 * Identifies potential production challenges
 */
function identifyProductionWarnings(schema) {
  const warnings = [];

  if (schema.manufacturing.complexity_level === 'high') {
    warnings.push('High complexity design requires experienced operators');
  }

  if (schema.construction.seams.length > 8) {
    warnings.push('Multiple seams may impact production time and quality');
  }

  if (schema.dimensions.sleeve_length > 60) {
    warnings.push('Long sleeves may require additional pattern grading');
  }

  if (schema.materials.primary === 'linen') {
    warnings.push('Linen may require specialized handling and preshrinking');
  }

  if (schema.materials.primary === 'denim') {
    warnings.push('Denim requires heavy-duty machinery and thread');
  }

  return warnings;
}

module.exports = analyzeSketch;
