#!/usr/bin/env node

/**
 * Download exercises with manually verified URLs from ExRx.net search
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');

// Manually verified URLs from ExRx.net list pages
const EXERCISE_URLS = {
  'leg-press': 'https://exrx.net/WeightExercises/Quadriceps/LV45LegPress',
  'preacher-curl': 'https://exrx.net/WeightExercises/Brachialis/BBPreacherCurl',
  'concentration-curl': 'https://exrx.net/WeightExercises/Brachialis/DBConcentrationCurl',
  'overhead-tricep-extension': 'https://exrx.net/WeightExercises/Triceps/DBSeatedOneArmTriExt',
  'plank': 'https://exrx.net/WeightExercises/RectusAbdominis/BWFrontPlank',
  'side-plank': 'https://exrx.net/WeightExercises/Obliques/BWSidePlank',
  'hanging-leg-raise': 'https://exrx.net/WeightExercises/RectusAbdominis/BWHangingLegHipRaiseAbStrap',
  'ab-wheel-rollout': 'https://exrx.net/WeightExercises/RectusAbdominis/BWRollOutAbWheel',
  'russian-twist': 'https://exrx.net/WeightExercises/Obliques/WtSeatedTwist',
  'bicycle-crunch': 'https://exrx.net/WeightExercises/Obliques/BWTwistingSitUp',
  'back-extension': 'https://exrx.net/WeightExercises/ErectorSpinae/WtHyperextensionH',
  'supermans': 'https://exrx.net/WeightExercises/ErectorSpinae/ProneHyperextension',
  'farmers-walk': 'https://exrx.net/WeightExercises/Hamstrings/DBWalk',
  'romanian-deadlift': 'https://exrx.net/WeightExercises/Hamstrings/BBStraightLegDeadlift',
};

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function downloadExerciseGif(exerciseId, exrxUrl) {
  const app = new Firecrawl({ apiKey: API_KEY });
  
  try {
    const result = await app.scrape(exrxUrl, {
      formats: ['html'],
      timeout: 30000,
      waitFor: 2000
    });
    
    if (!result || !result.html) {
      return { success: false, error: 'No HTML', url: exrxUrl };
    }
    
    const gifMatch = result.html.match(/<attribute[^>]+name="src"[^>]+value="([^"]+\.gif)"/i);
    
    if (!gifMatch) {
      return { success: false, error: 'No GIF found', url: exrxUrl };
    }
    
    const gifUrl = gifMatch[1];
    const filename = exerciseId + '.gif';
    const filepath = path.join(GIFS_DIR, filename);
    
    // Skip if exists
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      return { success: true, cached: true, size: stats.size };
    }
    
    await downloadFile(gifUrl, filepath);
    
    const stats = fs.statSync(filepath);
    
    if (stats.size < 10240) {
      fs.unlinkSync(filepath);
      return { success: false, error: 'Too small', url: exrxUrl };
    }
    
    return { success: true, cached: false, size: stats.size };
    
  } catch (error) {
    return { success: false, error: error.message, url: exrxUrl };
  }
}

async function main() {
  console.log('✅ Downloading verified exercises\n');
  
  const total = Object.keys(EXERCISE_URLS).length;
  let downloaded = 0;
  let cached = 0;
  let failed = [];
  
  for (const [exerciseId, url] of Object.entries(EXERCISE_URLS)) {
    process.stdout.write(`[${downloaded + cached + failed.length + 1}/${total}] ${exerciseId.padEnd(30)}... `);
    
    const result = await downloadExerciseGif(exerciseId, url);
    
    if (result.success) {
      if (result.cached) {
        cached++;
        process.stdout.write(`✓ cached\n`);
      } else {
        downloaded++;
        process.stdout.write(`✓ (${(result.size / 1024).toFixed(1)}KB)\n`);
      }
    } else {
      failed.push({ exerciseId, ...result });
      process.stdout.write(`✗ (${result.error})\n`);
    }
    
    // Delay to avoid rate limiting
    if (!result.cached) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   ✓ Downloaded: ${downloaded}`);
  console.log(`   ✓ Cached: ${cached}`);
  console.log(`   ✗ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed:`);
    failed.forEach(f => {
      console.log(`   - ${f.exerciseId}: ${f.error}`);
    });
  }
  
  const totalGifs = fs.readdirSync(GIFS_DIR).filter(f => f.endsWith('.gif')).length;
  console.log(`\n📦 Total GIFs: ${totalGifs}`);
}

main().catch(console.error);
