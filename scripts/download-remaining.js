#!/usr/bin/env node

/**
 * Try alternative URLs for the remaining missing exercises
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');

// Alternative URLs for exercises that failed
const EXERCISE_URLS = {
  'cable-flyes': 'https://exrx.net/WeightExercises/PectoralSternal/CBStandingFly',
  'lat-pulldown': 'https://exrx.net/WeightExercises/LatissimusDorsi/CBFrontPulldown',
  'leg-press': 'https://exrx.net/WeightExercises/Quadriceps/LVLegPress',
  'bulgarian-split-squat': 'https://exrx.net/WeightExercises/Quadriceps/DBSingleLegSplitSquat',
  'glute-ham-raise': 'https://exrx.net/WeightExercises/Hamstrings/WTGluteHamRaise',
  'preacher-curl': 'https://exrx.net/WeightExercises/Biceps/BBPreacherCurl',
  'concentration-curl': 'https://exrx.net/WeightExercises/Biceps/DBSingleConcentrationCurl',
  'overhead-tricep-extension': 'https://exrx.net/WeightExercises/Triceps/DBStandingTriExt',
  'farmers-walk': 'https://exrx.net/WeightExercises/GluteusMaximus/DBFarmersWalk',
  'plank': 'https://exrx.net/WeightExercises/RectusAbdominis/FrontPlank',
  'ab-wheel-rollout': 'https://exrx.net/WeightExercises/RectusAbdominis/WtRollOut',
  'hanging-leg-raise': 'https://exrx.net/WeightExercises/RectusAbdominis/WtHangingLegRaise',
  'russian-twist': 'https://exrx.net/WeightExercises/Obliques/WtRussianTwist',
  'side-plank': 'https://exrx.net/WeightExercises/Obliques/SidePlank',
  'bicycle-crunch': 'https://exrx.net/WeightExercises/Obliques/BWBicycleCrunch',
  'back-extension': 'https://exrx.net/WeightExercises/ErectorSpinae/BWBackExtension',
  'supermans': 'https://exrx.net/WeightExercises/ErectorSpinae/BWSuperMan',
  'box-jump': 'https://exrx.net/WeightExercises/Quadriceps/BWBoxJump',
  'burpees': 'https://exrx.net/WeightExercises/RectusAbdominis/BWBurpee',
  'kettlebell-swing': 'https://exrx.net/WeightExercises/GluteusMaximus/KBSwing',
  'turkish-getup': 'https://exrx.net/WeightExercises/GluteusMaximus/KBTurkishGetUp',
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
      return { success: false, error: 'No HTML' };
    }
    
    const gifMatch = result.html.match(/<attribute[^>]+name="src"[^>]+value="([^"]+\.gif)"/i);
    
    if (!gifMatch) {
      return { success: false, error: 'No GIF found' };
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
      return { success: false, error: 'Too small' };
    }
    
    return { success: true, cached: false, size: stats.size };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔄 Trying alternative URLs for remaining exercises\n');
  
  const total = Object.keys(EXERCISE_URLS).length;
  let downloaded = 0;
  let cached = 0;
  let failed = 0;
  
  for (const [exerciseId, url] of Object.entries(EXERCISE_URLS)) {
    process.stdout.write(`[${downloaded + cached + failed + 1}/${total}] ${exerciseId.padEnd(30)}... `);
    
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
      failed++;
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
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   📁 Total: ${total}`);
  
  // Final count
  const totalGifs = fs.readdirSync(GIFS_DIR).filter(f => f.endsWith('.gif')).length;
  console.log(`\n📦 Total GIFs in folder: ${totalGifs}`);
}

main().catch(console.error);
