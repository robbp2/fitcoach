#!/usr/bin/env node

/**
 * Scrape ALL exercises from ExRx.net and download GIFs
 */

const Firecrawl = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-fc29133b41d442c8a8a7ad4b35dbae35';
const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');
const CATALOG_FILE = path.join(GIFS_DIR, 'exercise-catalog.json');

// Ensure directory exists
if (!fs.existsSync(GIFS_DIR)) {
  fs.mkdirSync(GIFS_DIR, { recursive: true });
}

// Known muscle group exercise list pages
const MUSCLE_GROUPS = [
  { name: 'Neck', url: 'https://exrx.net/Lists/ExList/NeckWt' },
  { name: 'Shoulders', url: 'https://exrx.net/Lists/ExList/ShouldWt' },
  { name: 'Arms', url: 'https://exrx.net/Lists/ExList/ArmWt' },
  { name: 'Forearms', url: 'https://exrx.net/Lists/ExList/ForeArmWt' },
  { name: 'Back', url: 'https://exrx.net/Lists/ExList/BackWt' },
  { name: 'Chest', url: 'https://exrx.net/Lists/ExList/ChestWt' },
  { name: 'Waist', url: 'https://exrx.net/Lists/ExList/WaistWt' },
  { name: 'Hips', url: 'https://exrx.net/Lists/ExList/HipsWt' },
  { name: 'Thighs', url: 'https://exrx.net/Lists/ExList/ThighWt' },
  { name: 'Calves', url: 'https://exrx.net/Lists/ExList/CalfWt' },
];

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

async function scrapeExerciseList(muscleGroup) {
  const app = new Firecrawl({ apiKey: API_KEY });
  
  console.log(`  📋 Scraping: ${muscleGroup.name}`);
  
  try {
    const result = await app.scrape(muscleGroup.url, {
      formats: ['markdown'],
      timeout: 30000,
      waitFor: 2000
    });
    
    if (!result || !result.markdown) {
      console.log(`  ⚠️  Failed to load ${muscleGroup.name}`);
      return [];
    }
    
    // Extract exercise URLs from markdown links
    // Match both full URLs and relative paths
    const linkPattern = /\[([^\]]+)\]\(((?:https:\/\/exrx\.net)?\/WeightExercises\/[^\)]+)\)/g;
    const exercises = [];
    let match;
    
    while ((match = linkPattern.exec(result.markdown)) !== null) {
      const exerciseName = match[1].replace(/\*\*/g, ''); // Remove markdown bold
      const exercisePath = match[2];
      const url = exercisePath.startsWith('http') ? exercisePath : 'https://exrx.net' + exercisePath;
      
      // Skip duplicates
      if (!exercises.find(e => e.url === url)) {
        exercises.push({
          url,
          muscleGroup: muscleGroup.name,
          name: exerciseName,
          id: exercisePath.split('/').pop()
        });
      }
    }
    
    console.log(`  ✓ Found ${exercises.length} exercises`);
    
    return exercises;
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
    return [];
  }
}

async function downloadExerciseGif(exercise) {
  const app = new Firecrawl({ apiKey: API_KEY });
  
  try {
    const result = await app.scrape(exercise.url, {
      formats: ['html'],
      timeout: 35000,
      waitFor: 2000
    });
    
    if (!result || !result.html) {
      return { success: false, exercise, error: 'No HTML' };
    }
    
    // Find GIF URL
    const gifMatch = result.html.match(/<attribute[^>]+name="src"[^>]+value="([^"]+\.gif)"/i);
    
    if (!gifMatch) {
      return { success: false, exercise, error: 'No GIF found' };
    }
    
    const gifUrl = gifMatch[1];
    
    // Create safe filename from exercise ID
    const filename = exercise.id.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() + '.gif';
    const filepath = path.join(GIFS_DIR, filename);
    
    // Skip if already exists
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      return {
        success: true,
        exercise,
        filename,
        size: stats.size,
        gifUrl,
        cached: true
      };
    }
    
    // Download
    await downloadFile(gifUrl, filepath);
    
    const stats = fs.statSync(filepath);
    
    if (stats.size < 10240) {
      fs.unlinkSync(filepath);
      return { success: false, exercise, error: 'File too small' };
    }
    
    return {
      success: true,
      exercise,
      filename,
      size: stats.size,
      gifUrl,
      cached: false
    };
    
  } catch (error) {
    return { success: false, exercise, error: error.message };
  }
}

async function main() {
  console.log('🔥 ExRx.net Complete Exercise Scraper\n');
  console.log('━'.repeat(60));
  console.log();
  
  console.log(`📚 Scraping ${MUSCLE_GROUPS.length} muscle groups...\n`);
  
  // Step 1: Get all individual exercises from each muscle group
  let allExercises = [];
  
  for (const muscleGroup of MUSCLE_GROUPS) {
    const exercises = await scrapeExerciseList(muscleGroup);
    allExercises = allExercises.concat(exercises);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n✓ Total exercises found: ${allExercises.length}\n`);
  console.log('━'.repeat(60));
  console.log(`\n💾 Downloading GIFs...\n`);
  
  // Step 2: Download all GIFs
  const catalog = [];
  let successCount = 0;
  let failCount = 0;
  let cachedCount = 0;
  
  for (let i = 0; i < allExercises.length; i++) {
    const exercise = allExercises[i];
    
    process.stdout.write(`\r[${i + 1}/${allExercises.length}] ${exercise.name.substring(0, 40).padEnd(40)}...`);
    
    const result = await downloadExerciseGif(exercise);
    
    if (result.success) {
      successCount++;
      if (result.cached) {
        cachedCount++;
      }
      catalog.push({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        url: exercise.url,
        filename: result.filename,
        size: result.size,
        gifUrl: result.gifUrl
      });
      if (result.cached) {
        process.stdout.write(` ✓ cached\n`);
      } else {
        process.stdout.write(` ✓ (${(result.size / 1024).toFixed(1)}KB)\n`);
      }
    } else {
      failCount++;
      process.stdout.write(` ✗ (${result.error})\n`);
    }
    
    // Delay to avoid rate limiting (skip for cached)
    if (!result.cached) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n📊 Results:`);
  console.log(`   ✓ Success: ${successCount} (${cachedCount} cached)`);
  console.log(`   ✗ Failed: ${failCount}`);
  console.log(`   📁 Total: ${allExercises.length}`);
  
  // Save catalog
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
  console.log(`\n💾 Catalog saved: ${CATALOG_FILE}`);
  console.log(`   ${catalog.length} exercises indexed`);
}

main().catch(console.error);
