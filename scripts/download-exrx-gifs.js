#!/usr/bin/env node

/**
 * Download exercise GIFs from ExRx.net using Firecrawl to bypass Cloudflare
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');

// Ensure directory exists
if (!fs.existsSync(GIFS_DIR)) {
  fs.mkdirSync(GIFS_DIR, { recursive: true });
}

// Exercise mapping: our ID -> ExRx.net path
const EXERCISE_MAP = {
  'barbell-bench-press': 'https://exrx.net/WeightExercises/PectoralSternal/BBBenchPress',
  'incline-barbell-bench': 'https://exrx.net/WeightExercises/PectoralClavicular/BBInclineBenchPress',
  'barbell-squat': 'https://exrx.net/WeightExercises/Quadriceps/BBSquat',
  'deadlift': 'https://exrx.net/WeightExercises/ErectorSpinae/BBDeadlift',
  'barbell-row': 'https://exrx.net/WeightExercises/BackGeneral/BBBentOverRow',
  'overhead-press': 'https://exrx.net/WeightExercises/DeltoidAnterior/BBMilitaryPress',
  'dumbbell-bench-press': 'https://exrx.net/WeightExercises/PectoralSternal/DBBenchPress',
  'pull-ups': 'https://exrx.net/WeightExercises/LatissimusDorsi/BWPullup',
  'dips': 'https://exrx.net/WeightExercises/Triceps/BWTriDip',
  'barbell-curl': 'https://exrx.net/WeightExercises/Biceps/BBCurl',
};

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
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
  console.log(`\n📥 Downloading: ${exerciseId}`);
  console.log(`   URL: ${exrxUrl}`);
  
  const app = new Firecrawl({ apiKey: API_KEY });
  
  try {
    // Scrape the ExRx page to get the GIF URL
    const result = await app.scrape(exrxUrl, { 
      formats: ['html'],
      timeout: 30000,
      waitFor: 2000
    });
    
    if (!result || !result.html) {
      throw new Error('No HTML content returned');
    }
    
    // ExRx uses an attribute tag: <attribute name="src" value="URL.gif">
    const attributeMatch = result.html.match(/<attribute[^>]+name="src"[^>]+value="([^"]+\.gif)"/i);
    
    if (!attributeMatch) {
      console.error(`   ❌ No GIF found in HTML`);
      // Save HTML for debugging
      fs.writeFileSync(path.join(GIFS_DIR, `${exerciseId}-debug.html`), result.html);
      console.log(`   💾 Saved HTML for debugging: ${exerciseId}-debug.html`);
      return false;
    }
    
    const gifUrl = attributeMatch[1];
    console.log(`   Found GIF: ${gifUrl}`);
    
    // Download the GIF
    const outputPath = path.join(GIFS_DIR, `${exerciseId}.gif`);
    await downloadFile(gifUrl, outputPath);
    
    const stats = fs.statSync(outputPath);
    
    // Check if it's actually a valid GIF (should be > 10KB for exercises)
    if (stats.size < 10240) {
      console.error(`   ⚠️  Warning: GIF is very small (${stats.size} bytes) - might be placeholder`);
      return false;
    }
    
    console.log(`   ✅ Saved: ${exerciseId}.gif (${(stats.size / 1024).toFixed(1)} KB)`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔥 ExRx.net GIF Downloader (via Firecrawl)\n');
  
  const exerciseId = process.argv[2];
  
  if (exerciseId) {
    // Download single exercise
    if (!EXERCISE_MAP[exerciseId]) {
      console.error(`Unknown exercise: ${exerciseId}`);
      console.log('\nAvailable exercises:');
      Object.keys(EXERCISE_MAP).forEach(id => console.log(`  - ${id}`));
      process.exit(1);
    }
    
    await downloadExerciseGif(exerciseId, EXERCISE_MAP[exerciseId]);
  } else {
    // Download all exercises
    let success = 0;
    let failed = 0;
    
    for (const [exerciseId, exrxUrl] of Object.entries(EXERCISE_MAP)) {
      const result = await downloadExerciseGif(exerciseId, exrxUrl);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n📊 Complete: ${success} succeeded, ${failed} failed`);
  }
}

main().catch(console.error);
