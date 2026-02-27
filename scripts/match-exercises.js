#!/usr/bin/env node

/**
 * Match app exercises to downloaded ExRx GIFs and identify missing ones
 */

const fs = require('fs');
const path = require('path');

const GIFS_DIR = path.join(__dirname, '../public/exercise-gifs');
const exercises = require('../app/lib/exercises.ts').exercises;

// Get all downloaded GIF filenames (without extension)
const downloadedGifs = fs.readdirSync(GIFS_DIR)
  .filter(f => f.endsWith('.gif'))
  .map(f => f.replace('.gif', ''));

console.log(`📊 App exercises: ${exercises.length}`);
console.log(`📦 Downloaded GIFs: ${downloadedGifs.length}\n`);

// Helper: normalize string for fuzzy matching
function normalize(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/dumbbell/g, 'db')
    .replace(/barbell/g, 'bb')
    .replace(/cable/g, 'cb')
    .replace(/bodyweight/g, 'bw')
    .replace(/machine/g, 'mach');
}

// Try to match each app exercise
const matches = [];
const missing = [];

for (const exercise of exercises) {
  const exerciseNorm = normalize(exercise.id);
  
  // Try exact match first
  let match = downloadedGifs.find(gif => gif === exercise.id);
  
  // Try fuzzy match
  if (!match) {
    match = downloadedGifs.find(gif => {
      const gifNorm = normalize(gif);
      return gifNorm === exerciseNorm || 
             gifNorm.includes(exerciseNorm) || 
             exerciseNorm.includes(gifNorm);
    });
  }
  
  if (match) {
    matches.push({
      appId: exercise.id,
      appName: exercise.name,
      gifFile: match + '.gif'
    });
  } else {
    missing.push({
      id: exercise.id,
      name: exercise.name
    });
  }
}

console.log(`✅ Matched: ${matches.length}`);
console.log(`❌ Missing: ${missing.length}\n`);

if (missing.length > 0) {
  console.log('🔍 Missing exercises:\n');
  missing.forEach((ex, i) => {
    console.log(`${i + 1}. ${ex.id}`);
    console.log(`   ${ex.name}\n`);
  });
}

// Save mapping
const mappingFile = path.join(GIFS_DIR, 'exercise-mapping.json');
fs.writeFileSync(mappingFile, JSON.stringify({
  matched: matches,
  missing: missing,
  stats: {
    total: exercises.length,
    matched: matches.length,
    missing: missing.length
  }
}, null, 2));

console.log(`💾 Saved mapping: ${mappingFile}`);
