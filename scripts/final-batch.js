#!/usr/bin/env node

/**
 * Final batch of critical missing exercises with manually verified URLs
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');

// Manually verified URLs by browsing ExRx.net
const EXERCISE_URLS = {
  // Core compound exercises
  'leg-press': 'https://exrx.net/WeightExercises/Quadriceps/SLHorizontalLegPress',
  'bulgarian-split-squat': 'https://exrx.net/WeightExercises/Quadriceps/BBSingleLegSplitSquat',
  
  // Arm isolation
  'preacher-curl': 'https://exrx.net/WeightExercises/Biceps/CBPreacherCurl',
  'concentration-curl': 'https://exrx.net/WeightExercises/Biceps/DBSeatedConcentrationCurl',
  'overhead-tricep-extension': 'https://exrx.net/WeightExercises/Triceps/CBTricepsExtension',
  
  // Core
  'plank': 'https://exrx.net/WeightExercises/RectusAbdominis/WtFrontPlank',
  'ab-wheel-rollout': 'https://exrx.net/WeightExercises/RectusAbdominis/WtRollout',
  'hanging-leg-raise': 'https://exrx.net/WeightExercises/HipFlexors/WtHangingLegRaise',
  'russian-twist': 'https://exrx.net/WeightExercises/Obliques/DBSeatedTwist',
  'side-plank': 'https://exrx.net/WeightExercises/Obliques/WtSidePlank',
  'bicycle-crunch': 'https://exrx.net/WeightExercises/Obliques/BWCrossCrunch',
  
  // Lower back
  'back-extension': 'https://exrx.net/WeightExercises/ErectorSpinae/BBGoodMorning',
  'supermans': 'https://exrx.net/WeightExercises/ErectorSpinae/ProneSuperman',
  
  // Functional
  'farmers-walk': 'https://exrx.net/WeightExercises/Hamstrings/DBFarmersCarry',
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
      // Save HTML for debugging
      const debugPath = path.join(GIFS_DIR, `${exerciseId}-debug.html`);
      fs.writeFileSync(debugPath, result.html.substring(0, 10000));
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
  console.log('🎯 Final batch: Critical missing exercises\n');
  
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
  console.log(`   📁 Total: ${total}`);
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed exercises:`);
    failed.forEach(f => {
      console.log(`   - ${f.exerciseId}: ${f.error}`);
      console.log(`     URL: ${f.url}`);
    });
  }
  
  // Final count
  const totalGifs = fs.readdirSync(GIFS_DIR).filter(f => f.endsWith('.gif')).length;
  console.log(`\n📦 Total GIFs in folder: ${totalGifs}`);
}

main().catch(console.error);
