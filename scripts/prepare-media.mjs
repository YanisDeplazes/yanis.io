#!/usr/bin/env node
// Prepares photographs and videos for the web before they go into the repository.
//
//   npm run media                  everything in src/assets/images
//   npm run media -- path/to/dir   only that folder (or single files)
//   npm run media -- --staged      only files staged for the next commit (used by the git hook)
//   npm run media -- --dry-run     show what would change, write nothing
//
// Photos (JPEG, PNG, WebP):
// - turned upright and scaled down to PHOTO_MAX on the long side
// - re-encoded at PHOTO_QUALITY (PNG: lossless compression), colour profile kept
// - the caption (IPTC / XMP) is kept, so the site can show it under the photo
//
// Videos (MP4, MOV), needs ffmpeg (macOS: brew install ffmpeg):
// - scaled down to VIDEO_MAX on the long side, H.264 + AAC, starts playing before it has loaded
// - MOV files become MP4 (every browser plays them) and the paths in src/content are updated
// - when re-encoding would not make a file smaller, it is kept as it is (only cleaned)
//
// Both: all other camera and phone metadata goes, GPS location included, and your name is
// written as artist and copyright. Prepared files are remembered in src/assets/images/.prepared.json,
// so nothing is ever compressed twice. Astro still makes the small sizes at build time;
// this keeps the files in the repository at a sensible size.
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { createReadStream, existsSync } from 'node:fs';
import {
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import exifr from 'exifr';
import sharp from 'sharp';

// ----- Settings -----
const ROOT = 'src/assets/images';
const CONTENT = 'src/content';
const AUTHOR = 'Yanis Deplazes';
const COPYRIGHT = `${AUTHOR}, all rights reserved`;

const PHOTO_MAX = 1500; // px, long side; sharp on screens, too small to print from
const PHOTO_QUALITY = 84; // 80–88 looks the same as the original for photographs

const VIDEO_MAX = 1920; // px, long side (1080p)
const VIDEO_CRF = 23; // 18 = near lossless and big, 23 = good for the web, 28 = small
const VIDEO_PRESET = 'veryfast'; // 'slow' makes files ~15% smaller but takes 2–3× longer

const MANIFEST = path.join(ROOT, '.prepared.json');
const PHOTOS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEOS = new Set(['.mp4', '.mov', '.m4v']);
const SKIP = new Set(['default.png']); // never touched, e.g. the share image

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const stagedOnly = args.includes('--staged');
const targets = args.filter((arg) => !arg.startsWith('--'));

// ----- Helpers -----
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const kind = (file) => {
  const ext = path.extname(file).toLowerCase();
  if (SKIP.has(path.basename(file))) return undefined;
  return PHOTOS.has(ext) ? 'photo' : VIDEOS.has(ext) ? 'video' : undefined;
};
const keyOf = (file) => path.relative(ROOT, file).split(path.sep).join('/');

const hashFile = (file) =>
  new Promise((resolve, reject) => {
    const sha = createHash('sha1');
    createReadStream(file)
      .on('data', (chunk) => sha.update(chunk))
      .on('end', () => resolve(sha.digest('hex')))
      .on('error', reject);
  });

const hasFfmpeg = () =>
  spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;

async function walk(entry) {
  const info = await stat(entry);
  if (!info.isDirectory()) return [entry];
  const children = (await readdir(entry)).filter(
    (name) => !name.startsWith('.'),
  );
  return (
    await Promise.all(children.map((name) => walk(path.join(entry, name))))
  ).flat();
}

function stagedFiles() {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=AM'],
    {
      encoding: 'utf8',
    },
  );
  return output
    .split('\n')
    .filter((file) => file.startsWith(ROOT) && existsSync(file));
}

// ----- Captions -----
// XMP language alternatives come back as a string, an object or a list of them
const toText = (value) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return toText(value[0]);
  if (typeof value === 'object' && 'value' in value) return toText(value.value);
  return undefined;
};

// The caption as written in Lightroom / Photo Mechanic / Bridge, both languages included
async function readDescription(file) {
  try {
    const data = await exifr.parse(file, {
      iptc: true,
      xmp: true,
      exif: false,
      gps: false,
    });
    const text =
      toText(data?.Caption) ??
      toText(data?.description) ??
      toText(data?.ImageDescription);
    return text?.trim() || undefined;
  } catch {
    return undefined;
  }
}

const escapeXml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// A minimal XMP packet: caption, creator and copyright, nothing else (UTF-8, so accents survive)
const xmpPacket = (caption) =>
  `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>` +
  `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
  `<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">` +
  `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(caption)}</rdf:li></rdf:Alt></dc:description>` +
  `<dc:creator><rdf:Seq><rdf:li>${escapeXml(AUTHOR)}</rdf:li></rdf:Seq></dc:creator>` +
  `<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(COPYRIGHT)}</rdf:li></rdf:Alt></dc:rights>` +
  `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;

// ----- Photos -----
async function preparePhoto(file) {
  const ext = path.extname(file).toLowerCase();
  const caption = await readDescription(file); // read before sharp strips the metadata

  // EXIF ImageDescription is meant for plain ASCII, so only accent-free captions go there;
  // the XMP packet below carries every caption
  const ifd0 = { Artist: AUTHOR, Copyright: COPYRIGHT };
  if (caption && /^[\x20-\x7E\s]*$/.test(caption))
    ifd0.ImageDescription = caption;

  let pipeline = sharp(file, { failOn: 'none' })
    .rotate() // apply the camera's orientation, then drop the tag
    .resize({
      width: PHOTO_MAX,
      height: PHOTO_MAX,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .keepIccProfile()
    .withExif({ IFD0: ifd0 });

  // withXmp needs sharp 0.34 or newer
  if (caption && typeof pipeline.withXmp === 'function') {
    pipeline = pipeline.withXmp(xmpPacket(caption));
  }

  if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
  else if (ext === '.webp')
    pipeline = pipeline.webp({ quality: PHOTO_QUALITY });
  else
    pipeline = pipeline.jpeg({
      quality: PHOTO_QUALITY,
      mozjpeg: true,
      progressive: true,
    });

  const output = await pipeline.toBuffer();
  const { width, height } = await sharp(output).metadata();
  if (!dryRun) await writeFile(file, output);
  return {
    file,
    size: output.length,
    note: `${width}×${height}${caption ? ', caption kept' : ''}`,
  };
}

// ----- Videos -----
function probe(file) {
  const output = execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      file,
    ],
    { encoding: 'utf8' },
  );
  const [stream] = JSON.parse(output).streams ?? [];
  return { width: stream?.width ?? 0, height: stream?.height ?? 0 };
}

function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-y', '-v', 'error', ...args], {
    encoding: 'utf8',
  });
  if (result.status !== 0)
    throw new Error(result.stderr.trim() || 'ffmpeg failed');
}

const cleanMetadata = [
  '-map_metadata',
  '-1',
  '-map_metadata:s:v',
  '-1',
  '-map_metadata:s:a',
  '-1',
  '-metadata',
  `artist=${AUTHOR}`,
  '-metadata',
  `copyright=${COPYRIGHT}`,
  '-movflags',
  '+faststart',
];

async function prepareVideo(file) {
  const ext = path.extname(file).toLowerCase();
  const target = ext === '.mp4' ? file : file.slice(0, -ext.length) + '.mp4';
  const temp = path.join(
    path.dirname(target),
    `.${path.basename(target, '.mp4')}.tmp.mp4`,
  );
  const before = (await stat(file)).size;
  const { width, height } = probe(file);
  const needsScaling = Math.max(width, height) > VIDEO_MAX;

  if (dryRun) {
    const action = needsScaling
      ? `scale to ${VIDEO_MAX}px`
      : 're-encode if smaller';
    return {
      file: target,
      size: before,
      note: `${width}×${height}, ${action}${target !== file ? ', becomes .mp4' : ''}`,
    };
  }

  // First pass: re-encode for the web (the first video and audio track only; phones add data tracks)
  ffmpeg([
    '-i',
    file,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0?',
    '-vf',
    `scale=${VIDEO_MAX}:${VIDEO_MAX}:force_original_aspect_ratio=decrease:force_divisible_by=2`,
    '-c:v',
    'libx264',
    '-preset',
    VIDEO_PRESET,
    '-crf',
    String(VIDEO_CRF),
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    ...cleanMetadata,
    temp,
  ]);

  // Already well compressed and small enough: keep the original picture, only clean it
  let note = `H.264, CRF ${VIDEO_CRF}`;
  if (!needsScaling && (await stat(temp)).size >= before) {
    ffmpeg([
      '-i',
      file,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-c',
      'copy',
      ...cleanMetadata,
      temp,
    ]);
    note = 'kept as it was, metadata cleaned';
  }

  await rename(temp, target);
  if (target !== file) await rm(file);
  const { width: w, height: h } = probe(target);
  return {
    file: target,
    size: (await stat(target)).size,
    note: `${w}×${h}, ${note}`,
    renamedFrom: target !== file ? file : undefined,
  };
}

// MOV → MP4: update every path in the content files
async function updateReferences(renames) {
  if (!renames.length) return [];
  const files = (await walk(CONTENT)).filter((file) =>
    /\.(md|mdx|ya?ml|json)$/.test(file),
  );
  const touched = [];
  for (const file of files) {
    let text = await readFile(file, 'utf8');
    let changed = false;
    for (const [from, to] of renames) {
      const oldPath = `/${keyOf(from)}`;
      const newPath = `/${keyOf(to)}`;
      if (text.includes(oldPath)) {
        text = text.split(oldPath).join(newPath);
        changed = true;
      }
    }
    if (changed) {
      await writeFile(file, text);
      touched.push(file);
    }
  }
  return touched;
}

// ----- Run -----
async function main() {
  const manifest = existsSync(MANIFEST)
    ? JSON.parse(await readFile(MANIFEST, 'utf8'))
    : {};
  const files = stagedOnly
    ? stagedFiles()
    : (await Promise.all((targets.length ? targets : [ROOT]).map(walk))).flat();
  const media = files
    .map((file) => path.normalize(file))
    .filter((file) => kind(file));

  const ffmpegReady = hasFfmpeg();
  let skippedVideos = 0;
  let before = 0;
  let after = 0;
  const done = [];
  const renames = [];

  for (const file of media) {
    if ((manifest[keyOf(file)] ?? '') === (await hashFile(file))) continue; // prepared, unchanged
    if (kind(file) === 'video' && !ffmpegReady) {
      skippedVideos += 1;
      continue;
    }

    try {
      const size = (await stat(file)).size;
      const result =
        kind(file) === 'photo'
          ? await preparePhoto(file)
          : await prepareVideo(file);
      before += size;
      after += result.size;
      done.push(result.file);
      console.log(
        `${keyOf(file)}  ${mb(size)} → ${mb(result.size)}  (${result.note})`,
      );

      if (!dryRun) {
        if (result.renamedFrom) {
          renames.push([result.renamedFrom, result.file]);
          delete manifest[keyOf(result.renamedFrom)];
        }
        manifest[keyOf(result.file)] = await hashFile(result.file);
      }
    } catch (error) {
      console.error(`Skipped ${keyOf(file)}: ${error.message}`);
    }
  }

  const touched = await updateReferences(renames);
  touched.forEach((file) => console.log(`Updated paths in ${file}`));

  if (!dryRun && done.length) {
    const sorted = Object.fromEntries(
      Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
    );
    await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
  }

  if (skippedVideos) {
    console.log(
      `\n${skippedVideos} video(s) skipped: ffmpeg is not installed (macOS: brew install ffmpeg).`,
    );
  }
  console.log(
    done.length
      ? `\n${dryRun ? 'Would prepare' : 'Prepared'} ${done.length} file(s): ${mb(before)} → ${mb(after)}`
      : 'Everything is already prepared.',
  );

  // For the git hook: put the prepared files, renamed videos, content and manifest back into the commit
  if (stagedOnly && !dryRun && done.length) {
    const removed = renames.map(([from]) => from);
    execFileSync('git', [
      'add',
      '--all',
      '--',
      ...done,
      ...removed,
      ...touched,
      MANIFEST,
    ]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
