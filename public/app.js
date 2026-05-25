/**
 * Fashion Parametric Engine - Frontend Application
 * Handles UI interactions and API communication
 */

// State Management
const state = {
  currentSchema: null,
  currentTechpack: null,
  currentCosting: null,
};

// DOM References
const elements = {
  garmentType: document.getElementById('garmentType'),
  prompt: document.getElementById('prompt'),
  sketch: document.getElementById('sketch'),
  width: document.getElementById('width'),
  length: document.getElementById('length'),
  sleeves: document.getElementById('sleeves'),
  fit: document.getElementById('fit'),
  panels: document.getElementById('panels'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  resetBtn: document.getElementById('resetBtn'),
  status: document.getElementById('status'),
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabContents: document.querySelectorAll('.tab-content'),
  svgPreview: document.getElementById('svgPreview'),
  schemaOutput: document.getElementById('schemaOutput'),
  techpackOutput: document.getElementById('techpackOutput'),
  costingOutput: document.getElementById('costingOutput'),
  downloadSchemaBtn: document.getElementById('downloadSchemaBtn'),
  downloadTechpackBtn: document.getElementById('downloadTechpackBtn'),
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateSliderValues();
});

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Main buttons
  elements.analyzeBtn.addEventListener('click', handleAnalyze);
  elements.resetBtn.addEventListener('click', handleReset);

  // Slider value updates
  elements.width.addEventListener('input', updateSliderValues);
  elements.length.addEventListener('input', updateSliderValues);
  elements.sleeves.addEventListener('input', updateSliderValues);
  elements.panels.addEventListener('input', updateSliderValues);

  // Tab switching
  elements.tabBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
  });

  // Download buttons
  elements.downloadSchemaBtn.addEventListener('click', downloadSchema);
  elements.downloadTechpackBtn.addEventListener('click', downloadTechpack);
}

/**
 * Handle Analyze button click
 */
async function handleAnalyze() {
  try {
    setStatus('Analyzing design parameters...');
    elements.analyzeBtn.disabled = true;

    const formData = new FormData();
    formData.append('garmentType', elements.garmentType.value);
    formData.append('prompt', elements.prompt.value);
    if (elements.sketch.files.length > 0) {
      formData.append('sketch', elements.sketch.files[0]);
    }

    // Step 1: Analyze and generate schema
    const analyzeResponse = await fetch('/analyze', {
      method: 'POST',
      body: formData,
    });

    if (!analyzeResponse.ok) throw new Error('Analysis failed');

    const analyzeData = await analyzeResponse.json();
    state.currentSchema = analyzeData.schema;

    // Apply parametric adjustments
    applyParametricAdjustments(state.currentSchema);

    setStatus('Generating SVG preview...');

    // Step 2: Render SVG
    const renderResponse = await fetch('/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema: state.currentSchema }),
    });

    if (!renderResponse.ok) throw new Error('Rendering failed');

    const svgContent = await renderResponse.text();
    elements.svgPreview.innerHTML = svgContent;

    setStatus('Generating technical pack...');

    // Step 3: Generate Tech Pack
    const techpackResponse = await fetch('/techpack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema: state.currentSchema }),
    });

    if (!techpackResponse.ok) throw new Error('Tech pack generation failed');

    const techpackData = await techpackResponse.json();
    state.currentTechpack = techpackData.techpack;

    setStatus('Calculating production costs...');

    // Step 4: Calculate Costing
    const costingResponse = await fetch('/costing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schema: state.currentSchema }),
    });

    if (!costingResponse.ok) throw new Error('Costing calculation failed');

    const costingData = await costingResponse.json();
    state.currentCosting = costingData.cost;
    state.currentSchema.costing = state.currentCosting;

    // Display results
    displaySchema();
    displayTechpack();
    displayCosting();

    switchTab('preview');
    setStatus('Complete ✓');
  } catch (error) {
    setStatus(`Error: ${error.message}`);
    console.error('Analysis error:', error);
  } finally {
    elements.analyzeBtn.disabled = false;
  }
}

/**
 * Apply parametric adjustments from UI sliders
 */
function applyParametricAdjustments(schema) {
  schema.dimensions.chest_width = parseInt(elements.width.value);
  schema.dimensions.length = parseInt(elements.length.value);
  schema.dimensions.sleeve_length = parseInt(elements.sleeves.value);
  schema.fit.type = elements.fit.value;
  schema.construction.panel_count = parseInt(elements.panels.value);

  // Recalculate dependent values
  schema.dimensions.shoulder_width = schema.dimensions.chest_width * 0.84;
  schema.dimensions.waist_width = schema.dimensions.chest_width * 0.96;
  schema.dimensions.hip_width = schema.dimensions.chest_width * 1.04;
  schema.dimensions.sleeve_width_cuff = schema.dimensions.chest_width * 0.36;
}

/**
 * Display schema in output
 */
function displaySchema() {
  if (!state.currentSchema) return;

  const formatted = JSON.stringify(state.currentSchema, null, 2);
  elements.schemaOutput.textContent = formatted;
}

/**
 * Display tech pack in output
 */
function displayTechpack() {
  if (!state.currentTechpack) return;

  const formatted = JSON.stringify(state.currentTechpack, null, 2);
  elements.techpackOutput.textContent = formatted;
}

/**
 * Display costing information
 */
function displayCosting() {
  if (!state.currentCosting) return;

  const html = `
    <div class="costing-item">
      <span class="cost-label">Material Cost:</span>
      <span class="cost-value">$${state.currentCosting.material_cost.toFixed(2)}</span>
    </div>
    <div class="costing-item">
      <span class="cost-label">Labor Cost:</span>
      <span class="cost-value">$${state.currentCosting.labor_cost.toFixed(2)}</span>
    </div>
    <div class="costing-item">
      <span class="cost-label">Overhead:</span>
      <span class="cost-value">$${state.currentCosting.overhead_cost.toFixed(2)}</span>
    </div>
    <div class="costing-item">
      <span class="cost-label">Total Cost:</span>
      <span class="cost-value">$${state.currentCosting.total_cost.toFixed(2)}</span>
    </div>
    <div class="costing-item">
      <span class="cost-label">Material %:</span>
      <span class="cost-value">${state.currentCosting.breakdown.material_percentage}%</span>
    </div>
    <div class="costing-item">
      <span class="cost-label">Labor %:</span>
      <span class="cost-value">${state.currentCosting.breakdown.labor_percentage}%</span>
    </div>
  `;

  elements.costingOutput.innerHTML = html;
}

/**
 * Switch tabs
 */
function switchTab(tabName) {
  // Update buttons
  elements.tabBtns.forEach((btn) => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });

  // Update content
  elements.tabContents.forEach((content) => {
    content.classList.remove('active');
  });

  const activeContent = document.getElementById(`${tabName}-tab`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

/**
 * Update slider display values
 */
function updateSliderValues() {
  document.getElementById('widthValue').textContent = elements.width.value;
  document.getElementById('lengthValue').textContent = elements.length.value;
  document.getElementById('sleevesValue').textContent = elements.sleeves.value;
  document.getElementById('panelsValue').textContent = elements.panels.value;
}

/**
 * Handle Reset button
 */
function handleReset() {
  elements.garmentType.value = 'tshirt';
  elements.prompt.value = '';
  elements.sketch.value = '';
  elements.width.value = 50;
  elements.length.value = 70;
  elements.sleeves.value = 20;
  elements.fit.value = 'regular';
  elements.panels.value = 4;

  updateSliderValues();

  state.currentSchema = null;
  state.currentTechpack = null;
  state.currentCosting = null;

  elements.svgPreview.innerHTML = '<p class="placeholder">SVG rendering will appear here</p>';
  elements.schemaOutput.textContent = '/* Schema will appear here */';
  elements.techpackOutput.textContent = '/* Tech Pack will appear here */';
  elements.costingOutput.innerHTML = '<p class="placeholder">Cost breakdown will appear here</p>';

  setStatus('Ready');
}

/**
 * Download schema as JSON
 */
function downloadSchema() {
  if (!state.currentSchema) {
    alert('No schema to download. Analyze a design first.');
    return;
  }

  const dataStr = JSON.stringify(state.currentSchema, null, 2);
  downloadFile(dataStr, 'garment-schema.json', 'application/json');
}

/**
 * Download tech pack as JSON
 */
function downloadTechpack() {
  if (!state.currentTechpack) {
    alert('No tech pack to download. Analyze a design first.');
    return;
  }

  const dataStr = JSON.stringify(state.currentTechpack, null, 2);
  downloadFile(dataStr, 'technical-pack.json', 'application/json');
}

/**
 * Generic file download utility
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Update status message
 */
function setStatus(message) {
  elements.status.textContent = message;
}
