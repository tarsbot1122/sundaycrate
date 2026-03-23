import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'products');
mkdirSync(OUT, { recursive: true });

const NAVY = rgb(0.12, 0.15, 0.24);
const GOLD = rgb(0.83, 0.66, 0.33);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);
const W = 612, H = 792, MARGIN = 50, CONTENT_W = W - MARGIN * 2;

async function createDoc(pageCount = 1) {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const pages = [];
  for (let i = 0; i < pageCount; i++) pages.push(doc.addPage([W, H]));
  return { doc, pages, helvetica, helveticaBold, helveticaOblique };
}

function addFooter(page, font) {
  page.drawText('© Shrinkwrap.com — Therapy Resources Marketplace', { x: MARGIN, y: 25, size: 7, font, color: LIGHT_GRAY });
}

function drawHeader(page, title, subtitle, boldFont, regFont) {
  page.drawRectangle({ x: MARGIN, y: H - 70, width: CONTENT_W, height: 3, color: GOLD });
  page.drawText(title, { x: MARGIN, y: H - 60, size: 18, font: boldFont, color: NAVY });
  if (subtitle) page.drawText(subtitle, { x: MARGIN, y: H - 78, size: 9, font: regFont, color: GRAY });
  return H - 100;
}

function drawWriteLine(page, y, width = CONTENT_W) {
  page.drawRectangle({ x: MARGIN, y, width, height: 0.5, color: rgb(0.7, 0.7, 0.7) });
}

function drawCheckbox(page, x, y, size = 10) {
  page.drawRectangle({ x, y, width: size, height: size, borderColor: GRAY, borderWidth: 0.8, color: WHITE });
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(' ');
  const lines = []; let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) { if (current) lines.push(current); current = word; }
    else current = test;
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(page, text, x, y, font, size, color, maxWidth) {
  const lines = wrapText(text, font, size, maxWidth);
  let cy = y;
  for (const line of lines) { page.drawText(line, { x, y: cy, size, font, color }); cy -= size + 3; }
  return cy;
}

// ============================================================
// 16. Couples Communication Worksheet (couples-relationship)
// ============================================================
async function createCouplesComm() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'Couples Communication Worksheet', 'Building Healthy Dialogue Patterns', helveticaBold, helvetica);
  y = drawWrappedText(p1, 'Use this worksheet together as a couple or individually to prepare for a conversation about a difficult topic. The goal is to express needs without blame and listen without defensiveness.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  p1.drawText('Partner A Name: ____________________    Partner B Name: ____________________    Date: __________', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });
  y -= 25;

  p1.drawText('STEP 1: Identify the Issue', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD });
  y -= 18;
  p1.drawText('Describe the situation factually (no judgments or labels):', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; for (let i = 0; i < 3; i++) { drawWriteLine(p1, y); y -= 16; }

  y -= 5;
  p1.drawText('STEP 2: Express Feelings Using "I" Statements', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD });
  y -= 18;
  p1.drawText('Formula: "When [situation], I feel [emotion], because [reason]. I need [request]."', { x: MARGIN, y, size: 9, font: helveticaOblique, color: GRAY });
  y -= 18;

  for (const partner of ['Partner A', 'Partner B']) {
    p1.drawText(`${partner}:`, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 14;
    p1.drawText('When:', { x: MARGIN + 10, y, size: 8, font: helvetica, color: GRAY }); drawWriteLine(p1, y - 2, CONTENT_W - 10); y -= 16;
    p1.drawText('I feel:', { x: MARGIN + 10, y, size: 8, font: helvetica, color: GRAY }); drawWriteLine(p1, y - 2, CONTENT_W - 10); y -= 16;
    p1.drawText('Because:', { x: MARGIN + 10, y, size: 8, font: helvetica, color: GRAY }); drawWriteLine(p1, y - 2, CONTENT_W - 10); y -= 16;
    p1.drawText('I need:', { x: MARGIN + 10, y, size: 8, font: helvetica, color: GRAY }); drawWriteLine(p1, y - 2, CONTENT_W - 10); y -= 22;
  }

  p1.drawText('STEP 3: Active Listening Check', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD });
  y -= 18;
  p1.drawText('After your partner shares, reflect back what you heard:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14;
  p1.drawText('"What I hear you saying is..."', { x: MARGIN + 10, y, size: 8, font: helveticaOblique, color: GRAY });
  y -= 14; drawWriteLine(p1, y); y -= 14; drawWriteLine(p1, y);

  addFooter(p1, helvetica);

  // Page 2 — Conflict Styles + Action Plan
  y = drawHeader(p2, 'Communication Styles & Action Plan', null, helveticaBold, helvetica);

  p2.drawText('STEP 4: Identify Your Communication Patterns', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD });
  y -= 18;
  p2.drawText('Check patterns you recognize in yourself:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 16;

  const patterns = [
    'Stonewalling (shutting down, giving silent treatment)',
    'Criticism (attacking character instead of behavior)',
    'Contempt (sarcasm, eye-rolling, mockery)',
    'Defensiveness (making excuses, counter-attacking)',
    'Flooding (becoming overwhelmed, unable to think clearly)',
    'Pursuer pattern (chasing, demanding response)',
    'Withdrawer pattern (pulling away, avoiding conflict)',
  ];
  for (const p of patterns) {
    drawCheckbox(p2, MARGIN + 5, y - 2, 9);
    p2.drawText(p, { x: MARGIN + 20, y, size: 8.5, font: helvetica, color: BLACK });
    y -= 17;
  }

  y -= 10;
  p2.drawText('STEP 5: Our Agreement', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD });
  y -= 18;

  const agreements = [
    'One thing I will try to do more:',
    'One thing I will try to do less:',
    'Our safe word/signal for taking a break:',
    'We agree to revisit this conversation on (date):',
  ];
  for (const a of agreements) {
    p2.drawText(a, { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 14; drawWriteLine(p2, y); y -= 20;
  }

  y -= 5;
  p2.drawText('Partner A Signature: ________________________    Partner B Signature: ________________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '16-couples-communication.pdf'), await doc.save());
  console.log('✅ 16 - Couples Communication Worksheet');
}

// ============================================================
// 17. EMDR Processing Worksheet (emdr-resources)
// ============================================================
async function createEMDR() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'EMDR Processing Worksheet', 'Eye Movement Desensitization & Reprocessing — Session Record', helveticaBold, helvetica);

  p1.drawText('Client: ____________________________    Date: ____________    Session #: ______', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });
  y -= 20;

  p1.drawText('PHASE 3: ASSESSMENT', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 16;

  const assessFields = [
    ['Target Memory / Image:', 3],
    ['Negative Cognition (NC):', 1],
    ['Positive Cognition (PC):', 1],
    ['VOC (Validity of PC, 1-7):', 0],
    ['Emotions:', 1],
    ['SUD Level (0-10):', 0],
    ['Body Location of Disturbance:', 1],
  ];
  for (const [label, lines] of assessFields) {
    p1.drawText(label, { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    if (lines === 0) { drawWriteLine(p1, y - 2, 200); y -= 18; }
    else { y -= 14; for (let i = 0; i < lines; i++) { drawWriteLine(p1, y); y -= 14; } y -= 4; }
  }

  y -= 8;
  p1.drawText('PHASE 4: DESENSITIZATION — Set Tracking', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 14;

  // Tracking table
  const cols = ['Set #', 'BLS Type', 'Duration', 'SUD', 'Client Report (images, thoughts, sensations)'];
  const colW = [35, 55, 50, 35, CONTENT_W - 175];
  p1.drawRectangle({ x: MARGIN, y: y - 14, width: CONTENT_W, height: 14, color: rgb(0.95, 0.95, 0.95) });
  let cx = MARGIN;
  for (let i = 0; i < cols.length; i++) {
    p1.drawText(cols[i], { x: cx + 2, y: y - 11, size: 6.5, font: helveticaBold, color: NAVY });
    cx += colW[i];
  }
  y -= 14;

  for (let r = 0; r < 8; r++) {
    let rx = MARGIN;
    for (let c = 0; c < 5; c++) {
      p1.drawRectangle({ x: rx, y: y - 22, width: colW[c], height: 22, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
      rx += colW[c];
    }
    y -= 22;
  }

  addFooter(p1, helvetica);

  // Page 2 — Installation, Body Scan, Closure
  y = drawHeader(p2, 'EMDR Processing Worksheet (cont.)', null, helveticaBold, helvetica);

  p2.drawText('PHASE 5: INSTALLATION', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 16;
  p2.drawText('Positive Cognition:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY }); drawWriteLine(p2, y - 2, CONTENT_W); y -= 18;
  p2.drawText('VOC (1-7) — Before: ______    After Installation: ______', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 18;
  p2.drawText('Notes:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY }); y -= 14;
  for (let i = 0; i < 2; i++) { drawWriteLine(p2, y); y -= 14; }

  y -= 10;
  p2.drawText('PHASE 6: BODY SCAN', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 16;
  p2.drawText('Residual body sensations:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY }); y -= 14;
  for (let i = 0; i < 2; i++) { drawWriteLine(p2, y); y -= 14; }
  p2.drawText('Clear?  [ ] Yes  [ ] No — If no, additional sets performed: ______', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 22;

  p2.drawText('PHASE 7: CLOSURE', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 16;
  p2.drawText('Final SUD Level (0-10): ______', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 16;
  p2.drawText('Session complete?  [ ] Yes  [ ] Incomplete (requires continuation)', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 18;
  p2.drawText('Containment / Safe Place exercise used?  [ ] Yes  [ ] No', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 18;
  p2.drawText('Client instructions for between sessions:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY }); y -= 14;
  for (let i = 0; i < 3; i++) { drawWriteLine(p2, y); y -= 14; }

  y -= 10;
  p2.drawText('PHASE 8: RE-EVALUATION (Next Session)', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD }); y -= 16;
  p2.drawText('SUD on same target: ______    New material emerged?  [ ] Yes  [ ] No', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK }); y -= 16;
  p2.drawText('Notes:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY }); y -= 14;
  for (let i = 0; i < 3; i++) { drawWriteLine(p2, y); y -= 14; }

  y -= 10;
  p2.drawText('Therapist Signature: ______________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '17-emdr-processing.pdf'), await doc.save());
  console.log('✅ 17 - EMDR Processing Worksheet');
}

// ============================================================
// 18. Art Therapy Guided Prompts (art-therapy)
// ============================================================
async function createArtTherapy() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'Art Therapy Guided Prompts', '12 Expressive Art Activities for Therapeutic Use', helveticaBold, helvetica);
  y = drawWrappedText(p1, 'These prompts can be used in session or assigned as homework. No artistic skill is required — the goal is expression, not perfection. Provide clients with paper, colored pencils, markers, or paint.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  const prompts1 = [
    ['1. Draw Your Safe Place', 'Create an image of a place (real or imaginary) where you feel completely safe and at peace. Include as many sensory details as possible — colors, textures, objects.', 'Processing: What makes this place feel safe? How does your body feel when you imagine being there?'],
    ['2. Inside/Outside Mask', 'Draw two faces: one showing how you present yourself to the world (outside), and one showing how you truly feel inside. Use colors, symbols, or words.', 'Processing: What differences do you notice? What would it feel like to show more of your inside self?'],
    ['3. Emotion Color Wheel', 'Assign a color to each emotion you are feeling today. Fill a circle with those colors, using the amount of space that matches the intensity of each feeling.', 'Processing: Which emotion takes up the most space? Were any emotions surprising to see?'],
    ['4. Body Map', 'Draw an outline of a body. Color in where you feel different emotions or sensations. Use a legend to show what each color represents.', 'Processing: Where does stress live in your body? Where do you feel calm or joy?'],
    ['5. Before & After', 'On the left, draw how you felt when you started therapy. On the right, draw how you feel now (or how you hope to feel).', 'Processing: What has changed? What growth do you notice?'],
    ['6. The Bridge Drawing', 'Draw a bridge. On one side, place where you are now. On the other side, where you want to be. What is on or under the bridge?', 'Processing: What obstacles are on the bridge? What resources are helping you cross?'],
  ];

  for (const [title, instruction, processing] of prompts1) {
    p1.drawText(title, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY }); y -= 13;
    y = drawWrappedText(p1, instruction, MARGIN + 10, y, helvetica, 8, BLACK, CONTENT_W - 15); y -= 3;
    y = drawWrappedText(p1, processing, MARGIN + 10, y, helveticaOblique, 7.5, GRAY, CONTENT_W - 15); y -= 12;
  }

  addFooter(p1, helvetica);

  // Page 2
  y = drawHeader(p2, 'Art Therapy Guided Prompts (cont.)', null, helveticaBold, helvetica);

  const prompts2 = [
    ['7. Anxiety Monster', 'Draw what your anxiety would look like if it were a creature. Give it a name. How big is it? What does it sound like?', 'Processing: Now that you can see it, does it feel less powerful? What would you say to it?'],
    ['8. Gratitude Collage', 'Create a collage (drawn or cut from magazines) of things you are grateful for. Fill the entire page.', 'Processing: How did it feel to focus on positives? Which item surprised you the most?'],
    ['9. Family Sculpture Drawing', 'Draw your family members as shapes or objects that represent their personality or your relationship with them. Arrange them to show closeness or distance.', 'Processing: What do the shapes and distances tell you? Would you change any positioning?'],
    ['10. Tree of Life', 'Draw a tree. Roots = your background/heritage. Trunk = your strengths. Branches = your hopes and dreams. Leaves = important people. Fruits = your gifts/achievements.', 'Processing: Which part was easiest to fill? Which was hardest? What does that tell you?'],
    ['11. Rain Drawing', 'Draw a person in the rain. Include whatever details feel right — umbrella, puddles, lightning, sun breaking through, shelter nearby.', 'Processing: How is the person coping with the rain? What resources (umbrella, shelter) did you include?'],
    ['12. Mandala Creation', 'Starting from the center of a circle, create a mandala using repeating patterns, shapes, and colors. Work outward. Let the design emerge naturally.', 'Processing: How did the repetitive process feel? What themes emerged in your pattern choices?'],
  ];

  for (const [title, instruction, processing] of prompts2) {
    p2.drawText(title, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY }); y -= 13;
    y = drawWrappedText(p2, instruction, MARGIN + 10, y, helvetica, 8, BLACK, CONTENT_W - 15); y -= 3;
    y = drawWrappedText(p2, processing, MARGIN + 10, y, helveticaOblique, 7.5, GRAY, CONTENT_W - 15); y -= 12;
  }

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '18-art-therapy-prompts.pdf'), await doc.save());
  console.log('✅ 18 - Art Therapy Guided Prompts');
}

// ============================================================
// 19. IFS Parts Mapping Worksheet (ifs-internal-family-systems)
// ============================================================
async function createIFS() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'IFS Parts Mapping Worksheet', 'Internal Family Systems — Getting to Know Your Parts', helveticaBold, helvetica);
  y = drawWrappedText(p1, 'In IFS, we all have internal "parts" — subpersonalities that carry different feelings, beliefs, and roles. This worksheet helps you identify and build a compassionate relationship with your parts. Remember: all parts have good intentions, even when their strategies cause problems.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  p1.drawText('PART IDENTIFICATION', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD }); y -= 18;

  for (let i = 1; i <= 3; i++) {
    p1.drawText(`Part ${i}`, { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
    y -= 16;
    const fields = [
      'Name or description of this part:',
      'What does this part feel? (emotions)',
      'What does this part say? (beliefs/messages)',
      'Where do you feel this part in your body?',
      'What is this part trying to protect you from?',
      'Role:  [ ] Manager  [ ] Firefighter  [ ] Exile',
    ];
    for (const f of fields) {
      p1.drawText(f, { x: MARGIN + 10, y, size: 8, font: helvetica, color: BLACK });
      if (!f.startsWith('Role')) { drawWriteLine(p1, y - 2, CONTENT_W - 20); }
      y -= 16;
    }
    y -= 8;
  }

  addFooter(p1, helvetica);

  // Page 2 — Parts Map + Self-energy
  y = drawHeader(p2, 'Parts Map & Self-Energy', null, helveticaBold, helvetica);

  p2.drawText('YOUR PARTS MAP', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD }); y -= 14;
  y = drawWrappedText(p2, 'In the space below, draw a visual map of your parts. Place "Self" in the center. Arrange parts around it — closer parts are more active, further parts are more hidden. Draw lines to show relationships between parts.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 8;

  // Drawing space
  p2.drawRectangle({ x: MARGIN, y: y - 200, width: CONTENT_W, height: 200, borderColor: LIGHT_GRAY, borderWidth: 1, color: WHITE });
  p2.drawText('Self', { x: W / 2 - 12, y: y - 105, size: 10, font: helveticaBold, color: GOLD });
  p2.drawCircle({ x: W / 2, y: y - 100, size: 25, borderColor: GOLD, borderWidth: 1, color: WHITE });
  y -= 215;

  p2.drawText('SELF-ENERGY CHECK-IN', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD }); y -= 16;
  y = drawWrappedText(p2, 'The 8 C\'s of Self-energy. Rate your access to each quality right now (1-10):', MARGIN, y, helvetica, 9, NAVY, CONTENT_W);
  y -= 14;

  const cs = ['Curiosity', 'Calm', 'Confidence', 'Compassion', 'Courage', 'Creativity', 'Clarity', 'Connectedness'];
  for (let i = 0; i < cs.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = MARGIN + col * (CONTENT_W / 2);
    const cy = y - row * 18;
    p2.drawText(`${cs[i]}: ______`, { x: cx + 10, y: cy, size: 9, font: helvetica, color: BLACK });
  }
  y -= Math.ceil(cs.length / 2) * 18 + 15;

  p2.drawText('Reflection: What part(s) would you like to get to know better?', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; drawWriteLine(p2, y); y -= 14; drawWriteLine(p2, y); y -= 14; drawWriteLine(p2, y);

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '19-ifs-parts-mapping.pdf'), await doc.save());
  console.log('✅ 19 - IFS Parts Mapping');
}

// ============================================================
// 20. Somatic Therapy Body Awareness Worksheet (somatic-therapy)
// ============================================================
async function createSomatic() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'Body Awareness & Somatic Check-In', 'Somatic Therapy — Connecting Mind and Body', helveticaBold, helvetica);
  y = drawWrappedText(p1, 'Our bodies store emotions and experiences. This worksheet helps you develop interoceptive awareness — the ability to notice and interpret your body\'s internal signals. Complete this slowly, pausing to actually feel each area.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  p1.drawText('Date: ____________    Before/After:  [ ] Before session  [ ] After session  [ ] Homework', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });
  y -= 20;

  p1.drawText('BODY SCAN', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD }); y -= 16;
  p1.drawText('Rate tension/activation in each area (0 = totally relaxed, 10 = maximum tension):', { x: MARGIN, y, size: 9, font: helvetica, color: NAVY });
  y -= 18;

  const bodyAreas = [
    ['Head / Forehead', 'Jaw / Mouth'],
    ['Neck', 'Shoulders'],
    ['Chest', 'Upper Back'],
    ['Stomach / Gut', 'Lower Back'],
    ['Hips / Pelvis', 'Arms / Hands'],
    ['Legs', 'Feet'],
  ];

  for (const [left, right] of bodyAreas) {
    p1.drawText(`${left}: ______`, { x: MARGIN + 10, y, size: 9, font: helvetica, color: BLACK });
    p1.drawText(`${right}: ______`, { x: MARGIN + CONTENT_W / 2, y, size: 9, font: helvetica, color: BLACK });
    y -= 18;
  }

  y -= 10;
  p1.drawText('WINDOW OF TOLERANCE', { x: MARGIN, y, size: 12, font: helveticaBold, color: GOLD }); y -= 16;
  y = drawWrappedText(p1, 'Where are you right now on the nervous system scale?', MARGIN, y, helvetica, 9, NAVY, CONTENT_W);
  y -= 14;

  const zones = [
    ['HYPERAROUSAL (fight/flight)', 'Anxious, racing heart, restless, hypervigilant, can\'t sit still'],
    ['WINDOW OF TOLERANCE', 'Calm, present, able to think clearly, grounded, regulated'],
    ['HYPOAROUSAL (freeze/collapse)', 'Numb, foggy, exhausted, disconnected, shut down, no energy'],
  ];

  for (let i = 0; i < zones.length; i++) {
    const bgColor = i === 1 ? rgb(0.94, 0.97, 0.94) : rgb(0.97, 0.94, 0.94);
    p1.drawRectangle({ x: MARGIN, y: y - 30, width: CONTENT_W, height: 30, color: bgColor, borderColor: LIGHT_GRAY, borderWidth: 0.5 });
    p1.drawText(`[ ] ${zones[i][0]}`, { x: MARGIN + 8, y: y - 12, size: 9, font: helveticaBold, color: NAVY });
    p1.drawText(zones[i][1], { x: MARGIN + 8, y: y - 25, size: 7.5, font: helveticaOblique, color: GRAY });
    y -= 33;
  }

  addFooter(p1, helvetica);

  // Page 2 — Grounding + Regulation
  y = drawHeader(p2, 'Somatic Regulation Exercises', 'Techniques for Returning to Your Window of Tolerance', helveticaBold, helvetica);

  const exercises = [
    ['Orienting', 'Slowly turn your head and look around the room. Name 5 objects you see. Let your eyes rest on anything that feels calming. Notice how your neck and shoulders feel as you move.'],
    ['Grounding Through Feet', 'Press your feet firmly into the floor. Notice the pressure, temperature, and texture. Slowly shift weight from heel to toe. Feel the support of the ground beneath you.'],
    ['Containment', 'Imagine placing your distress in a container (box, safe, jar). Visualize closing it securely. You can come back to it when you\'re ready. It\'s contained, not gone.'],
    ['Butterfly Hug', 'Cross arms over your chest, hands on opposite shoulders. Alternate tapping left and right. Tap slowly for calm, faster for activation. Continue for 1-2 minutes.'],
    ['Vagal Toning', 'Take a deep breath in. On the exhale, hum or make a "voo" sound. Feel the vibration in your chest. Repeat 5-10 times. This stimulates the vagus nerve.'],
    ['Pendulation', 'Notice an area of tension/discomfort in your body. Now find an area that feels neutral or pleasant. Slowly move your attention back and forth between them.'],
  ];

  for (const [title, desc] of exercises) {
    p2.drawText(title, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY }); y -= 13;
    y = drawWrappedText(p2, desc, MARGIN + 10, y, helvetica, 8.5, BLACK, CONTENT_W - 15); y -= 5;
    p2.drawText('After practicing — how does your body feel?', { x: MARGIN + 10, y, size: 7.5, font: helveticaOblique, color: GRAY });
    drawWriteLine(p2, y - 2, CONTENT_W - 20); y -= 18;
  }

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '20-somatic-body-awareness.pdf'), await doc.save());
  console.log('✅ 20 - Somatic Body Awareness');
}

// ============================================================
// 21. Coping Skills Poster (therapy-posters-office-decor)
// ============================================================
async function createCopingPoster() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(1);
  const p = pages[0];

  // Landscape-style content on portrait page — poster feel
  let y = H - 55;
  p.drawRectangle({ x: 0, y: H - 80, width: W, height: 80, color: NAVY });
  p.drawText('50 COPING SKILLS', { x: W / 2 - 100, y: H - 50, size: 24, font: helveticaBold, color: WHITE });
  p.drawText('When you need a healthy way to cope — pick one and try it', { x: W / 2 - 170, y: H - 68, size: 10, font: helvetica, color: GOLD });

  y = H - 100;

  const skills = [
    // Physical
    'Take a walk', 'Dance to music', 'Do 10 pushups', 'Stretch for 5 min', 'Take a cold shower',
    'Go for a run', 'Practice yoga', 'Squeeze a stress ball', 'Jump rope', 'Ride a bike',
    // Sensory
    'Smell lavender', 'Hold ice cubes', 'Light a candle', 'Drink warm tea', 'Wrap up in a blanket',
    // Creative
    'Draw or paint', 'Write in a journal', 'Play an instrument', 'Sing a song', 'Build something',
    // Mindfulness
    'Deep breathing x10', 'Body scan', '5-4-3-2-1 grounding', 'Meditate 5 min', 'Mindful eating',
    // Social
    'Call a friend', 'Hug someone', 'Write a kind note', 'Help a neighbor', 'Join a group activity',
    // Cognitive
    'Read a book', 'Do a puzzle', 'Learn something new', 'List 5 gratitudes', 'Challenge a thought',
    // Self-care
    'Take a warm bath', 'Cook a meal', 'Clean one room', 'Organize a drawer', 'Plan something fun',
    // Nature
    'Go outside', 'Watch the clouds', 'Garden or plant', 'Listen to birds', 'Sit in sunlight',
    // Expression
    'Cry if you need to', 'Scream into a pillow', 'Rip up paper', 'Talk to yourself kindly', 'Write a letter (don\'t send)',
  ];

  const cols = 5;
  const rows = 10;
  const cellW = (W - 40) / cols;
  const cellH = 58;

  const colors = [
    rgb(0.92, 0.95, 1),    // light blue
    rgb(0.95, 0.92, 1),    // light purple
    rgb(0.92, 1, 0.95),    // light green
    rgb(1, 0.97, 0.92),    // light orange
    rgb(1, 0.92, 0.95),    // light pink
  ];

  for (let i = 0; i < skills.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = 20 + col * cellW;
    const cy = y - row * cellH;

    const bgColor = colors[col % colors.length];
    p.drawRectangle({ x: cx + 1, y: cy - cellH + 1, width: cellW - 2, height: cellH - 2, color: bgColor, borderColor: WHITE, borderWidth: 1 });

    // Number
    p.drawText(`${i + 1}`, { x: cx + 5, y: cy - 14, size: 8, font: helveticaBold, color: GOLD });

    // Skill text — wrap if needed
    const lines = wrapText(skills[i], helvetica, 9, cellW - 16);
    for (let l = 0; l < lines.length; l++) {
      p.drawText(lines[l], { x: cx + 5, y: cy - 26 - l * 11, size: 9, font: helveticaBold, color: NAVY });
    }
  }

  p.drawText('Shrinkwrap.com', { x: W / 2 - 35, y: 15, size: 8, font: helvetica, color: LIGHT_GRAY });

  writeFileSync(join(OUT, '21-coping-skills-poster.pdf'), await doc.save());
  console.log('✅ 21 - 50 Coping Skills Poster');
}

// ============================================================
// RUN ALL
// ============================================================
async function main() {
  console.log('🔨 Generating 6 missing-category PDFs...\n');
  await createCouplesComm();
  await createEMDR();
  await createArtTherapy();
  await createIFS();
  await createSomatic();
  await createCopingPoster();
  console.log('\n🎉 All 6 PDFs generated!');
}

main().catch(console.error);
