const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const analyzeSketch = require('./analyzeSketch');
const renderSvg = require('./renderSvg');
const techpackGenerator = require('./techpackGenerator');
const { estimateCost } = require('./costing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Upload configuration
const upload = multer({ dest: 'uploads/' });

// Routes

/**
 * POST /analyze
 * Analyzes sketch image and prompt to generate garment schema
 */
app.post('/analyze', upload.single('sketch'), async (req, res) => {
  try {
    const { prompt, garmentType } = req.body;
    const sketchPath = req.file ? req.file.path : null;

    const schema = await analyzeSketch({
      sketchPath,
      prompt,
      garmentType,
    });

    res.json({
      success: true,
      schema,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /render
 * Renders SVG preview from garment schema
 */
app.post('/render', (req, res) => {
  try {
    const { schema } = req.body;
    const svg = renderSvg(schema);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /techpack
 * Generates technical specification sheet
 */
app.post('/techpack', (req, res) => {
  try {
    const { schema } = req.body;
    const techpack = techpackGenerator(schema);

    res.json({
      success: true,
      techpack,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /costing
 * Calculates production costs
 */
app.post('/costing', (req, res) => {
  try {
    const { schema } = req.body;
    const cost = estimateCost(schema);

    res.json({
      success: true,
      cost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /
 * Serves main interface
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Fashion Parametric Engine running on http://localhost:${PORT}`);
});
