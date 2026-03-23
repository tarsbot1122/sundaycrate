import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0 && !line.startsWith('#')) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PRODUCTS_DIR = join(__dirname, 'products');
const PREVIEW_DIR = join(__dirname, 'previews');

async function main() {
  console.log('🖼️  Generating preview images from PDFs...\n');

  // Create preview dir
  execSync(`mkdir -p ${PREVIEW_DIR}`);

  const pdfs = readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.pdf')).sort();

  for (const pdf of pdfs) {
    const pdfPath = join(PRODUCTS_DIR, pdf);
    const previewName = pdf.replace('.pdf', '.png');
    const previewPath = join(PREVIEW_DIR, previewName);

    try {
      // qlmanage generates thumbnail — output goes to specified dir
      execSync(`qlmanage -t -s 800 -o "${PREVIEW_DIR}" "${pdfPath}" 2>/dev/null`);
      
      // qlmanage appends .png to the full filename
      const qlOutput = join(PREVIEW_DIR, pdf + '.png');
      if (existsSync(qlOutput)) {
        execSync(`mv "${qlOutput}" "${previewPath}"`);
      }

      if (!existsSync(previewPath)) {
        console.log(`⚠️  No preview generated for ${pdf}, trying sips...`);
        continue;
      }

      // Upload to Preview bucket
      const imgBuffer = readFileSync(previewPath);
      const storagePath = `official/${previewName}`;

      const { error: uploadError } = await supabase.storage.from('Preview').upload(storagePath, imgBuffer, {
        contentType: 'image/png', upsert: true,
      });

      if (uploadError) {
        console.log(`❌ Upload failed: ${previewName}: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('Preview').getPublicUrl(storagePath);
      const publicUrl = urlData?.publicUrl;

      // Update product record — match by file_url
      const fileUrl = `official/${pdf}`;
      const { error: updateError } = await supabase
        .from('products')
        .update({ preview_images: [publicUrl] })
        .eq('file_url', fileUrl);

      if (updateError) {
        console.log(`❌ DB update failed for ${pdf}: ${updateError.message}`);
        continue;
      }

      console.log(`✅ ${pdf} → ${previewName}`);
    } catch (err) {
      console.log(`❌ Error processing ${pdf}: ${err.message}`);
    }
  }

  // Verify
  const { data: products } = await supabase
    .from('products')
    .select('title, preview_images')
    .eq('status', 'active');

  const withPreviews = products?.filter(p => p.preview_images?.length > 0).length || 0;
  console.log(`\n🎉 ${withPreviews}/${products?.length} products have preview images.`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
