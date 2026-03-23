import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'products');
mkdirSync(OUT, { recursive: true });

// Colors
const NAVY = rgb(0.12, 0.15, 0.24);
const GOLD = rgb(0.83, 0.66, 0.33);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.85, 0.85, 0.85);
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);

// Page dimensions
const W = 612;
const H = 792;
const MARGIN = 50;
const CONTENT_W = W - MARGIN * 2;

async function createDoc(pageCount = 1) {
  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push(doc.addPage([W, H]));
  }
  return { doc, pages, helvetica, helveticaBold, helveticaOblique };
}

function addFooter(page, font) {
  page.drawText('© SundayCrate.com — Therapy Resources Marketplace', {
    x: MARGIN, y: 25, size: 7, font, color: LIGHT_GRAY,
  });
}

function drawHeader(page, title, subtitle, boldFont, regFont) {
  // Gold accent bar
  page.drawRectangle({ x: MARGIN, y: H - 70, width: CONTENT_W, height: 3, color: GOLD });
  page.drawText(title, { x: MARGIN, y: H - 60, size: 18, font: boldFont, color: NAVY });
  if (subtitle) {
    page.drawText(subtitle, { x: MARGIN, y: H - 78, size: 9, font: regFont, color: GRAY });
  }
  return H - 100;
}

function drawLine(page, y, width = CONTENT_W) {
  page.drawRectangle({ x: MARGIN, y, width, height: 0.5, color: LIGHT_GRAY });
}

function drawWriteLine(page, y, width = CONTENT_W) {
  page.drawRectangle({ x: MARGIN, y, width, height: 0.5, color: rgb(0.7, 0.7, 0.7) });
}

function drawCheckbox(page, x, y, size = 10) {
  page.drawRectangle({ x, y, width: size, height: size, borderColor: GRAY, borderWidth: 0.8, color: WHITE });
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrappedText(page, text, x, y, font, size, color, maxWidth) {
  const lines = wrapText(text, font, size, maxWidth);
  let cy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= size + 3;
  }
  return cy;
}

// ============================================================
// 1. CBT Thought Record Worksheet (2 pages)
// ============================================================
async function createThoughtRecord() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'CBT Thought Record Worksheet', 'Cognitive Behavioral Therapy — Thought Monitoring', helveticaBold, helvetica);

  // Instructions
  y = drawWrappedText(p1, 'Instructions: Use this worksheet to identify and challenge automatic negative thoughts. Complete each column from left to right. Rate emotions on a scale of 0-100%.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  // Table headers
  const cols = ['Situation', 'Automatic\nThought', 'Emotion\n(0-100%)', 'Evidence\nFor', 'Evidence\nAgainst', 'Balanced\nThought', 'Outcome\n(0-100%)'];
  const colW = CONTENT_W / 7;

  // Header row
  page1Header(p1, y, cols, colW, helveticaBold);
  y -= 35;

  // 5 blank rows
  for (let r = 0; r < 5; r++) {
    drawLine(p1, y);
    y -= 80;
    if (y < 60) break;
  }
  drawLine(p1, y);

  addFooter(p1, helvetica);

  // Page 2 — Reflection
  let y2 = drawHeader(p2, 'Thought Record — Reflection', 'Review your completed thought record', helveticaBold, helvetica);

  const reflections = [
    'What patterns do you notice in your automatic thoughts?',
    'Which cognitive distortions appear most frequently?',
    'How did your emotions change after identifying balanced thoughts?',
    'What evidence was most helpful in challenging your thoughts?',
    'What would you tell a friend who had the same automatic thought?',
    'What coping strategies can you use when these thoughts arise again?',
  ];

  for (const q of reflections) {
    p2.drawText(q, { x: MARGIN, y: y2, size: 10, font: helveticaBold, color: NAVY });
    y2 -= 18;
    for (let i = 0; i < 3; i++) {
      drawWriteLine(p2, y2);
      y2 -= 18;
    }
    y2 -= 10;
  }

  addFooter(p2, helvetica);

  writeFileSync(join(OUT, '01-cbt-thought-record.pdf'), await doc.save());
  console.log('✅ 01 - CBT Thought Record');
}

function page1Header(page, y, cols, colW, font) {
  for (let i = 0; i < cols.length; i++) {
    const lines = cols[i].split('\n');
    for (let l = 0; l < lines.length; l++) {
      page.drawText(lines[l], {
        x: MARGIN + i * colW + 3, y: y - l * 10, size: 7, font, color: NAVY,
      });
    }
  }
}

// ============================================================
// 2. Cognitive Distortions Guide (3 pages)
// ============================================================
async function createCognitiveDistortions() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(3);

  const distortions = [
    ['All-or-Nothing Thinking', 'Seeing things in black-and-white categories with no middle ground.', '"If I don\'t get an A, I\'m a total failure."'],
    ['Overgeneralization', 'Drawing broad conclusions from a single event using words like "always" or "never".', '"I always mess things up. Nothing ever works out."'],
    ['Mental Filter', 'Focusing exclusively on negatives while filtering out all positives.', '"Everyone said my presentation was great, but one person yawned—it must have been boring."'],
    ['Disqualifying the Positive', 'Dismissing positive experiences as not counting for some reason.', '"They only said that to be nice. It doesn\'t really count."'],
    ['Jumping to Conclusions', 'Making negative interpretations without evidence (mind reading or fortune telling).', '"She didn\'t text back—she must be upset with me."'],
    ['Magnification / Minimization', 'Exaggerating negatives or shrinking positives out of proportion.', '"Making that small mistake was catastrophic" / "That achievement was no big deal."'],
    ['Emotional Reasoning', 'Assuming your feelings reflect reality.', '"I feel stupid, so I must be stupid."'],
    ['Should Statements', 'Using "should," "must," or "ought" statements that create pressure and guilt.', '"I should be able to handle this without help."'],
    ['Labeling', 'Attaching a global label to yourself rather than describing the behavior.', '"I\'m a loser" instead of "I made a mistake."'],
    ['Personalization', 'Taking responsibility for events outside your control.', '"My child got a bad grade—I must be a terrible parent."'],
    ['Catastrophizing', 'Expecting the worst possible outcome in any situation.', '"If I fail this test, I\'ll never get a job and my life will be ruined."'],
    ['Blaming', 'Holding others entirely responsible for your emotional pain, or vice versa.', '"It\'s all their fault I feel this way."'],
    ['Fallacy of Fairness', 'Believing that life should always be fair and feeling resentful when it isn\'t.', '"It\'s not fair that they got promoted instead of me."'],
    ['Fallacy of Change', 'Expecting others to change to suit your needs if you pressure them enough.', '"If they really loved me, they would change."'],
    ['Always Being Right', 'Prioritizing being right over the feelings of others.', '"I don\'t care how they feel—I know I\'m right about this."'],
  ];

  // Page 1 — First 5
  let y = drawHeader(pages[0], 'Cognitive Distortions Guide', '15 Common Thinking Errors in CBT', helveticaBold, helvetica);
  y = drawWrappedText(pages[0], 'Cognitive distortions are systematic patterns of biased thinking that can contribute to anxiety, depression, and interpersonal conflict. Learning to identify these patterns is the first step toward healthier thinking.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  for (let i = 0; i < 5; i++) {
    y = drawDistortion(pages[0], y, i + 1, distortions[i], helveticaBold, helvetica, helveticaOblique);
    if (y < 60) break;
  }
  addFooter(pages[0], helvetica);

  // Page 2 — Next 5
  y = drawHeader(pages[1], 'Cognitive Distortions Guide (cont.)', null, helveticaBold, helvetica);
  for (let i = 5; i < 10; i++) {
    y = drawDistortion(pages[1], y, i + 1, distortions[i], helveticaBold, helvetica, helveticaOblique);
  }
  addFooter(pages[1], helvetica);

  // Page 3 — Last 5 + self-assessment
  y = drawHeader(pages[2], 'Cognitive Distortions Guide (cont.)', null, helveticaBold, helvetica);
  for (let i = 10; i < 15; i++) {
    y = drawDistortion(pages[2], y, i + 1, distortions[i], helveticaBold, helvetica, helveticaOblique);
  }

  y -= 15;
  pages[2].drawText('Self-Assessment: Check the distortions you recognize in your own thinking:', {
    x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY,
  });
  y -= 20;

  for (let i = 0; i < 15; i++) {
    const col = i < 8 ? 0 : 1;
    const row = i < 8 ? i : i - 8;
    const cx = MARGIN + col * (CONTENT_W / 2);
    const cy = y - row * 18;
    drawCheckbox(pages[2], cx, cy - 2);
    pages[2].drawText(distortions[i][0], { x: cx + 15, y: cy, size: 8, font: helvetica, color: BLACK });
  }

  addFooter(pages[2], helvetica);
  writeFileSync(join(OUT, '02-cognitive-distortions-guide.pdf'), await doc.save());
  console.log('✅ 02 - Cognitive Distortions Guide');
}

function drawDistortion(page, y, num, [name, desc, example], boldFont, regFont, italicFont) {
  page.drawText(`${num}. ${name}`, { x: MARGIN, y, size: 11, font: boldFont, color: NAVY });
  y -= 14;
  y = drawWrappedText(page, desc, MARGIN + 10, y, regFont, 9, BLACK, CONTENT_W - 10);
  y -= 2;
  y = drawWrappedText(page, `Example: ${example}`, MARGIN + 10, y, italicFont, 8, GRAY, CONTENT_W - 10);
  y -= 12;
  return y;
}

// ============================================================
// 3. Behavioral Activation Planner
// ============================================================
async function createBehavioralActivation() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);
  const [p1, p2] = pages;

  let y = drawHeader(p1, 'Behavioral Activation Planner', 'Weekly Activity Scheduling & Mood Tracking', helveticaBold, helvetica);

  y = drawWrappedText(p1, 'Instructions: Plan activities for each day. After completing them, rate your mood (1-10), pleasure (P: 1-10), and mastery/sense of accomplishment (M: 1-10). Aim to include a mix of necessary tasks, pleasurable activities, and social interactions.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 10;

  p1.drawText('Week of: _________________________      Name: _________________________', {
    x: MARGIN, y, size: 9, font: helvetica, color: BLACK,
  });
  y -= 25;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rowH = 75;

  for (const day of days.slice(0, 5)) {
    if (y < 80) break;
    p1.drawRectangle({ x: MARGIN, y: y - rowH, width: CONTENT_W, height: rowH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
    p1.drawText(day, { x: MARGIN + 5, y: y - 13, size: 9, font: helveticaBold, color: NAVY });
    p1.drawText('Planned Activity:', { x: MARGIN + 80, y: y - 13, size: 7, font: helvetica, color: GRAY });
    p1.drawText('Mood: ___  P: ___  M: ___', { x: MARGIN + CONTENT_W - 150, y: y - 13, size: 7, font: helvetica, color: GRAY });
    drawWriteLine(p1, y - 25, CONTENT_W - 10);
    drawWriteLine(p1, y - 43, CONTENT_W - 10);
    drawWriteLine(p1, y - 61, CONTENT_W - 10);
    y -= rowH + 3;
  }
  addFooter(p1, helvetica);

  // Page 2 — Weekend + Reflection
  let y2 = drawHeader(p2, 'Behavioral Activation Planner (cont.)', 'Weekend & Weekly Reflection', helveticaBold, helvetica);

  for (const day of ['Saturday', 'Sunday']) {
    p2.drawRectangle({ x: MARGIN, y: y2 - rowH, width: CONTENT_W, height: rowH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
    p2.drawText(day, { x: MARGIN + 5, y: y2 - 13, size: 9, font: helveticaBold, color: NAVY });
    p2.drawText('Planned Activity:', { x: MARGIN + 80, y: y2 - 13, size: 7, font: helvetica, color: GRAY });
    p2.drawText('Mood: ___  P: ___  M: ___', { x: MARGIN + CONTENT_W - 150, y: y2 - 13, size: 7, font: helvetica, color: GRAY });
    drawWriteLine(p2, y2 - 25, CONTENT_W - 10);
    drawWriteLine(p2, y2 - 43, CONTENT_W - 10);
    drawWriteLine(p2, y2 - 61, CONTENT_W - 10);
    y2 -= rowH + 3;
  }

  y2 -= 20;
  p2.drawText('Weekly Reflection', { x: MARGIN, y: y2, size: 14, font: helveticaBold, color: NAVY });
  y2 -= 20;

  const questions = [
    'Which activities improved your mood the most this week?',
    'Which activities did you avoid? What got in the way?',
    'What is one activity you want to do more of next week?',
    'Average mood this week (1-10): ___   Last week: ___',
  ];
  for (const q of questions) {
    p2.drawText(q, { x: MARGIN, y: y2, size: 9, font: helveticaBold, color: NAVY });
    y2 -= 16;
    for (let i = 0; i < 2; i++) { drawWriteLine(p2, y2); y2 -= 16; }
    y2 -= 8;
  }

  addFooter(p2, helvetica);
  writeFileSync(join(OUT, '03-behavioral-activation-planner.pdf'), await doc.save());
  console.log('✅ 03 - Behavioral Activation Planner');
}

// ============================================================
// 4. DBT Distress Tolerance Toolkit (4 pages)
// ============================================================
async function createDBTDistressTolerance() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(4);

  // Page 1 — TIPP
  let y = drawHeader(pages[0], 'DBT Distress Tolerance Toolkit', 'Crisis Survival Skills', helveticaBold, helvetica);
  y = drawWrappedText(pages[0], 'Use these skills when you are in a crisis situation and need to tolerate distress without making things worse. Practice these skills before you need them.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  pages[0].drawText('TIPP Skills — Change Your Body Chemistry Fast', { x: MARGIN, y, size: 13, font: helveticaBold, color: NAVY });
  y -= 20;

  const tipp = [
    ['T — Temperature', 'Hold ice cubes, splash cold water on your face, or take a cold shower. Cold temperature activates the dive reflex and calms your nervous system quickly.'],
    ['I — Intense Exercise', 'Run, jump, do pushups, or dance vigorously for 10-20 minutes. Intense exercise burns off the adrenaline and cortisol flooding your system.'],
    ['P — Paced Breathing', 'Breathe in for 4 counts, hold for 4, breathe out for 6-8 counts. Slow exhales activate your parasympathetic nervous system.'],
    ['P — Paired Muscle Relaxation', 'Tense each muscle group for 5 seconds while breathing in, then release while breathing out and saying "relax" silently.'],
  ];

  for (const [title, desc] of tipp) {
    pages[0].drawText(title, { x: MARGIN + 10, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 14;
    y = drawWrappedText(pages[0], desc, MARGIN + 20, y, helvetica, 8.5, BLACK, CONTENT_W - 30);
    y -= 5;
    pages[0].drawText('My plan: ', { x: MARGIN + 20, y, size: 8, font: helveticaOblique, color: GRAY });
    drawWriteLine(pages[0], y - 2, CONTENT_W - 30);
    y -= 20;
  }

  addFooter(pages[0], helvetica);

  // Page 2 — ACCEPTS
  y = drawHeader(pages[1], 'ACCEPTS — Distraction Skills', 'When you need to take your mind off the crisis temporarily', helveticaBold, helvetica);

  const accepts = [
    ['A — Activities', 'Do something that requires focus: exercise, clean, cook, play a game, garden, read.'],
    ['C — Contributing', 'Help someone else: volunteer, do a kind act, write an encouraging note.'],
    ['C — Comparisons', 'Compare to times you coped well, or to those less fortunate (use with compassion).'],
    ['E — Emotions (opposite)', 'Watch a funny movie when sad, listen to upbeat music, read inspiring stories.'],
    ['P — Pushing Away', 'Mentally put the situation in a box and place it on a shelf. You\'ll come back to it later.'],
    ['T — Thoughts', 'Count to 10, do a puzzle, recite song lyrics, describe objects in the room in detail.'],
    ['S — Sensations', 'Hold ice, snap a rubber band, taste something sour, smell peppermint.'],
  ];

  for (const [title, desc] of accepts) {
    pages[1].drawText(title, { x: MARGIN + 10, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 13;
    y = drawWrappedText(pages[1], desc, MARGIN + 20, y, helvetica, 8.5, BLACK, CONTENT_W - 30);
    y -= 5;
    pages[1].drawText('My go-to: ', { x: MARGIN + 20, y, size: 8, font: helveticaOblique, color: GRAY });
    drawWriteLine(pages[1], y - 2, CONTENT_W - 30);
    y -= 18;
  }

  addFooter(pages[1], helvetica);

  // Page 3 — IMPROVE the Moment
  y = drawHeader(pages[2], 'IMPROVE the Moment', 'Making the current moment more bearable', helveticaBold, helvetica);

  const improve = [
    ['I — Imagery', 'Imagine a safe, peaceful place. Visualize yourself coping successfully.'],
    ['M — Meaning', 'Find purpose or meaning in the pain. What can this experience teach you?'],
    ['P — Prayer/Meditation', 'Connect with your higher power, practice mindfulness, or meditate.'],
    ['R — Relaxation', 'Progressive muscle relaxation, hot bath, gentle stretching, deep breathing.'],
    ['O — One Thing at a Time', 'Focus entirely on just this one moment. Don\'t think ahead or behind.'],
    ['V — Vacation (brief)', 'Take a 20-minute mental vacation: read, take a walk, sit in nature.'],
    ['E — Encouragement', 'Talk to yourself like a supportive friend: "I can handle this. This will pass."'],
  ];

  for (const [title, desc] of improve) {
    pages[2].drawText(title, { x: MARGIN + 10, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 13;
    y = drawWrappedText(pages[2], desc, MARGIN + 20, y, helvetica, 8.5, BLACK, CONTENT_W - 30);
    y -= 5;
    pages[2].drawText('My plan: ', { x: MARGIN + 20, y, size: 8, font: helveticaOblique, color: GRAY });
    drawWriteLine(pages[2], y - 2, CONTENT_W - 30);
    y -= 18;
  }

  addFooter(pages[2], helvetica);

  // Page 4 — Pros & Cons + My Crisis Plan
  y = drawHeader(pages[3], 'Pros & Cons of Tolerating Distress', 'Use this before acting on crisis urges', helveticaBold, helvetica);

  // 2x2 table
  const halfW = CONTENT_W / 2;
  const cellH = 120;

  // Headers
  pages[3].drawRectangle({ x: MARGIN, y: y - 18, width: halfW, height: 18, color: rgb(0.95, 0.95, 0.95) });
  pages[3].drawRectangle({ x: MARGIN + halfW, y: y - 18, width: halfW, height: 18, color: rgb(0.95, 0.95, 0.95) });
  pages[3].drawText('PROS', { x: MARGIN + halfW / 2 - 15, y: y - 14, size: 9, font: helveticaBold, color: NAVY });
  pages[3].drawText('CONS', { x: MARGIN + halfW + halfW / 2 - 15, y: y - 14, size: 9, font: helveticaBold, color: NAVY });
  y -= 18;

  // Row 1 - Tolerating
  pages[3].drawText('Tolerating the Crisis', { x: MARGIN + 3, y: y - 14, size: 8, font: helveticaBold, color: NAVY });
  pages[3].drawRectangle({ x: MARGIN, y: y - cellH, width: halfW, height: cellH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
  pages[3].drawRectangle({ x: MARGIN + halfW, y: y - cellH, width: halfW, height: cellH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
  y -= cellH;

  // Row 2 - Not tolerating
  pages[3].drawText('NOT Tolerating (Acting on Urge)', { x: MARGIN + 3, y: y - 14, size: 8, font: helveticaBold, color: NAVY });
  pages[3].drawRectangle({ x: MARGIN, y: y - cellH, width: halfW, height: cellH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
  pages[3].drawRectangle({ x: MARGIN + halfW, y: y - cellH, width: halfW, height: cellH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
  y -= cellH + 25;

  pages[3].drawText('My Personal Crisis Survival Plan', { x: MARGIN, y, size: 13, font: helveticaBold, color: NAVY });
  y -= 18;

  const plans = [
    'When I notice my distress level is above a 7, I will first try:',
    'If that doesn\'t work, my backup plan is:',
    'Person I can call for support:',
    'My self-encouragement statement:',
  ];
  for (const p of plans) {
    pages[3].drawText(p, { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 15;
    drawWriteLine(pages[3], y); y -= 15;
    drawWriteLine(pages[3], y); y -= 20;
  }

  addFooter(pages[3], helvetica);
  writeFileSync(join(OUT, '04-dbt-distress-tolerance.pdf'), await doc.save());
  console.log('✅ 04 - DBT Distress Tolerance Toolkit');
}

// ============================================================
// 5. Emotion Regulation Worksheet Pack (3 pages)
// ============================================================
async function createEmotionRegulation() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(3);

  // Page 1 — Emotion Identification
  let y = drawHeader(pages[0], 'Emotion Identification Worksheet', 'DBT Emotion Regulation Module', helveticaBold, helvetica);

  y = drawWrappedText(pages[0], 'Describe the emotion you are experiencing. Be as specific as possible. There are no wrong answers.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 10;

  const fields1 = [
    ['Emotion Name:', 'What word best describes what you\'re feeling? (e.g., sadness, anger, shame, fear, joy)'],
    ['Intensity (0-100):', 'How intense is this emotion right now?'],
    ['Prompting Event:', 'What happened right before you felt this emotion?'],
    ['Interpretation:', 'What thoughts or beliefs came up? What did the event mean to you?'],
    ['Body Sensations:', 'Where do you feel this emotion in your body? What does it feel like physically?'],
    ['Action Urge:', 'What does this emotion make you want to do?'],
    ['What You Did:', 'What action did you actually take?'],
    ['Aftereffect:', 'How did the emotion and your actions affect you afterward?'],
  ];

  for (const [label, hint] of fields1) {
    pages[0].drawText(label, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 12;
    pages[0].drawText(hint, { x: MARGIN + 5, y, size: 7, font: helveticaOblique, color: GRAY });
    y -= 12;
    drawWriteLine(pages[0], y); y -= 14;
    drawWriteLine(pages[0], y); y -= 18;
  }
  addFooter(pages[0], helvetica);

  // Page 2 — ABC PLEASE
  y = drawHeader(pages[1], 'ABC PLEASE Checklist', 'Reducing Vulnerability to Negative Emotions', helveticaBold, helvetica);

  y = drawWrappedText(pages[1], 'Check each item you practiced today. These skills reduce your vulnerability to intense negative emotions over time. Aim to practice daily.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  pages[1].drawText('A — Accumulate Positive Experiences', { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
  y -= 15;
  const aItems = ['Did something enjoyable today', 'Worked toward a long-term goal', 'Engaged in a pleasant activity mindfully'];
  for (const item of aItems) { drawCheckbox(pages[1], MARGIN + 10, y - 2); pages[1].drawText(item, { x: MARGIN + 28, y, size: 9, font: helvetica, color: BLACK }); y -= 18; }

  y -= 5;
  pages[1].drawText('B — Build Mastery', { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
  y -= 15;
  const bItems = ['Did something challenging', 'Practiced a skill or hobby', 'Accomplished something (even small)'];
  for (const item of bItems) { drawCheckbox(pages[1], MARGIN + 10, y - 2); pages[1].drawText(item, { x: MARGIN + 28, y, size: 9, font: helvetica, color: BLACK }); y -= 18; }

  y -= 5;
  pages[1].drawText('C — Cope Ahead', { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
  y -= 15;
  const cItems = ['Identified an upcoming difficult situation', 'Planned how to cope with it', 'Rehearsed/visualized coping successfully'];
  for (const item of cItems) { drawCheckbox(pages[1], MARGIN + 10, y - 2); pages[1].drawText(item, { x: MARGIN + 28, y, size: 9, font: helvetica, color: BLACK }); y -= 18; }

  y -= 5;
  pages[1].drawText('PLEASE Skills — Taking Care of Your Body', { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
  y -= 15;
  const please = [
    'PL — Treated Physical iLlness (took meds, saw doctor)',
    'E — Ate balanced meals (no skipping, no binging)',
    'A — Avoided mood-altering substances',
    'S — Got adequate Sleep (7-9 hours)',
    'E — Exercised (at least 20 minutes)',
  ];
  for (const item of please) { drawCheckbox(pages[1], MARGIN + 10, y - 2); pages[1].drawText(item, { x: MARGIN + 28, y, size: 9, font: helvetica, color: BLACK }); y -= 18; }

  addFooter(pages[1], helvetica);

  // Page 3 — Opposite Action
  y = drawHeader(pages[2], 'Opposite Action Guide', 'Acting opposite to your emotional urge', helveticaBold, helvetica);

  y = drawWrappedText(pages[2], 'When your emotion does not fit the facts, or when acting on the emotion would be harmful, use opposite action. Act ALL THE WAY opposite — including body posture, facial expression, and tone of voice.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  const opposites = [
    ['Fear', 'Avoid, escape, freeze', 'Approach what you fear (gradually). Stay present. Don\'t avoid.'],
    ['Anger', 'Attack, yell, criticize', 'Gently avoid. Be kind. Take a timeout. Empathize.'],
    ['Sadness', 'Withdraw, isolate, be passive', 'Get active. Reach out to others. Do things that build mastery.'],
    ['Shame', 'Hide, avoid, keep secrets', 'Share with someone trustworthy. Hold your head up. Repeat the behavior (if not harmful).'],
    ['Guilt', 'Avoid the person, punish yourself', 'Apologize/repair. Commit to not repeating. Let it go.'],
  ];

  // Table
  const colWidths = [70, 150, CONTENT_W - 220];
  pages[2].drawRectangle({ x: MARGIN, y: y - 15, width: CONTENT_W, height: 15, color: rgb(0.95, 0.95, 0.95) });
  pages[2].drawText('Emotion', { x: MARGIN + 5, y: y - 12, size: 8, font: helveticaBold, color: NAVY });
  pages[2].drawText('Urge', { x: MARGIN + 75, y: y - 12, size: 8, font: helveticaBold, color: NAVY });
  pages[2].drawText('Opposite Action', { x: MARGIN + 225, y: y - 12, size: 8, font: helveticaBold, color: NAVY });
  y -= 15;

  for (const [emotion, urge, opposite] of opposites) {
    drawLine(pages[2], y);
    y -= 14;
    pages[2].drawText(emotion, { x: MARGIN + 5, y, size: 9, font: helveticaBold, color: NAVY });
    pages[2].drawText(urge, { x: MARGIN + 75, y, size: 8, font: helvetica, color: BLACK });
    const lines = wrapText(opposite, helvetica, 8, colWidths[2] - 10);
    for (let i = 0; i < lines.length; i++) {
      pages[2].drawText(lines[i], { x: MARGIN + 225, y: y - i * 11, size: 8, font: helvetica, color: BLACK });
    }
    y -= Math.max(lines.length * 11, 14) + 8;
  }

  y -= 15;
  pages[2].drawText('Practice Exercise:', { x: MARGIN, y, size: 11, font: helveticaBold, color: NAVY });
  y -= 16;
  pages[2].drawText('Emotion I want to work with:', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });
  drawWriteLine(pages[2], y - 2, 200); y -= 20;
  pages[2].drawText('My opposite action plan:', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });
  y -= 14; drawWriteLine(pages[2], y); y -= 14; drawWriteLine(pages[2], y); y -= 14; drawWriteLine(pages[2], y);

  addFooter(pages[2], helvetica);
  writeFileSync(join(OUT, '05-emotion-regulation-pack.pdf'), await doc.save());
  console.log('✅ 05 - Emotion Regulation Pack');
}

// ============================================================
// 6. Comprehensive Client Intake Form (3 pages)
// ============================================================
async function createIntakeForm() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(3);

  // Page 1
  let y = drawHeader(pages[0], 'Client Intake Form', 'Confidential — Protected Health Information', helveticaBold, helvetica);

  const field = (page, label, yy, width = CONTENT_W) => {
    page.drawText(label, { x: MARGIN, y: yy, size: 9, font: helveticaBold, color: NAVY });
    drawWriteLine(page, yy - 2, width);
    return yy - 22;
  };

  const fieldInline = (page, label, x, yy, width) => {
    page.drawText(label, { x, y: yy, size: 8, font: helvetica, color: GRAY });
    drawWriteLine(page, yy - 2, width);
  };

  y = field(pages[0], 'Date: ________________    Therapist: ________________', y);
  y -= 5;

  pages[0].drawText('PERSONAL INFORMATION', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;

  y = field(pages[0], 'Full Name:', y);
  y = field(pages[0], 'Preferred Name:', y);
  y = field(pages[0], 'Date of Birth: ____________  Age: ______  Gender Identity: ________________', y);
  y = field(pages[0], 'Pronouns: ______________  Phone: __________________  Email: __________________', y);
  y = field(pages[0], 'Address:', y);
  y = field(pages[0], 'Emergency Contact: __________________________  Relationship: ____________  Phone: ____________', y);
  y = field(pages[0], 'Primary Care Physician: ____________________________  Phone: ________________', y);

  y -= 10;
  pages[0].drawText('PRESENTING CONCERNS', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;
  pages[0].drawText('What brings you to therapy today?', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14;
  for (let i = 0; i < 4; i++) { drawWriteLine(pages[0], y); y -= 16; }

  pages[0].drawText('When did these concerns begin?', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; drawWriteLine(pages[0], y); y -= 16; drawWriteLine(pages[0], y);

  addFooter(pages[0], helvetica);

  // Page 2 — History
  y = drawHeader(pages[1], 'Client Intake Form (cont.)', 'Mental Health & Medical History', helveticaBold, helvetica);

  pages[1].drawText('MENTAL HEALTH HISTORY', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;
  y = field(pages[1], 'Have you been in therapy before?  [ ] Yes  [ ] No    If yes, when and for how long?', y);
  drawWriteLine(pages[1], y + 8); y -= 10;
  y = field(pages[1], 'Previous diagnoses:', y);
  y = field(pages[1], 'Current medications (include dosage):', y);
  drawWriteLine(pages[1], y + 8); y -= 10;

  pages[1].drawText('Please check any symptoms you are currently experiencing:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 16;

  const symptoms = [
    'Depressed mood', 'Anxiety or worry', 'Panic attacks', 'Difficulty sleeping',
    'Appetite changes', 'Fatigue / low energy', 'Difficulty concentrating', 'Irritability',
    'Suicidal thoughts', 'Self-harm urges', 'Substance use', 'Relationship difficulties',
    'Grief / loss', 'Trauma / flashbacks', 'Social withdrawal', 'Anger management',
  ];

  for (let i = 0; i < symptoms.length; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    if (i % 3 === 0 && i > 0) {} // same row tracking
    const cx = MARGIN + col * (CONTENT_W / 3);
    const cy = y - row * 16;
    drawCheckbox(pages[1], cx, cy - 2, 9);
    pages[1].drawText(symptoms[i], { x: cx + 14, y: cy, size: 8, font: helvetica, color: BLACK });
  }
  y -= Math.ceil(symptoms.length / 3) * 16 + 15;

  pages[1].drawText('MEDICAL HISTORY', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;
  y = field(pages[1], 'Significant medical conditions:', y);
  y = field(pages[1], 'Allergies:', y);
  y = field(pages[1], 'Recent hospitalizations or surgeries:', y);

  addFooter(pages[1], helvetica);

  // Page 3 — Social/Goals/Consent
  y = drawHeader(pages[2], 'Client Intake Form (cont.)', 'Social History, Goals & Consent', helveticaBold, helvetica);

  pages[2].drawText('SOCIAL HISTORY', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;
  y = field(pages[2], 'Relationship status:', y);
  y = field(pages[2], 'Living situation:', y);
  y = field(pages[2], 'Occupation:', y);
  y = field(pages[2], 'Support system (family, friends, community):', y);
  drawWriteLine(pages[2], y + 8); y -= 10;

  pages[2].drawText('THERAPY GOALS', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 18;
  pages[2].drawText('What do you hope to achieve through therapy?', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14;
  for (let i = 0; i < 4; i++) { drawWriteLine(pages[2], y); y -= 16; }

  y -= 5;
  pages[2].drawText('Is there anything else you would like your therapist to know?', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14;
  for (let i = 0; i < 3; i++) { drawWriteLine(pages[2], y); y -= 16; }

  y -= 10;
  pages[2].drawText('CONSENT & ACKNOWLEDGMENT', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 16;
  y = drawWrappedText(pages[2], 'I acknowledge that the information provided is accurate to the best of my knowledge. I understand that this information is confidential and protected under applicable privacy laws. I consent to treatment and understand I may revoke this consent at any time.', MARGIN, y, helvetica, 8, BLACK, CONTENT_W);
  y -= 25;
  pages[2].drawText('Client Signature: _________________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });
  y -= 20;
  pages[2].drawText('Therapist Signature: ______________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });

  addFooter(pages[2], helvetica);
  writeFileSync(join(OUT, '06-client-intake-form.pdf'), await doc.save());
  console.log('✅ 06 - Client Intake Form');
}

// ============================================================
// 7. Treatment Plan Template (2 pages)
// ============================================================
async function createTreatmentPlan() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);

  let y = drawHeader(pages[0], 'Treatment Plan Template', 'Individualized Client Treatment Plan', helveticaBold, helvetica);

  const f = (page, label, yy) => {
    page.drawText(label, { x: MARGIN, y: yy, size: 9, font: helveticaBold, color: NAVY });
    return yy - 20;
  };

  y = f(pages[0], 'Client Name: ____________________________    DOB: ______________    Date: ______________', y);
  y = f(pages[0], 'Therapist: ____________________________    Review Date: ______________', y);
  y = f(pages[0], 'Diagnosis / Presenting Problem:', y);
  drawWriteLine(pages[0], y + 6); y -= 12; drawWriteLine(pages[0], y + 6); y -= 15;

  // Goal 1
  for (let g = 1; g <= 2; g++) {
    pages[0].drawText(`GOAL ${g}`, { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
    y -= 16;
    pages[0].drawText('Goal Statement:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 14; drawWriteLine(pages[0], y); y -= 18;

    pages[0].drawText('Measurable Objectives:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 14;
    for (let o = 1; o <= 3; o++) {
      pages[0].drawText(`${o}.`, { x: MARGIN + 5, y, size: 9, font: helvetica, color: BLACK });
      drawWriteLine(pages[0], y - 2, CONTENT_W - 15);
      y -= 18;
    }

    pages[0].drawText('Interventions:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 14;
    for (let i = 0; i < 2; i++) { drawWriteLine(pages[0], y); y -= 16; }

    pages[0].drawText('Target Date: ______________    Status:  [ ] In Progress  [ ] Achieved  [ ] Modified  [ ] Discontinued', {
      x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
    });
    y -= 25;
  }

  addFooter(pages[0], helvetica);

  // Page 2 — Goal 3 + Progress + Signatures
  y = drawHeader(pages[1], 'Treatment Plan (cont.)', null, helveticaBold, helvetica);

  pages[1].drawText('GOAL 3', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 16;
  pages[1].drawText('Goal Statement:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; drawWriteLine(pages[1], y); y -= 18;
  pages[1].drawText('Measurable Objectives:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14;
  for (let o = 1; o <= 3; o++) {
    pages[1].drawText(`${o}.`, { x: MARGIN + 5, y, size: 9, font: helvetica, color: BLACK });
    drawWriteLine(pages[1], y - 2, CONTENT_W - 15); y -= 18;
  }
  pages[1].drawText('Interventions:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; drawWriteLine(pages[1], y); y -= 16; drawWriteLine(pages[1], y); y -= 16;
  pages[1].drawText('Target Date: ______________    Status:  [ ] In Progress  [ ] Achieved  [ ] Modified  [ ] Discontinued', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 30;

  pages[1].drawText('PROGRESS NOTES', { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
  y -= 16;
  for (let i = 0; i < 6; i++) {
    pages[1].drawText('Date: ________', { x: MARGIN, y, size: 8, font: helvetica, color: GRAY });
    drawWriteLine(pages[1], y - 2, CONTENT_W - 80);
    y -= 18;
  }

  y -= 15;
  pages[1].drawText('Frequency of Sessions: [ ] Weekly  [ ] Bi-weekly  [ ] Monthly  [ ] Other: __________', {
    x: MARGIN, y, size: 9, font: helvetica, color: BLACK,
  });
  y -= 25;
  pages[1].drawText('Client Signature: _________________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });
  y -= 20;
  pages[1].drawText('Therapist Signature: ______________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });

  addFooter(pages[1], helvetica);
  writeFileSync(join(OUT, '07-treatment-plan-template.pdf'), await doc.save());
  console.log('✅ 07 - Treatment Plan Template');
}

// ============================================================
// 8. SOAP Progress Notes (1 page)
// ============================================================
async function createSOAPNotes() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(1);
  const p = pages[0];

  let y = drawHeader(p, 'Session Progress Notes — SOAP Format', 'Confidential Clinical Documentation', helveticaBold, helvetica);

  p.drawText('Client: ____________________________    Date: ____________    Session #: ______    Duration: ______', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 18;
  p.drawText('Therapist: ____________________________    Modality: [ ] In-person  [ ] Telehealth  [ ] Phone', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 25;

  const sections = [
    ['S — Subjective', 'Client\'s self-report, mood, presenting concerns, relevant quotes', 7],
    ['O — Objective', 'Therapist observations: affect, behavior, appearance, mental status, test results', 6],
    ['A — Assessment', 'Clinical interpretation, progress toward goals, risk assessment, diagnostic impressions', 6],
    ['P — Plan', 'Next steps, interventions, homework, referrals, next session focus, medication changes', 5],
  ];

  for (const [title, hint, lineCount] of sections) {
    p.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_W, height: 16, color: rgb(0.95, 0.95, 0.95) });
    p.drawText(title, { x: MARGIN + 5, y, size: 10, font: helveticaBold, color: NAVY });
    p.drawText(hint, { x: MARGIN + 5 + helveticaBold.widthOfTextAtSize(title, 10) + 10, y: y + 1, size: 7, font: helveticaOblique, color: GRAY });
    y -= 20;
    for (let i = 0; i < lineCount; i++) { drawWriteLine(p, y); y -= 14; }
    y -= 8;
  }

  p.drawText('Risk Assessment:  [ ] No risk identified  [ ] Low  [ ] Moderate  [ ] High  (if moderate/high, complete safety plan)', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 20;
  p.drawText('Next Appointment: ______________    CPT Code: [ ] 90834 (45min)  [ ] 90837 (60min)  [ ] 90847 (Family)  [ ] Other: ______', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 25;
  p.drawText('Therapist Signature: ______________________________    Date: ________________', { x: MARGIN, y, size: 9, font: helvetica, color: BLACK });

  addFooter(p, helvetica);
  writeFileSync(join(OUT, '08-soap-progress-notes.pdf'), await doc.save());
  console.log('✅ 08 - SOAP Progress Notes');
}

// ============================================================
// 9. 5-4-3-2-1 Grounding Worksheet (1 page)
// ============================================================
async function createGrounding() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(1);
  const p = pages[0];

  let y = drawHeader(p, '5-4-3-2-1 Grounding Technique', 'A Sensory Awareness Exercise for Anxiety & Distress', helveticaBold, helvetica);

  y = drawWrappedText(p, 'When you feel anxious, overwhelmed, or disconnected, use this technique to anchor yourself in the present moment. Engage each of your five senses slowly and deliberately. Take your time with each step.', MARGIN, y, helveticaOblique, 8.5, GRAY, CONTENT_W);
  y -= 20;

  const senses = [
    ['5', 'THINGS YOU CAN SEE', 'Look around you. Name 5 things you can see right now.', 5],
    ['4', 'THINGS YOU CAN TOUCH', 'Notice textures and sensations. Name 4 things you can physically feel.', 4],
    ['3', 'THINGS YOU CAN HEAR', 'Listen carefully. Name 3 sounds you can hear right now.', 3],
    ['2', 'THINGS YOU CAN SMELL', 'Breathe in. Name 2 things you can smell (or like to smell).', 2],
    ['1', 'THING YOU CAN TASTE', 'Notice your mouth. Name 1 thing you can taste right now.', 1],
  ];

  for (const [num, label, instruction, count] of senses) {
    // Number circle
    p.drawCircle({ x: MARGIN + 18, y: y - 5, size: 16, color: NAVY });
    p.drawText(num, { x: MARGIN + 13, y: y - 11, size: 16, font: helveticaBold, color: WHITE });

    p.drawText(label, { x: MARGIN + 42, y, size: 11, font: helveticaBold, color: NAVY });
    p.drawText(instruction, { x: MARGIN + 42, y: y - 13, size: 8, font: helveticaOblique, color: GRAY });
    y -= 30;

    for (let i = 1; i <= count; i++) {
      p.drawText(`${i}.`, { x: MARGIN + 50, y, size: 9, font: helvetica, color: GRAY });
      drawWriteLine(p, y - 2, CONTENT_W - 60);
      y -= 18;
    }
    y -= 8;
  }

  y -= 5;
  p.drawText('After completing: Take 3 slow, deep breaths. Notice how you feel now compared to when you started.', {
    x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY,
  });

  addFooter(p, helvetica);
  writeFileSync(join(OUT, '09-grounding-54321.pdf'), await doc.save());
  console.log('✅ 09 - 5-4-3-2-1 Grounding');
}

// ============================================================
// 10. Anxiety Coping Skills Cards (2 pages)
// ============================================================
async function createCopingCards() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);

  const cards = [
    ['Deep Breathing', 'Breathe in for 4 counts, hold for 4, out for 6. Repeat 5 times. Focus only on your breath.'],
    ['Progressive Muscle Relaxation', 'Tense each muscle group for 5 seconds, then release. Start from toes, work up to face.'],
    ['Grounding (5-4-3-2-1)', 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.'],
    ['Positive Self-Talk', 'Replace "I can\'t handle this" with "I\'ve gotten through hard things before. I can do this."'],
    ['Mindful Observation', 'Pick one object. Study it for 60 seconds: color, texture, shape, weight. Stay curious.'],
    ['Body Scan', 'Close your eyes. Slowly scan from head to toes, noticing tension. Breathe into tight areas.'],
    ['Safe Place Visualization', 'Picture your safe place in detail: sights, sounds, smells, temperature. Stay there for 2 minutes.'],
    ['Thought Challenging', 'Ask: "Is this thought a fact or a feeling? What would I tell a friend? What\'s the evidence?"'],
    ['Physical Movement', 'Walk, stretch, dance, or do 10 jumping jacks. Movement releases anxious energy.'],
    ['Ice Dive', 'Hold ice cubes or splash cold water on your face. Cold activates your calming nervous system.'],
    ['Journaling', 'Write for 5 minutes without stopping. Don\'t edit—just let your thoughts flow onto the page.'],
    ['STOP Skill', 'Stop. Take a breath. Observe what\'s happening inside and out. Proceed mindfully.'],
    ['Counting Backward', 'Count backward from 100 by 7s (100, 93, 86...). This redirects your thinking brain.'],
    ['Compassionate Touch', 'Place your hand on your heart. Feel its warmth. Say: "This is a moment of suffering. May I be kind to myself."'],
    ['Box Breathing', 'Breathe in 4 counts, hold 4, out 4, hold 4. Trace a square in the air as you go.'],
    ['Bilateral Tapping', 'Cross arms over chest. Alternate tapping left and right shoulders slowly. 10 rounds.'],
  ];

  for (let pageIdx = 0; pageIdx < 2; pageIdx++) {
    const p = pages[pageIdx];
    let y = drawHeader(p, `Anxiety Coping Skills Cards${pageIdx === 1 ? ' (cont.)' : ''}`, 'Cut along the lines — keep these cards in your wallet, journal, or phone case', helveticaBold, helvetica);

    const startIdx = pageIdx * 8;
    const cardW = (CONTENT_W - 15) / 2;
    const cardH = 135;

    for (let i = 0; i < 8; i++) {
      const card = cards[startIdx + i];
      if (!card) break;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = MARGIN + col * (cardW + 15);
      const cy = y - row * (cardH + 10);

      // Card border
      p.drawRectangle({ x: cx, y: cy - cardH, width: cardW, height: cardH, borderColor: LIGHT_GRAY, borderWidth: 1, color: WHITE });
      // Title bar
      p.drawRectangle({ x: cx, y: cy - 22, width: cardW, height: 22, color: NAVY });
      p.drawText(card[0], { x: cx + 8, y: cy - 17, size: 9, font: helveticaBold, color: WHITE });
      // Body
      const bodyLines = wrapText(card[1], helvetica, 8.5, cardW - 20);
      for (let l = 0; l < bodyLines.length; l++) {
        p.drawText(bodyLines[l], { x: cx + 10, y: cy - 40 - l * 13, size: 8.5, font: helvetica, color: BLACK });
      }
    }

    addFooter(p, helvetica);
  }

  writeFileSync(join(OUT, '10-anxiety-coping-cards.pdf'), await doc.save());
  console.log('✅ 10 - Anxiety Coping Cards');
}

// ============================================================
// 11. Worry Log (2 pages)
// ============================================================
async function createWorryLog() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);

  let y = drawHeader(pages[0], 'Worry Log & Analysis Worksheet', 'Track, Analyze & Challenge Anxious Thoughts', helveticaBold, helvetica);
  y = drawWrappedText(pages[0], 'Use this log to track worries as they arise. Over time, you will notice patterns and learn that most worries do not come true. Rate likelihood 0-100%.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 10;

  pages[0].drawText('Name: ____________________________    Week of: ____________________', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });
  y -= 20;

  // Table headers
  const headers = ['Date/Time', 'Worry/Trigger', 'Likelihood\n(0-100%)', 'What Actually\nHappened', 'Coping\nStrategy Used'];
  const colWidths2 = [65, 150, 65, 120, 112];
  let cx = MARGIN;

  pages[0].drawRectangle({ x: MARGIN, y: y - 25, width: CONTENT_W, height: 25, color: rgb(0.95, 0.95, 0.95) });
  for (let i = 0; i < headers.length; i++) {
    const lines = headers[i].split('\n');
    for (let l = 0; l < lines.length; l++) {
      pages[0].drawText(lines[l], { x: cx + 3, y: y - 10 - l * 9, size: 7, font: helveticaBold, color: NAVY });
    }
    cx += colWidths2[i];
  }
  y -= 25;

  // 8 rows per page
  const rowH2 = 55;
  for (let r = 0; r < 8; r++) {
    if (y - rowH2 < 40) break;
    let rx = MARGIN;
    for (let c = 0; c < 5; c++) {
      pages[0].drawRectangle({ x: rx, y: y - rowH2, width: colWidths2[c], height: rowH2, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
      rx += colWidths2[c];
    }
    y -= rowH2;
  }
  addFooter(pages[0], helvetica);

  // Page 2 — Analysis
  y = drawHeader(pages[1], 'Worry Analysis & Reflection', null, helveticaBold, helvetica);

  const questions = [
    'What percentage of my worries actually came true this week? ______%',
    'What was my most frequent worry topic?',
    'Which coping strategies were most effective?',
    'What patterns do I notice in when/where my worries are strongest?',
    'If I could tell my worried self one thing, it would be:',
    'One thing I want to do differently next week:',
  ];

  for (const q of questions) {
    pages[1].drawText(q, { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY });
    y -= 16;
    for (let i = 0; i < 3; i++) { drawWriteLine(pages[1], y); y -= 16; }
    y -= 12;
  }

  y -= 5;
  pages[1].drawRectangle({ x: MARGIN, y: y - 50, width: CONTENT_W, height: 50, borderColor: GOLD, borderWidth: 1, color: rgb(1, 0.98, 0.94) });
  y -= 15;
  pages[1].drawText('Remember: Research shows that 85% of what we worry about never happens,', { x: MARGIN + 10, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 13;
  pages[1].drawText('and of the 15% that does, 79% of people handled it better than expected.', { x: MARGIN + 10, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 13;
  pages[1].drawText('— Leahy, 2005', { x: MARGIN + 10, y, size: 8, font: helveticaOblique, color: GRAY });

  addFooter(pages[1], helvetica);
  writeFileSync(join(OUT, '11-worry-log.pdf'), await doc.save());
  console.log('✅ 11 - Worry Log');
}

// ============================================================
// 12. Safety Plan Template (1 page)
// ============================================================
async function createSafetyPlan() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(1);
  const p = pages[0];

  let y = drawHeader(p, 'Safety Plan', 'Stanley & Brown Safety Planning Intervention', helveticaBold, helvetica);

  p.drawText('Client: ____________________________    Date: ____________    Therapist: ____________________________', {
    x: MARGIN, y, size: 8, font: helvetica, color: BLACK,
  });
  y -= 20;

  const steps = [
    ['Step 1: Warning Signs', 'What thoughts, feelings, or behaviors tell me a crisis may be developing?', 3],
    ['Step 2: Internal Coping Strategies', 'Things I can do on my own to take my mind off my problems (without contacting anyone):', 3],
    ['Step 3: People & Social Settings That Provide Distraction', 'People I can contact or places I can go for healthy distraction:', 3],
    ['Step 4: People I Can Ask for Help', 'Name: ______________ Phone: ______________\nName: ______________ Phone: ______________', 0],
    ['Step 5: Professionals & Agencies I Can Contact', 'Therapist: ______________ Phone: ______________\nCrisis Line: 988 (Suicide & Crisis Lifeline)\nCrisis Text Line: Text HOME to 741741\nLocal ER: ______________ Phone: ______________', 0],
    ['Step 6: Making the Environment Safe', 'Steps I can take to reduce access to lethal means:', 2],
  ];

  for (const [title, content, lineCount] of steps) {
    p.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_W, height: 14, color: rgb(0.95, 0.95, 0.95) });
    p.drawText(title, { x: MARGIN + 5, y: y - 0, size: 9, font: helveticaBold, color: NAVY });
    y -= 18;

    const contentLines = content.split('\n');
    for (const cl of contentLines) {
      p.drawText(cl, { x: MARGIN + 5, y, size: 8, font: helvetica, color: BLACK });
      y -= 13;
    }

    for (let i = 0; i < lineCount; i++) {
      drawWriteLine(p, y, CONTENT_W - 10);
      y -= 14;
    }
    y -= 6;
  }

  y -= 5;
  p.drawText('The one thing that is most important to me and worth living for:', { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
  y -= 14; drawWriteLine(p, y);

  addFooter(p, helvetica);
  writeFileSync(join(OUT, '12-safety-plan.pdf'), await doc.save());
  console.log('✅ 12 - Safety Plan');
}

// ============================================================
// 13. Trigger Identification Worksheet (2 pages)
// ============================================================
async function createTriggerWorksheet() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);

  let y = drawHeader(pages[0], 'Trigger Identification Worksheet', 'Trauma & PTSD — Understanding Your Triggers', helveticaBold, helvetica);
  y = drawWrappedText(pages[0], 'Triggers are stimuli that remind you of a traumatic event and cause a strong emotional or physical reaction. Identifying your triggers is the first step toward managing them effectively. Complete this worksheet with your therapist or on your own.', MARGIN, y, helveticaOblique, 8, GRAY, CONTENT_W);
  y -= 15;

  pages[0].drawText('Types of Triggers — Check all that apply to you:', { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY });
  y -= 18;

  const triggerTypes = [
    ['Sensory', ['Certain sounds', 'Specific smells', 'Visual reminders', 'Physical touch', 'Tastes']],
    ['Situational', ['Specific locations', 'Time of day/year', 'Being alone', 'Crowds', 'Authority figures']],
    ['Emotional', ['Feeling helpless', 'Feeling trapped', 'Anger', 'Shame', 'Vulnerability']],
    ['Interpersonal', ['Conflict', 'Raised voices', 'Rejection', 'Intimacy', 'Being ignored']],
  ];

  for (const [category, items] of triggerTypes) {
    pages[0].drawText(`${category} Triggers:`, { x: MARGIN, y, size: 9, font: helveticaBold, color: NAVY });
    y -= 14;
    for (let i = 0; i < items.length; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      if (col === 0 && i > 0) y -= 16;
      const cx = MARGIN + 10 + col * (CONTENT_W / 3);
      drawCheckbox(pages[0], cx, y - 2, 9);
      pages[0].drawText(items[i], { x: cx + 14, y, size: 8, font: helvetica, color: BLACK });
    }
    y -= 22;
  }

  pages[0].drawText('My Specific Triggers (list your personal triggers):', { x: MARGIN, y, size: 10, font: helveticaBold, color: NAVY });
  y -= 16;
  for (let i = 0; i < 5; i++) {
    pages[0].drawText(`${i + 1}.`, { x: MARGIN + 5, y, size: 9, font: helvetica, color: GRAY });
    drawWriteLine(pages[0], y - 2, CONTENT_W - 15); y -= 18;
  }

  addFooter(pages[0], helvetica);

  // Page 2 — Trigger Response Plan
  y = drawHeader(pages[1], 'Trigger Response Plan', 'For each trigger, plan your coping response', helveticaBold, helvetica);

  for (let t = 1; t <= 3; t++) {
    pages[1].drawText(`Trigger #${t}`, { x: MARGIN, y, size: 11, font: helveticaBold, color: GOLD });
    y -= 16;
    const fields = [
      'Trigger description:',
      'How my body reacts (physical sensations):',
      'Emotions I experience:',
      'Unhelpful coping I want to avoid:',
      'Healthy coping strategy I will use instead:',
      'Grounding technique that works for me:',
    ];
    for (const f of fields) {
      pages[1].drawText(f, { x: MARGIN + 5, y, size: 8, font: helveticaBold, color: NAVY });
      y -= 12;
      drawWriteLine(pages[1], y, CONTENT_W - 10); y -= 16;
    }
    y -= 8;
  }

  addFooter(pages[1], helvetica);
  writeFileSync(join(OUT, '13-trigger-identification.pdf'), await doc.save());
  console.log('✅ 13 - Trigger Identification');
}

// ============================================================
// 14. Client Session Tracker (2 pages)
// ============================================================
async function createSessionTracker() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(2);

  for (let pageIdx = 0; pageIdx < 2; pageIdx++) {
    const p = pages[pageIdx];
    let y = drawHeader(p, `Client Session Tracker${pageIdx === 1 ? ' (cont.)' : ''}`, 'Track sessions, progress, and homework', helveticaBold, helvetica);

    if (pageIdx === 0) {
      p.drawText('Client: ____________________________    Start Date: ____________', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });
      y -= 20;
    }

    const sessionsPerPage = 5;
    const sessionH = 115;

    for (let s = 0; s < sessionsPerPage; s++) {
      if (y - sessionH < 40) break;
      const num = pageIdx * sessionsPerPage + s + 1;

      p.drawRectangle({ x: MARGIN, y: y - sessionH, width: CONTENT_W, height: sessionH, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
      p.drawRectangle({ x: MARGIN, y: y - 18, width: CONTENT_W, height: 18, color: rgb(0.95, 0.95, 0.95) });
      p.drawText(`Session ${num}`, { x: MARGIN + 5, y: y - 14, size: 9, font: helveticaBold, color: NAVY });
      p.drawText('Date: __________  Duration: ______', { x: MARGIN + CONTENT_W - 200, y: y - 14, size: 8, font: helvetica, color: GRAY });

      let sy = y - 32;
      p.drawText('Topics Covered:', { x: MARGIN + 8, y: sy, size: 8, font: helveticaBold, color: NAVY });
      drawWriteLine(p, sy - 2, CONTENT_W - 20); sy -= 16;
      drawWriteLine(p, sy - 2, CONTENT_W - 20); sy -= 18;

      p.drawText('Homework Assigned:', { x: MARGIN + 8, y: sy, size: 8, font: helveticaBold, color: NAVY });
      drawWriteLine(p, sy - 2, CONTENT_W - 20); sy -= 18;

      p.drawText('Next Session Focus:', { x: MARGIN + 8, y: sy, size: 8, font: helveticaBold, color: NAVY });
      drawWriteLine(p, sy - 2, CONTENT_W - 20); sy -= 16;

      p.drawText('Mood (1-10): ___  Progress Rating (1-10): ___', { x: MARGIN + 8, y: sy, size: 8, font: helvetica, color: GRAY });

      y -= sessionH + 5;
    }

    addFooter(p, helvetica);
  }

  writeFileSync(join(OUT, '14-session-tracker.pdf'), await doc.save());
  console.log('✅ 14 - Client Session Tracker');
}

// ============================================================
// 15. Billing & Invoice Template (1 page)
// ============================================================
async function createBillingTemplate() {
  const { doc, pages, helvetica, helveticaBold, helveticaOblique } = await createDoc(1);
  const p = pages[0];

  let y = drawHeader(p, 'Therapy Session Invoice', 'Professional Billing Template', helveticaBold, helvetica);

  // Provider info
  p.drawText('PROVIDER INFORMATION', { x: MARGIN, y, size: 9, font: helveticaBold, color: GOLD });
  y -= 16;
  const providerFields = ['Practice Name:', 'Provider Name & Credentials:', 'NPI Number:', 'Tax ID / EIN:', 'Address:', 'Phone:                                Email:'];
  for (const f of providerFields) { p.drawText(f, { x: MARGIN, y, size: 8, font: helvetica, color: BLACK }); drawWriteLine(p, y - 2, CONTENT_W); y -= 16; }

  y -= 8;
  p.drawText('CLIENT INFORMATION', { x: MARGIN, y, size: 9, font: helveticaBold, color: GOLD });
  y -= 16;
  const clientFields = ['Client Name:', 'Date of Birth:', 'Address:', 'Insurance Provider:                         Policy #:                          Group #:'];
  for (const f of clientFields) { p.drawText(f, { x: MARGIN, y, size: 8, font: helvetica, color: BLACK }); drawWriteLine(p, y - 2, CONTENT_W); y -= 16; }

  y -= 8;
  p.drawText('SERVICES RENDERED', { x: MARGIN, y, size: 9, font: helveticaBold, color: GOLD });
  y -= 16;

  // Table
  const th = ['Date', 'CPT Code', 'Description', 'Duration', 'Fee', 'Paid', 'Balance'];
  const tw = [70, 60, 140, 55, 55, 55, 77];
  p.drawRectangle({ x: MARGIN, y: y - 14, width: CONTENT_W, height: 14, color: rgb(0.95, 0.95, 0.95) });
  let tx = MARGIN;
  for (let i = 0; i < th.length; i++) {
    p.drawText(th[i], { x: tx + 3, y: y - 11, size: 7, font: helveticaBold, color: NAVY });
    tx += tw[i];
  }
  y -= 14;

  for (let r = 0; r < 5; r++) {
    let rx = MARGIN;
    for (let c = 0; c < 7; c++) {
      p.drawRectangle({ x: rx, y: y - 18, width: tw[c], height: 18, borderColor: LIGHT_GRAY, borderWidth: 0.5, color: WHITE });
      rx += tw[c];
    }
    y -= 18;
  }

  // Totals
  y -= 5;
  const totalsX = MARGIN + CONTENT_W - 200;
  p.drawText('Total Charges:', { x: totalsX, y, size: 9, font: helveticaBold, color: NAVY });
  p.drawText('$__________', { x: totalsX + 130, y, size: 9, font: helvetica, color: BLACK }); y -= 16;
  p.drawText('Insurance Paid:', { x: totalsX, y, size: 9, font: helvetica, color: BLACK });
  p.drawText('$__________', { x: totalsX + 130, y, size: 9, font: helvetica, color: BLACK }); y -= 16;
  p.drawText('Client Responsibility:', { x: totalsX, y, size: 9, font: helveticaBold, color: NAVY });
  p.drawText('$__________', { x: totalsX + 130, y, size: 9, font: helveticaBold, color: NAVY }); y -= 20;

  p.drawText('Common CPT Codes:  90791 (Intake)  |  90834 (45-min)  |  90837 (60-min)  |  90847 (Family)  |  90846 (Family w/o client)', {
    x: MARGIN, y, size: 7, font: helveticaOblique, color: GRAY,
  });
  y -= 16;
  p.drawText('Payment Methods:  [ ] Cash  [ ] Check  [ ] Credit Card  [ ] Insurance  [ ] Sliding Scale', { x: MARGIN, y, size: 8, font: helvetica, color: BLACK });

  addFooter(p, helvetica);
  writeFileSync(join(OUT, '15-billing-invoice.pdf'), await doc.save());
  console.log('✅ 15 - Billing & Invoice Template');
}

// ============================================================
// RUN ALL
// ============================================================
async function main() {
  console.log('🔨 Generating 15 therapy PDFs...\n');
  await createThoughtRecord();
  await createCognitiveDistortions();
  await createBehavioralActivation();
  await createDBTDistressTolerance();
  await createEmotionRegulation();
  await createIntakeForm();
  await createTreatmentPlan();
  await createSOAPNotes();
  await createGrounding();
  await createCopingCards();
  await createWorryLog();
  await createSafetyPlan();
  await createTriggerWorksheet();
  await createSessionTracker();
  await createBillingTemplate();
  console.log('\n🎉 All 15 PDFs generated in scripts/products/');
}

main().catch(console.error);
