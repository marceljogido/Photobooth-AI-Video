import React from 'react';
import { AnimeIcon } from './icons/AnimeIcon';
import { CartoonIcon } from './icons/CartoonIcon';
import { BigBearIcon } from './icons/BigBearIcon';
import { PixelIcon } from './icons/PixelIcon';
import { StickerIcon } from './icons/StickerIcon';
import { ClaymationIcon } from './icons/ClaymationIcon';
import { ComicIcon } from './icons/ComicIcon';
import { PaintingIcon } from './icons/PaintingIcon';
import { HologramIcon } from './icons/HologramIcon';

interface StyleSelectionScreenProps {
  onStyleSelect: (stylePrompt: string) => void;
}

const styles = [
  { name: 'Anime Vision', prompt: 'A vibrant, high-detail anime art style, similar to a modern feature film. Sharp lines, expressive eyes, and dynamic, cinematic lighting.', icon: AnimeIcon, color: 'text-[#77A6F7]' },
  { name: 'Cartoon Craze', prompt: 'A friendly, colorful 3D cartoon style like a modern animated movie. Soft shading, rounded features, and a warm, inviting look.', icon: CartoonIcon, color: 'text-[#FFC371]' },
  { name: 'Big Bear Hug', prompt: 'A cute, fluffy, friendly big bear character. The style should be adorable and cuddly, with soft fur textures and large, kind eyes.', icon: BigBearIcon, color: 'text-[#8A5FBF]' },
  { name: 'Pixel Hero', prompt: 'Retro 16-bit pixel art style, like a character from a classic SNES RPG with a limited color palette.', icon: PixelIcon, color: 'text-[#82E0AA]' },
  { name: 'Sticker Pop', prompt: 'A vibrant, die-cut vinyl sticker with bold outlines, saturated colors, and a thick white border.', icon: StickerIcon, color: 'text-[#F78AE0]' },
  { name: 'Claymation Model', prompt: 'Charming stop-motion claymation. A handcrafted feel with visible fingerprints and a wobbly aesthetic.', icon: ClaymationIcon, color: 'text-[#F0B27A]' },
  { name: 'Golden Age Comic', prompt: 'Classic 1960s comic book style. Use bold inks, limited colors, and visible halftone dots for shading.', icon: ComicIcon, color: 'text-[#5DADE2]' },
  { name: 'Gothic Oil Painting', prompt: 'A moody, classical oil painting. Dramatic lighting, deep shadows, rich textures, and a painterly quality.', icon: PaintingIcon, color: 'text-[#C0392B]' },
  { name: 'Holographic Glitch', prompt: 'A futuristic, holographic projection with digital glitch effects. Made of shimmering blue light with scan lines.', icon: HologramIcon, color: 'text-[#76D7C4]' },
  { 
    name: 'Blockbuster Hero', 
    prompt: 'Hyper-realistic live-action style, like a blockbuster superhero film. Photorealistic skin and suit textures, dramatic cinematic lighting, motion blur, and professional color grading.', 
    icon: HologramIcon, // Ganti dengan nama ikon Anda
    color: 'text-[#F39C12]' 
  },
  { 
    name: 'Modern Comic', 
    prompt: 'A modern, dynamic comic book style from the 90s/2000s. Sharp, detailed inks, complex cross-hatching for shadows, and vibrant, glossy, digitally-painted colors. Highly energetic poses.', 
    icon: HologramIcon, // Ganti dengan nama ikon Anda
    color: 'text-[#E74C3C]' 
  },
  { 
    name: 'Gritty Noir', 
    prompt: 'A gritty, high-contrast noir style. Deep, oppressive shadows, desaturated colors with occasional pops of a single color (like red), and a sense of urban decay. Think "Sin City" or a dark detective story.', 
    icon: HologramIcon, // Ganti dengan nama ikon Anda
    color: 'text-[#95A5A6]'
  },
];

const StyleSelectionScreen: React.FC<StyleSelectionScreenProps> = ({ onStyleSelect }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
      <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-2 text-center">
        Choose Your Visionary Style
      </h2>
      <p className="text-base md:text-lg text-[#77A6F7] mb-8 text-center">Select a style to transform your portrait.</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 md:gap-4 w-full max-w-4xl">
        {styles.map((style) => {
          const IconComponent = style.icon;
          return (
            <button
              key={style.name}
              onClick={() => onStyleSelect(style.prompt)}
              className="group bg-white/5 border-2 border-transparent hover:border-[#F9D423] hover:bg-white/10 p-3 rounded-xl flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 aspect-square justify-center"
              aria-label={`Select ${style.name} style`}
            >
              <IconComponent className={`w-10 h-10 md:w-12 md:h-12 mb-2 ${style.color}`} />
              <h3 className="text-sm font-semibold text-white text-center leading-tight">{style.name}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelectionScreen;