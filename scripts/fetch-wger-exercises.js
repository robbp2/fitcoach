#!/usr/bin/env node

/**
 * Fetch exercise images from wger.de API and map to our exercises
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const WGER_API = 'https://wger.de/api/v2';
const IMAGES_DIR = path.join(__dirname, '../public/exercise-images');

// Ensure images directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Download file from URL
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Fetch from wger API
function fetchAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${WGER_API}${endpoint}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Search for exercise by name
async function searchExercise(name) {
  console.log(`Searching for: ${name}`);
  
  // Search through exercises
  let offset = 0;
  const limit = 50;
  
  while (true) {
    const data = await fetchAPI(`/exercise/?limit=${limit}&offset=${offset}`);
    
    for (const ex of data.results) {
      // Get detailed info
      const info = await fetchAPI(`/exerciseinfo/${ex.id}/`);
      
      // Check if any translation matches our search
      for (const trans of info.translations) {
        const exName = trans.name.toLowerCase();
        const searchName = name.toLowerCase();
        
        if (exName.includes(searchName) || searchName.includes(exName)) {
          console.log(`  Found match: ${trans.name} (ID: ${ex.id})`);
          return info;
        }
      }
    }
    
    if (!data.next) break;
    offset += limit;
    
    // Limit search to first 200 exercises for speed
    if (offset >= 200) break;
  }
  
  return null;
}

// Download images for an exercise
async function downloadExerciseImages(exerciseId, exerciseInfo) {
  const exerciseDir = path.join(IMAGES_DIR, exerciseId);
  if (!fs.existsSync(exerciseDir)) {
    fs.mkdirSync(exerciseDir, { recursive: true });
  }
  
  const images = [];
  
  for (let i = 0; i < exerciseInfo.images.length; i++) {
    const img = exerciseInfo.images[i];
    const ext = img.image.split('.').pop();
    const filename = `${i}.${ext}`;
    const filepath = path.join(exerciseDir, filename);
    
    console.log(`  Downloading image ${i + 1}/${exerciseInfo.images.length}...`);
    await downloadFile(img.image, filepath);
    
    images.push({
      path: filename,
      isMain: img.is_main,
      url: img.image
    });
  }
  
  // Save metadata
  const metadata = {
    wgerId: exerciseInfo.id,
    name: exerciseInfo.translations[0].name,
    description: exerciseInfo.translations[0].description,
    muscles: exerciseInfo.muscles.map(m => m.name_en),
    musclesSecondary: exerciseInfo.muscles_secondary.map(m => m.name_en),
    equipment: exerciseInfo.equipment.map(e => e.name),
    images
  };
  
  fs.writeFileSync(
    path.join(exerciseDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  return images;
}

// Main execution
async function main() {
  // Test with bench press first
  const testExercises = [
    { id: 'barbell-bench-press', search: 'bench press barbell' },
    { id: 'squat', search: 'barbell squat' },
    { id: 'deadlift', search: 'barbell deadlift' },
  ];
  
  const exerciseName = process.argv[2];
  const exerciseId = process.argv[3];
  
  if (!exerciseName || !exerciseId) {
    console.error('Usage: node fetch-wger-exercises.js "exercise name" exercise-id');
    process.exit(1);
  }
  
  console.log(`Fetching: ${exerciseName} (${exerciseId})`);
  
  const info = await searchExercise(exerciseName);
  
  if (!info) {
    console.error(`Could not find exercise: ${exerciseName}`);
    process.exit(1);
  }
  
  console.log(`Found: ${info.translations[0].name}`);
  console.log(`Images: ${info.images.length}`);
  
  if (info.images.length === 0) {
    console.error('No images available for this exercise');
    process.exit(1);
  }
  
  await downloadExerciseImages(exerciseId, info);
  
  console.log(`✓ Downloaded ${info.images.length} images to ${exerciseId}/`);
}

main().catch(console.error);
