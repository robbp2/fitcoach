#!/usr/bin/env node

/**
 * Download specific missing exercises using Firecrawl search
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');

// Manual mapping of app exercise IDs to ExRx.net search terms / known URLs
const EXERCISE_URLS = {
  // Already mapped from original script
  'incline-dumbbell-press': 'https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress',
  'dumbbell-flyes': 'https://exrx.net/WeightExercises/PectoralSternal/DBFly',
  'cable-flyes': 'https://exrx.net/WeightExercises/PectoralSternal/CBFly',
  'push-ups': 'https://exrx.net/WeightExercises/PectoralSternal/BWPushup',
  
  // Back
  'lat-pulldown': 'https://exrx.net/WeightExercises/LatissimusDorsi/CBPulldown',
  'dumbbell-row': 'https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow',
  'seated-cable-row': 'https://exrx.net/WeightExercises/BackGeneral/CBSeatedRow',
  't-bar-row': 'https://exrx.net/WeightExercises/BackGeneral/LVTBarRow',
  'face-pulls': 'https://exrx.net/WeightExercises/DeltoidPosterior/CBRearDeltRow',
  
  // Shoulders
  'lateral-raises': 'https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise',
  'front-raises': 'https://exrx.net/WeightExercises/DeltoidAnterior/DBFrontRaise',
  'rear-delt-flyes': 'https://exrx.net/WeightExercises/DeltoidPosterior/DBRearLateralRaise',
  
  // Legs
  'front-squat': 'https://exrx.net/WeightExercises/Quadriceps/BBFrontSquat',
  'leg-press': 'https://exrx.net/WeightExercises/Quadriceps/SLLegPress45',
  'bulgarian-split-squat': 'https://exrx.net/WeightExercises/Quadriceps/DBSingleLegSplitSquat',
  'leg-extension': 'https://exrx.net/WeightExercises/Quadriceps/LVLegExtension',
  'walking-lunges': 'https://exrx.net/WeightExercises/Quadriceps/DBLunge',
  'leg-curl': 'https://exrx.net/WeightExercises/Hamstrings/LVLyingLegCurl',
  'glute-ham-raise': 'https://exrx.net/WeightExercises/Hamstrings/BWGluteHamRaise',
  'hip-thrust': 'https://exrx.net/WeightExercises/GluteusMaximus/BBHipThrust',
  'good-mornings': 'https://exrx.net/WeightExercises/Hamstrings/BBGoodMorning',
  'standing-calf-raise': 'https://exrx.net/WeightExercises/Gastrocnemius/BBStandingCalfRaise',
  'seated-calf-raise': 'https://exrx.net/WeightExercises/Soleus/LVSeatedCalfRaise',
  
  // Arms
  'dumbbell-curl': 'https://exrx.net/WeightExercises/Biceps/DBCurl',
  'hammer-curl': 'https://exrx.net/WeightExercises/Brachioradialis/DBHammerCurl',
  'preacher-curl': 'https://exrx.net/WeightExercises/Biceps/DBPreacherCurl',
  'cable-curl': 'https://exrx.net/WeightExercises/Biceps/CBCurl',
  'concentration-curl': 'https://exrx.net/WeightExercises/Biceps/DBConcentrationCurl',
  'overhead-tricep-extension': 'https://exrx.net/WeightExercises/Triceps/DBSeatedTriExt',
  'tricep-pushdown': 'https://exrx.net/WeightExercises/Triceps/CBPushdown',
  'skull-crushers': 'https://exrx.net/WeightExercises/Triceps/BBLyingTriExtSC',
  'wrist-curl': 'https://exrx.net/WeightExercises/WristFlexors/BBWristCurl',
  'reverse-wrist-curl': 'https://exrx.net/WeightExercises/WristExtensors/BBReverseWristCurl',
  
  // Core
  'plank': 'https://exrx.net/WeightExercises/RectusAbdominis/BWFrontPlank',
  'ab-wheel-rollout': 'https://exrx.net/WeightExercises/RectusAbdominis/BWRollOut',
  'hanging-leg-raise': 'https://exrx.net/WeightExercises/RectusAbdominis/BWHangingLegRaise',
  'cable-crunch': 'https://exrx.net/WeightExercises/RectusAbdominis/CBKneelingCrunch',
  'russian-twist': 'https://exrx.net/WeightExercises/Obliques/BWSittingTwist',
  'side-plank': 'https://exrx.net/WeightExercises/Obliques/BWSidePlank',
  'bicycle-crunch': 'https://exrx.net/WeightExercises/RectusAbdominis/BWBicycleCrunch',
  
  // Traps
  'barbell-shrug': 'https://exrx.net/WeightExercises/TrapeziusUpper/BBShrug',
  'dumbbell-shrug': 'https://exrx.net/WeightExercises/TrapeziusUpper/DBShrug',
  
  // Lower back
  'back-extension': 'https://exrx.net/WeightExercises/ErectorSpinae/WtBackExtension',
  'supermans': 'https://exrx.net/WeightExercises/ErectorSpinae/BWSuperman',
  
  // Olympic/Power
  'clean': 'https://exrx.net/WeightExercises/OlympicLifts/PowerClean',
  'snatch': 'https://exrx.net/WeightExercises/OlympicLifts/PowerSnatch',
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
  console.log('🎯 Downloading missing exercises\n');
  
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
}

main().catch(console.error);
