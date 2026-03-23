import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0 && !line.startsWith('#')) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PRODUCTS = [
  {
    file: '16-couples-communication.pdf',
    title: 'Couples Communication Worksheet',
    description: 'A 2-page structured communication exercise for couples using "I" statements, active listening, and conflict pattern identification. Based on Gottman\'s research on the Four Horsemen. Includes a mutual agreement section for building healthier dialogue habits.',
    price_cents: 499,
    category: 'couples-relationship',
  },
  {
    file: '17-emdr-processing.pdf',
    title: 'EMDR Session Processing Worksheet',
    description: 'A comprehensive 2-page EMDR session record covering all 8 phases — from Assessment through Re-evaluation. Includes a BLS tracking table for desensitization sets, VOC/SUD scoring, body scan documentation, and between-session client instructions. Essential for organized EMDR practice.',
    price_cents: 599,
    category: 'emdr-resources',
  },
  {
    file: '18-art-therapy-prompts.pdf',
    title: 'Art Therapy Guided Prompts (12 Activities)',
    description: '12 expressive art therapy activities across 2 pages, each with clear client instructions and therapist processing questions. Includes Draw Your Safe Place, Emotion Color Wheel, Inside/Outside Mask, Tree of Life, Anxiety Monster, and more. No artistic skill required — designed for therapeutic expression.',
    price_cents: 599,
    category: 'art-therapy',
  },
  {
    file: '19-ifs-parts-mapping.pdf',
    title: 'IFS Parts Mapping Worksheet',
    description: 'A 2-page Internal Family Systems worksheet for identifying and mapping parts. Includes structured fields for 3 parts (name, feelings, beliefs, body location, protective role), a visual parts map drawing space, and a Self-energy check-in using the 8 C\'s. Perfect for introducing clients to IFS concepts.',
    price_cents: 599,
    category: 'ifs-internal-family-systems',
  },
  {
    file: '20-somatic-body-awareness.pdf',
    title: 'Somatic Body Awareness & Regulation Worksheet',
    description: 'A 2-page somatic therapy resource featuring a full body scan with tension ratings, Window of Tolerance assessment (hyper/hypoarousal zones), and 6 guided regulation exercises including Orienting, Butterfly Hug, Vagal Toning, and Pendulation. Builds interoceptive awareness and nervous system regulation skills.',
    price_cents: 499,
    category: 'somatic-therapy',
  },
  {
    file: '21-coping-skills-poster.pdf',
    title: '50 Coping Skills Poster',
    description: 'A colorful, print-ready poster featuring 50 healthy coping strategies organized across 10 categories: Physical, Sensory, Creative, Mindfulness, Social, Cognitive, Self-Care, Nature, and Expression. Perfect for therapy office walls, waiting rooms, school counselor offices, or client handouts.',
    price_cents: 399,
    category: 'therapy-posters-office-decor',
  },
];

async function main() {
  console.log('🌱 Seeding 6 missing-category products...\n');

  // Get official seller ID
  const { data: seller } = await supabase.from('users').select('id').eq('email', 'official@sundaycrate.com').single();
  if (!seller) throw new Error('Official seller not found');
  console.log('Seller ID:', seller.id);

  for (const product of PRODUCTS) {
    const filePath = join(__dirname, 'products', product.file);
    const fileBuffer = readFileSync(filePath);
    const storagePath = `official/${product.file}`;

    const { error: uploadError } = await supabase.storage.from('Products').upload(storagePath, fileBuffer, {
      contentType: 'application/pdf', upsert: true,
    });
    if (uploadError) { console.log(`❌ Upload: ${product.file}: ${uploadError.message}`); continue; }

    const { error: prodError } = await supabase.from('products').insert({
      seller_id: seller.id,
      title: product.title,
      description: product.description,
      price_cents: product.price_cents,
      category: product.category,
      file_url: storagePath,
      file_type: 'pdf',
      status: 'active',
      preview_images: [],
    });
    if (prodError) { console.log(`❌ Insert: ${product.title}: ${prodError.message}`); continue; }
    console.log(`✅ ${product.title} — $${(product.price_cents / 100).toFixed(2)}`);
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active');
  console.log(`\n🎉 Total active products: ${count}`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
