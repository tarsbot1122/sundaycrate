import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env
const envFile = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
for (const line of envFile.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0 && !line.startsWith('#')) {
    process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Product definitions
const PRODUCTS = [
  {
    file: '01-cbt-thought-record.pdf',
    title: 'CBT Thought Record Worksheet',
    description: 'A comprehensive 2-page thought monitoring worksheet based on classic CBT methodology. Features structured columns for identifying situations, automatic thoughts, emotions, evidence analysis, and balanced thinking. Perfect for homework assignments and in-session use.',
    price_cents: 499,
    category: 'cbt-worksheets',
  },
  {
    file: '02-cognitive-distortions-guide.pdf',
    title: 'Cognitive Distortions Identification Guide',
    description: 'A detailed 3-page reference guide covering all 15 cognitive distortions with clear definitions, relatable examples, and a self-assessment checklist. Ideal as a psychoeducation handout or client reference tool for identifying unhelpful thinking patterns.',
    price_cents: 599,
    category: 'cbt-worksheets',
  },
  {
    file: '03-behavioral-activation-planner.pdf',
    title: 'Behavioral Activation Weekly Planner',
    description: 'A structured 2-page weekly activity planner with integrated mood tracking, pleasure ratings, and mastery scores. Includes weekend planning and a reflection section. Essential for treating depression and building positive behavioral patterns.',
    price_cents: 399,
    category: 'cbt-worksheets',
  },
  {
    file: '04-dbt-distress-tolerance.pdf',
    title: 'DBT Distress Tolerance Toolkit',
    description: 'A thorough 4-page toolkit covering the core DBT crisis survival skills: TIPP, ACCEPTS, IMPROVE the Moment, and Pros & Cons analysis. Each skill includes clinical explanations, practice exercises, and space for personalized crisis planning. A must-have for any DBT-informed practice.',
    price_cents: 799,
    category: 'dbt-worksheets',
  },
  {
    file: '05-emotion-regulation-pack.pdf',
    title: 'Emotion Regulation Worksheet Pack',
    description: 'A 3-page DBT emotion regulation pack featuring an emotion identification worksheet, the ABC PLEASE daily checklist, and a complete opposite action guide with a reference table for common emotions. Helps clients build emotional awareness and reduce vulnerability.',
    price_cents: 699,
    category: 'dbt-worksheets',
  },
  {
    file: '06-client-intake-form.pdf',
    title: 'Comprehensive Client Intake Form',
    description: 'A professional 3-page intake form covering demographics, presenting concerns, mental health history, medical history, social background, therapy goals, and informed consent. Includes a symptom checklist and emergency contact section. Ready to use on day one.',
    price_cents: 499,
    category: 'intake-assessment-forms',
  },
  {
    file: '07-treatment-plan-template.pdf',
    title: 'Treatment Plan Template',
    description: 'A structured 2-page treatment plan with space for three goals, measurable objectives, clinical interventions, target dates, and progress tracking. Includes status checkboxes and a progress notes section. Meets documentation standards for insurance and audits.',
    price_cents: 399,
    category: 'intake-assessment-forms',
  },
  {
    file: '08-soap-progress-notes.pdf',
    title: 'Session Progress Notes (SOAP Format)',
    description: 'A clean, efficient 1-page SOAP note template designed for quick session documentation. Includes guided prompts for Subjective, Objective, Assessment, and Plan sections plus risk assessment, CPT code selection, and next appointment scheduling. Saves time every session.',
    price_cents: 299,
    category: 'practice-management',
  },
  {
    file: '09-grounding-54321.pdf',
    title: '5-4-3-2-1 Grounding Technique Worksheet',
    description: 'A beautifully designed single-page grounding exercise that walks clients through the 5-4-3-2-1 sensory awareness technique. Features clear visual hierarchy with numbered circles and writing spaces for each sense. Perfect for anxiety, dissociation, and panic episodes.',
    price_cents: 199,
    category: 'anxiety-stress-management',
  },
  {
    file: '10-anxiety-coping-cards.pdf',
    title: 'Anxiety Coping Skills Card Set (16 Cards)',
    description: 'A set of 16 printable cut-out coping strategy cards across 2 pages. Each card features a specific technique with clear, actionable instructions — from deep breathing and progressive muscle relaxation to thought challenging and bilateral tapping. Clients can carry these in their wallet or journal.',
    price_cents: 499,
    category: 'anxiety-stress-management',
  },
  {
    file: '11-worry-log.pdf',
    title: 'Worry Log & Analysis Worksheet',
    description: 'A 2-page worry tracking system with structured columns for triggers, worry content, likelihood ratings, actual outcomes, and coping strategies. Includes a powerful reflection page that helps clients recognize that most worries never materialize. Evidence-based and practical.',
    price_cents: 399,
    category: 'anxiety-stress-management',
  },
  {
    file: '12-safety-plan.pdf',
    title: 'Safety Plan Template (Stanley & Brown)',
    description: 'A clinical safety plan following the evidence-based Stanley & Brown model. Covers all 6 steps: warning signs, internal coping, social contacts, people to ask for help, professional resources (including 988 Lifeline), and environmental safety. Includes crisis hotline numbers pre-filled.',
    price_cents: 299,
    category: 'trauma-ptsd',
  },
  {
    file: '13-trigger-identification.pdf',
    title: 'Trigger Identification & Response Plan',
    description: 'A 2-page trauma-focused worksheet that helps clients identify their triggers across sensory, situational, emotional, and interpersonal categories. Includes a structured response planning section for developing healthy coping strategies for each identified trigger.',
    price_cents: 399,
    category: 'trauma-ptsd',
  },
  {
    file: '14-session-tracker.pdf',
    title: 'Client Session Tracker',
    description: 'A 2-page tracking sheet for documenting up to 10 therapy sessions. Each entry captures the date, duration, topics covered, homework assigned, next session focus, mood rating, and progress rating. Helps both therapists and clients monitor therapeutic progress over time.',
    price_cents: 499,
    category: 'practice-management',
  },
  {
    file: '15-billing-invoice.pdf',
    title: 'Therapy Billing & Invoice Template',
    description: 'A professional 1-page invoice template with sections for provider credentials, NPI number, client insurance information, CPT code tracking, and payment reconciliation. Includes common CPT code reference and multiple payment method options. Streamlines your billing process.',
    price_cents: 299,
    category: 'practice-management',
  },
];

async function main() {
  console.log('🌱 Seeding SundayCrate products...\n');

  // Step 1: Create official seller account via Auth
  console.log('1. Creating SundayCrate Official account...');
  
  const email = 'official@sundaycrate.com';
  const password = 'SundayCrate2026!Official';

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let authUser = existingUsers?.users?.find(u => u.email === email);

  if (!authUser) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) throw new Error(`Auth create failed: ${authError.message}`);
    authUser = authData.user;
    console.log('   ✅ Auth user created:', authUser.id);
  } else {
    console.log('   ⏭️  Auth user already exists:', authUser.id);
  }

  // Step 2: Create/update users table entry
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: authUser.id,
      email,
      name: 'SundayCrate Official',
      role: 'admin',
      bio: 'The official SundayCrate store. Curated therapy resources by experienced clinicians.',
      practice_name: 'SundayCrate',
    }, { onConflict: 'id' });

  if (userError) throw new Error(`User upsert failed: ${userError.message}`);
  console.log('   ✅ Users table entry created');

  // Step 3: Upload PDFs and insert products
  console.log('\n2. Uploading PDFs and creating products...');

  for (const product of PRODUCTS) {
    const filePath = join(__dirname, 'products', product.file);
    const fileBuffer = readFileSync(filePath);
    const storagePath = `official/${product.file}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('Products')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.log(`   ❌ Upload failed for ${product.file}: ${uploadError.message}`);
      continue;
    }

    // Get public URL (or signed URL for private bucket)
    const { data: urlData } = supabase.storage
      .from('Products')
      .getPublicUrl(storagePath);

    const fileUrl = urlData?.publicUrl || storagePath;

    // Insert product
    const { error: prodError } = await supabase
      .from('products')
      .insert({
        seller_id: authUser.id,
        title: product.title,
        description: product.description,
        price_cents: product.price_cents,
        category: product.category,
        file_url: storagePath,
        file_type: 'pdf',
        status: 'active',
        preview_images: [],
      });

    if (prodError) {
      console.log(`   ❌ Insert failed for ${product.title}: ${prodError.message}`);
      continue;
    }

    console.log(`   ✅ ${product.title} — $${(product.price_cents / 100).toFixed(2)}`);
  }

  // Verify
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  console.log(`\n🎉 Done! ${count} active products in the marketplace.`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
