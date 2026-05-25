/**
 * SVG Renderer
 * Generates 2D flat-pattern technical drawings from garment schema
 */

/**
 * Renders a complete garment pattern as SVG
 */
function renderSvg(schema) {
  const width = 800;
  const height = 1000;
  const scale = 3; // pixels per cm

  let svg = createSvgHeader(width, height);

  // Draw garment based on type
  switch (schema.garment.type) {
    case 'tshirt':
      svg += renderTshirtPattern(schema, scale);
      break;
    case 'shirt':
      svg += renderShirtPattern(schema, scale);
      break;
    case 'jacket':
      svg += renderJacketPattern(schema, scale);
      break;
    default:
      svg += renderGenericPattern(schema, scale);
  }

  // Add dimensions and labels
  svg += renderDimensionLabels(schema, scale);

  // Add seam information
  svg += renderSeamMarkers(schema, scale);

  // Add quality notes
  svg += renderQualityInfo(schema);

  svg += '</svg>';

  return svg;
}

/**
 * Creates SVG header with definitions
 */
function createSvgHeader(width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .garment-outline { stroke: #000; stroke-width: 2; fill: none; }
      .seam-line { stroke: #333; stroke-width: 1; stroke-dasharray: 2,2; fill: none; }
      .dimension-line { stroke: #666; stroke-width: 0.5; }
      .dimension-text { font-size: 10px; font-family: monospace; fill: #333; }
      .panel-label { font-size: 12px; font-family: monospace; fill: #444; font-weight: bold; }
      .info-text { font-size: 11px; font-family: monospace; fill: #555; }
      .warning-text { font-size: 10px; font-family: monospace; fill: #cc0000; font-weight: bold; }
    </style>
  </defs>
  <g>
`;
}

/**
 * Renders a T-shirt flat pattern
 */
function renderTshirtPattern(schema, scale) {
  const { chest_width, length, sleeve_length, shoulder_width, sleeve_width_cuff } = schema.dimensions;
  const { fit } = schema;

  let svg = '';

  // Front panel
  const frontX = 50;
  const frontY = 100;
  const frontW = chest_width * scale;
  const frontH = length * scale;

  // Front body
  svg += `<rect x="${frontX}" y="${frontY}" width="${frontW}" height="${frontH}" class="garment-outline" />`;
  svg += `<text x="${frontX + frontW / 2}" y="${frontY + 20}" class="panel-label" text-anchor="middle">FRONT</text>`;

  // Back panel
  const backX = frontX + frontW + 30;
  const backY = frontY;

  svg += `<rect x="${backX}" y="${backY}" width="${frontW}" height="${frontH}" class="garment-outline" />`;
  svg += `<text x="${backX + frontW / 2}" y="${backY + 20}" class="panel-label" text-anchor="middle">BACK</text>`;

  // Sleeve left
  const sleeveX = frontX - 40;
  const sleeveY = frontY + length * scale + 50;
  const sleeveW = sleeve_width_cuff * scale;
  const sleeveH = sleeve_length * scale;

  svg += `<rect x="${sleeveX}" y="${sleeveY}" width="${sleeveW}" height="${sleeveH}" class="garment-outline" />`;
  svg += `<text x="${sleeveX + sleeveW / 2}" y="${sleeveY + 15}" class="panel-label" text-anchor="middle">SL</text>`;

  // Sleeve right
  const sleeveRX = sleeveX + sleeveW + 20;

  svg += `<rect x="${sleeveRX}" y="${sleeveY}" width="${sleeveW}" height="${sleeveH}" class="garment-outline" />`;
  svg += `<text x="${sleeveRX + sleeveW / 2}" y="${sleeveY + 15}" class="panel-label" text-anchor="middle">SR</text>`;

  // Seam indicators
  svg += `<line x1="${frontX + frontW}" y1="${frontY}" x2="${frontX + frontW}" y2="${frontY + frontH}" class="seam-line" />`;
  svg += `<text x="${frontX + frontW + 8}" y="${frontY + 30}" class="dimension-text">side seam</text>`;

  return svg;
}

/**
 * Renders a generic garment pattern
 */
function renderGenericPattern(schema, scale) {
  const { chest_width, length } = schema.dimensions;
  const panelCount = schema.construction.panel_count;

  let svg = '';
  const baseX = 100;
  const baseY = 100;
  const panelW = (chest_width / Math.ceil(Math.sqrt(panelCount))) * scale;
  const panelH = (length / Math.ceil(Math.sqrt(panelCount))) * scale;

  let panelNum = 1;
  for (let i = 0; i < Math.ceil(Math.sqrt(panelCount)); i++) {
    for (let j = 0; j < Math.ceil(Math.sqrt(panelCount)); j++) {
      if (panelNum > panelCount) break;

      const x = baseX + i * (panelW + 20);
      const y = baseY + j * (panelH + 20);

      svg += `<rect x="${x}" y="${y}" width="${panelW}" height="${panelH}" class="garment-outline" />`;
      svg += `<text x="${x + panelW / 2}" y="${y + panelH / 2}" class="panel-label" text-anchor="middle" dy="0.3em">P${panelNum}</text>`;

      panelNum++;
    }
  }

  return svg;
}

/**
 * Renders dimension labels
 */
function renderDimensionLabels(schema, scale) {
  const { chest_width, length, sleeve_length } = schema.dimensions;
  let svg = '';

  // Chest width dimension
  svg += `<line x1="30" y1="85" x2="30" y2="100" class="dimension-line" />`;
  svg += `<text x="20" y="82" class="dimension-text">W: ${chest_width}cm</text>`;

  // Length dimension
  svg += `<line x1="45" y1="95" x2="50" y2="95" class="dimension-line" />`;
  svg += `<text x="10" y="200" class="dimension-text">L: ${length}cm</text>`;

  // Sleeve length
  svg += `<text x="10" y="800" class="dimension-text">Sleeve: ${sleeve_length}cm</text>`;

  return svg;
}

/**
 * Renders seam markers and indicators
 */
function renderSeamMarkers(schema, scale) {
  let svg = '';
  const baseY = 750;

  svg += `<text x="50" y="${baseY}" class="panel-label">SEAMS:</text>`;

  schema.construction.seams.forEach((seam, idx) => {
    svg += `<text x="50" y="${baseY + (idx + 1) * 18}" class="info-text">• ${seam.name}: ${seam.type}</text>`;
  });

  return svg;
}

/**
 * Renders quality and manufacturing information
 */
function renderQualityInfo(schema) {
  let svg = '';
  const baseY = 900;

  svg += `<text x="50" y="${baseY}" class="panel-label">QUALITY:</text>`;
  svg += `<text x="50" y="${baseY + 18}" class="info-text">Manufacturability: ${schema.manufacturing.manufacturability_score}/10</text>`;
  svg += `<text x="50" y="${baseY + 36}" class="info-text">Time: ${schema.manufacturing.estimated_production_time_minutes}min</text>`;

  if (schema.notes.production_warnings.length > 0) {
    svg += `<text x="50" y="${baseY + 54}" class="warning-text">⚠ Warnings: ${schema.notes.production_warnings[0]}</text>`;
  }

  return svg;
}

/**
 * Renders shirt pattern (with buttons)
 */
function renderShirtPattern(schema, scale) {
  let svg = renderTshirtPattern(schema, scale);

  // Add button placeholders
  svg += `<text x="50" y="950" class="info-text">• Button placement: centered front</text>`;

  return svg;
}

/**
 * Renders jacket pattern (with collar, lapels)
 */
function renderJacketPattern(schema, scale) {
  let svg = renderTshirtPattern(schema, scale);

  svg += `<text x="50" y="950" class="info-text">• Lapel construction required</text>`;
  svg += `<text x="50" y="970" class="info-text">• Collar: notch style</text>`;

  return svg;
}

module.exports = renderSvg;
