import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/videos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Download source images and create video loops with ffmpeg
const destinations = [
  {
    name: 'manali',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1280&q=80',
    effect: "zoompan=z='min(zoom+0.0012,1.15)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=854x480",
  },
  {
    name: 'goa',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1280&q=80',
    effect: "zoompan=z='min(zoom+0.0012,1.15)':d=125:x='iw/2-(iw/zoom/2)+sin(in/10)*2':y='ih/2-(ih/zoom/2)':s=854x480",
  },
  {
    name: 'jaipur',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1280&q=80',
    effect: "zoompan=z='min(zoom+0.001,1.12)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=854x480",
  },
  {
    name: 'bali',
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1280&q=80',
    effect: "zoompan=z='min(zoom+0.0012,1.15)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+sin(in/8)*2':s=854x480",
  },
  {
    name: 'kyoto',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1280&q=80',
    effect: "zoompan=z='min(zoom+0.0012,1.15)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=854x480",
  },
];

console.log('Generating live destination videos...');

for (const dest of destinations) {
  const imgPath = path.join(outDir, `${dest.name}_source.jpg`);
  const vidPath = path.join(outDir, `${dest.name}_live.mp4`);

  try {
    console.log(`Downloading ${dest.name} photo...`);
    execSync(`curl -s -L -o "${imgPath}" "${dest.url}"`);

    console.log(`Rendering ${dest.name}_live.mp4 with ffmpeg...`);
    execSync(
      `ffmpeg -y -loop 1 -i "${imgPath}" -vf "${dest.effect}" -t 5 -c:v libx264 -pix_fmt yuv420p -r 25 -an "${vidPath}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Created ${vidPath}`);
  } catch (err) {
    console.warn(`Failed for ${dest.name}:`, err.message);
  }
}

console.log('Done generating destination live videos!');
