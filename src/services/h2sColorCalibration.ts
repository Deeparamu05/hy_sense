/**
 * HYSENSE H₂S Strip Color Calibration & Analysis Engine
 * 
 * Configurable calibration data and colorimetric analysis for visible strip evaluation.
 * Note: The ppm value is an ESTIMATED PROTOTYPE value based on colorimetric strip analysis.
 * Visible strip colour alone does not provide an accurate, certified ppm measurement.
 */

export interface H2SCalibrationBand {
  id: 'low' | 'moderate' | 'high' | 'very_high';
  colorName: string;               // Display colour name e.g. "Light / Unchanged"
  exposureLevel: string;           // Formatted tier e.g. "LOW", "MODERATE", "HIGH", "VERY HIGH / CRITICAL"
  exposureLevelCategory: 'Low' | 'Moderate' | 'High' | 'Very High / Critical';
  badgeLevel: 'Safe' | 'Caution' | 'High' | 'Critical'; // Maps to UI badge components
  estimatedPpmDisplay: string;     // e.g. "~0 - 5 ppm (Est.)"
  estimatedPpmNumeric: number;     // Approximate representative numeric ppm for backend storage
  colorSwatchHex: string;          // Hex for visual preview in UI
  description: string;
}

/**
 * CONFIGURABLE CALIBRATION DATA
 * Modify these bands and ranges when manufacturer calibration curves become available.
 */
export const H2S_CALIBRATION_CONFIG: {
  version: string;
  disclaimer: string;
  bands: H2SCalibrationBand[];
} = {
  version: "1.0-prototype",
  disclaimer: "The ppm value is an ESTIMATED PROTOTYPE value. Visible strip colour alone does not provide an accurate ppm measurement. Calibrated with manufacturer strip comparison chart.",
  bands: [
    {
      id: 'low',
      colorName: 'Light / Unchanged',
      exposureLevel: 'LOW',
      exposureLevelCategory: 'Low',
      badgeLevel: 'Safe',
      estimatedPpmDisplay: '~0 - 5 ppm (Est.)',
      estimatedPpmNumeric: 2.5,
      colorSwatchHex: '#f5f5f0',
      description: 'White to light cream tone. Minimal to no detectable reaction on strip.'
    },
    {
      id: 'moderate',
      colorName: 'Yellow / Light Brown',
      exposureLevel: 'MODERATE',
      exposureLevelCategory: 'Moderate',
      badgeLevel: 'Caution',
      estimatedPpmDisplay: '~5 - 10 ppm (Est.)',
      estimatedPpmNumeric: 7.5,
      colorSwatchHex: '#d4a373',
      description: 'Yellowish-tan to light brown discoloration indicating elevated H₂S exposure.'
    },
    {
      id: 'high',
      colorName: 'Dark Brown',
      exposureLevel: 'HIGH',
      exposureLevelCategory: 'High',
      badgeLevel: 'High',
      estimatedPpmDisplay: '~10 - 20 ppm (Est.)',
      estimatedPpmNumeric: 15.0,
      colorSwatchHex: '#7f4f24',
      description: 'Significant dark brown coloration representing dangerous industrial sulphide levels.'
    },
    {
      id: 'very_high',
      colorName: 'Very Dark Brown / Dark Black',
      exposureLevel: 'VERY HIGH / CRITICAL',
      exposureLevelCategory: 'Very High / Critical',
      badgeLevel: 'Critical',
      estimatedPpmDisplay: '~> 20 ppm (Est.)',
      estimatedPpmNumeric: 25.0,
      colorSwatchHex: '#1f1610',
      description: 'Very dark brown to near-black lead sulphide precipitate. Evacuation protocol hazard.'
    }
  ]
};

export interface H2SColorAnalysisResult {
  isConfident: boolean;
  band?: H2SCalibrationBand;
  exposureLevel?: string;
  estimatedPpmDisplay?: string;
  estimatedPpmNumeric?: number;
  detectedColorName?: string;
  sampledHex?: string;
  averageRgb?: { r: number; g: number; b: number };
  errorMessage?: string;
}

/**
 * Converts RGB to HSV (Hue in 0-360, Saturation 0-1, Value 0-1)
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

function componentToHex(c: number): string {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Classifies an RGB color into one of the configurable H₂S calibration bands.
 * Returns null if the color falls outside expected sulfide reaction parameters (e.g., pure blue, green, neon pink).
 */
export function classifyColor(r: number, g: number, b: number): H2SCalibrationBand | null {
  // Luminance: perceptual brightness
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  const { h, s } = rgbToHsv(r, g, b);

  // Check for unnatural outliers:
  // Sulfide reaction strips go White -> Cream -> Yellow-Tan -> Brown -> Dark Brown -> Black.
  // Natural reaction always has warm tones (R >= G >= B or balanced grayscale).
  // Non-strip artifacts (blue shirts, green grass/foliage, bright cyan, neon purple) are unclassifiable.
  const isVividBlue = (h >= 170 && h <= 265) && s > 0.22;
  const isVividGreen = (h >= 85 && h < 170) && s > 0.25;
  const isVividMagenta = (h > 275 && h < 345) && s > 0.30;

  if (isVividBlue || isVividGreen || isVividMagenta) {
    return null; // Cannot be classified confidently
  }

  // 1. Very Dark Brown / Dark Black (Level 9-10)
  // Very low luminance (< 60)
  if (luminance < 60) {
    return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'very_high') || null;
  }

  // 2. Light / Unchanged (Level 1-3)
  // High luminance (>= 185) with low/moderate saturation, or clean off-white
  if (luminance >= 185) {
    return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'low') || null;
  }

  // 3. Yellow / Light Brown (Level 4-5)
  // Luminance between 125 and 185, warm yellow-brown hue (typically 20° to 65°)
  if (luminance >= 125 && luminance < 185) {
    // Check for warm brown/tan characteristic: red channel is highest
    if (r >= b) {
      return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'moderate') || null;
    }
  }

  // 4. Dark Brown (Level 6-8)
  // Luminance between 60 and 125, rich brown tone
  if (luminance >= 60 && luminance < 125) {
    if (r >= b) {
      return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'high') || null;
    }
  }

  // Borderline fallback based on luminance
  if (luminance < 110) {
    return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'high') || null;
  } else if (luminance < 175) {
    return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'moderate') || null;
  } else {
    return H2S_CALIBRATION_CONFIG.bands.find(b => b.id === 'low') || null;
  }
}

/**
 * Analyzes a strip image (Base64 data URL or image source).
 * Samples the central region where the reactive strip pad sits.
 */
export async function analyzeStripColor(imageBase64: string): Promise<H2SColorAnalysisResult> {
  return new Promise((resolve) => {
    if (!imageBase64 || imageBase64.trim() === '') {
      resolve({
        isConfident: false,
        errorMessage: 'Unable to estimate exposure — rescan strip.'
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 300;
        const height = img.naturalHeight || img.height || 300;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            isConfident: false,
            errorMessage: 'Unable to estimate exposure — rescan strip.'
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Sample center strip region (center 40% width and 40% height)
        const sampleX = Math.floor(width * 0.30);
        const sampleY = Math.floor(height * 0.30);
        const sampleW = Math.max(1, Math.floor(width * 0.40));
        const sampleH = Math.max(1, Math.floor(height * 0.40));

        const imageData = ctx.getImageData(sampleX, sampleY, sampleW, sampleH);
        const data = imageData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let validPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > 50) { // Ignore fully transparent pixels
            totalR += data[i];
            totalG += data[i + 1];
            totalB += data[i + 2];
            validPixels++;
          }
        }

        if (validPixels === 0) {
          resolve({
            isConfident: false,
            errorMessage: 'Unable to estimate exposure — rescan strip.'
          });
          return;
        }

        const avgR = Math.round(totalR / validPixels);
        const avgG = Math.round(totalG / validPixels);
        const avgB = Math.round(totalB / validPixels);
        const sampledHex = rgbToHex(avgR, avgG, avgB);

        const band = classifyColor(avgR, avgG, avgB);

        if (!band) {
          resolve({
            isConfident: false,
            sampledHex,
            averageRgb: { r: avgR, g: avgG, b: avgB },
            errorMessage: 'Unable to estimate exposure — rescan strip.'
          });
          return;
        }

        resolve({
          isConfident: true,
          band,
          exposureLevel: band.exposureLevel,
          estimatedPpmDisplay: band.estimatedPpmDisplay,
          estimatedPpmNumeric: band.estimatedPpmNumeric,
          detectedColorName: band.colorName,
          sampledHex,
          averageRgb: { r: avgR, g: avgG, b: avgB }
        });
      } catch (err) {
        console.error('Strip color analysis failed:', err);
        resolve({
          isConfident: false,
          errorMessage: 'Unable to estimate exposure — rescan strip.'
        });
      }
    };

    img.onerror = () => {
      resolve({
        isConfident: false,
        errorMessage: 'Unable to estimate exposure — rescan strip.'
      });
    };

    img.src = imageBase64;
  });
}
