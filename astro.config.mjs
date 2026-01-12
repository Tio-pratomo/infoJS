// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

import { dataLectures } from './dataLectures';
import { generateSessionClass } from './generateSessionClass';

function generateSidebar() {
  return dataLectures.map((obj) => ({
    label: obj.name,
    collapsed: true,
    items: generateSessionClass(
      obj.lecturesCount,
      `${obj.name.toLowerCase().replaceAll(' ', '')}/sesi`
    ),
  }));
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    mermaid({
      theme: 'neutral',
      autoTheme: true,
    }),
    starlight({
      title: 'Info JS',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/withastro/starlight',
        },
      ],
      sidebar: generateSidebar(),
    }),
  ],
});
