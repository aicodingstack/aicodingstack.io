import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// GitHub API token (optional but recommended to avoid rate limits)
// Set via environment variable: GITHUB_TOKEN=your_token_here node fetch-github-stars.mjs
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Path to the centralized GitHub stars data file
const GITHUB_STARS_FILE = path.join(__dirname, '..', 'manifests', 'github-stars.json');

// Directories configuration - now pointing to individual file directories
const dirsConfig = [
  {
    directory: 'manifests/extensions',
    category: 'extensions',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  },
  {
    directory: 'manifests/ides',
    category: 'ides',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  },
  {
    directory: 'manifests/clis',
    category: 'clis',
    githubUrlField: 'communityUrls.github',
    type: 'nested'
  }
];

// Extract owner and repo from GitHub URL
function parseGithubUrl(url) {
  if (!url) return null;
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2]
  };
}

// Fetch stars from GitHub API
function fetchStars(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'acs-stars-fetcher',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const stars = json.stargazers_count;
            // Convert to k format (1 decimal place)
            const starsInK = parseFloat((stars / 1000).toFixed(1));
            resolve(starsInK);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else if (res.statusCode === 403) {
          reject(new Error('Rate limit exceeded. Please set GITHUB_TOKEN environment variable.'));
        } else if (res.statusCode === 404) {
          reject(new Error('Repository not found'));
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// Get GitHub URL from item based on type
function getGithubUrl(item, type) {
  if (type === 'direct') {
    return item.githubUrl;
  } else {
    return item.communityUrls?.github;
  }
}

// Sleep function to avoid rate limiting
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process a single JSON file
async function processFile(filePath, fileName, type, starsData) {
  const content = fs.readFileSync(filePath, 'utf8');
  const item = JSON.parse(content);

  const githubUrl = getGithubUrl(item, type);

  if (!githubUrl) {
    console.log(`  ⏭️  Skipping ${item.name || item.id} (no GitHub URL)`);
    return { updated: false, skipped: true, error: false, id: item.id, stars: null };
  }

  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    console.log(`  ❌ Failed to parse GitHub URL for ${item.name || item.id}: ${githubUrl}`);
    return { updated: false, skipped: false, error: true, id: item.id, stars: null };
  }

  try {
    console.log(`  🔍 Fetching stars for ${item.name || item.id} (${parsed.owner}/${parsed.repo})...`);
    const stars = await fetchStars(parsed.owner, parsed.repo);
    console.log(`  ✅ Updated ${item.name || item.id}: ${stars}k stars`);

    // Sleep for 1 second to avoid rate limiting
    await sleep(1000);
    return { updated: true, skipped: false, error: false, id: item.id, stars };
  } catch (error) {
    console.log(`  ❌ Error fetching ${item.name || item.id}: ${error.message}`);
    return { updated: false, skipped: false, error: true, id: item.id, stars: null };
  }
}

// Process all files in a directory
async function processDirectory(dirConfig, starsData) {
  const dirPath = path.join(__dirname, '..', dirConfig.directory);
  console.log(`\n📁 Processing ${dirConfig.directory}...`);

  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Directory not found: ${dirPath}`);
    return { categoryData: {}, stats: { updated: 0, skipped: 0, errors: 0 } };
  }

  // Get all JSON files in the directory
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log(`  ⚠️  No JSON files found in ${dirConfig.directory}`);
    return { categoryData: {}, stats: { updated: 0, skipped: 0, errors: 0 } };
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const categoryData = {};

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const result = await processFile(filePath, file, dirConfig.type, starsData);

    if (result.updated) updated++;
    if (result.skipped) skipped++;
    if (result.error) errors++;

    // Store the stars data for this item
    if (result.id) {
      categoryData[result.id] = result.stars;
    }
  }

  console.log(`\n✨ ${dirConfig.directory} completed: ${updated} updated, ${skipped} skipped, ${errors} errors`);
  return { categoryData, stats: { updated, skipped, errors } };
}

// Main function
async function main() {
  console.log('🚀 Starting GitHub stars fetcher...\n');
  console.log('📝 Note: Updating centralized github-stars.json file\n');

  if (!GITHUB_TOKEN) {
    console.log('⚠️  Warning: No GITHUB_TOKEN set. You may hit rate limits (60 requests/hour).');
    console.log('   Set it with: GITHUB_TOKEN=your_token node fetch-github-stars.mjs\n');
  } else {
    console.log('✅ Using GitHub token for authentication\n');
  }

  // Load existing stars data or create new structure
  let starsData = { extensions: {}, clis: {}, ides: {} };
  if (fs.existsSync(GITHUB_STARS_FILE)) {
    try {
      const content = fs.readFileSync(GITHUB_STARS_FILE, 'utf8');
      starsData = JSON.parse(content);
      console.log('📂 Loaded existing github-stars.json\n');
    } catch (error) {
      console.log('⚠️  Failed to parse existing github-stars.json, creating new one\n');
    }
  }

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Process each directory and collect stars data
  for (const dirConfig of dirsConfig) {
    try {
      const { categoryData, stats } = await processDirectory(dirConfig, starsData);

      // Sort the category data by key (alphabetically)
      const sortedCategoryData = Object.keys(categoryData)
        .sort()
        .reduce((acc, key) => {
          acc[key] = categoryData[key];
          return acc;
        }, {});

      // Update the stars data for this category
      starsData[dirConfig.category] = sortedCategoryData;

      totalUpdated += stats.updated;
      totalSkipped += stats.skipped;
      totalErrors += stats.errors;
    } catch (error) {
      console.error(`❌ Failed to process ${dirConfig.directory}:`, error.message);
      totalErrors++;
    }
  }

  // Write the updated stars data to file
  try {
    fs.writeFileSync(GITHUB_STARS_FILE, JSON.stringify(starsData, null, 2) + '\n', 'utf8');
    console.log('\n📝 Successfully updated manifests/github-stars.json');
  } catch (error) {
    console.error('\n❌ Failed to write github-stars.json:', error.message);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 All directories processed!');
  console.log(`📊 Total: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`);
  console.log('='.repeat(50));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
