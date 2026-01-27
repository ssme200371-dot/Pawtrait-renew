
// Professional Style Prompts with Quality Guarantee
export const STYLE_PROMPTS = {
  // [Common] Quality Assurance
  qualityPrefix: "Masterpiece, best quality, 8k resolution, ",
  qualitySuffix: ", highly detailed, artistic composition, professional art.",

  // 1. 💧 Watercolor
  watercolor: "Soft watercolor painting of a cute pet, wet-on-wet technique, rough white paper texture, delicate brushstrokes, pastel colors, dreamy atmosphere, soft pigment blending, artistic watercolor.",

  // 2. 🖼️ Oil Painting
  oil_painting: "Classic oil painting of a pet, thick impasto brushstrokes, textured canvas, vibrant colors, artistic flair, Van Gogh inspired style, expressive strokes, traditional art.",

  // 3. ✏️ Sketch
  sketch: "Charcoal and graphite pencil sketch of a cute pet on paper, rough paper grain, monochrome, hand-drawn lines, cross-hatching shading, artistic pencil drawing, detailed fur texture.",

  // 4. 🖌️ Digital Painting
  digital_painting: "Premium digital illustration of a pet, concept art style, smooth shading, dramatic lighting, clean lines, ArtStation quality, highly polished, fantasy art.",

  // 5. 👾 Pixel Art
  pixel_art: "Retro 16-bit pixel art of a cute pet, visible distinct pixels, limited color palette, game sprite style, arcade aesthetic, sharp edges, no anti-aliasing, blocky, nostalgic.",

  // 6. 💬 Webtoon
  webtoon: "Korean webtoon manhwa style pet character, cel-shaded, bold outlines, vibrant colors, 2D illustration, anime aesthetic, flat coloring, dramatic composition, comic book style, safe for work.",

  // 7. 💥 Pop Art
  pop_art: "Pop Art style pet portrait, Andy Warhol inspired, halftone dots, bold black outlines, vibrant primary colors, high contrast, poster art, flat look, screen print texture, artistic rendering.",

  // 8. 🤖 Cyberpunk
  cyberpunk: "Futuristic Cyberpunk pet, neon lights, glowing effects, sci-fi atmosphere, night city background, high contrast, chromatic aberration, synthwave, mechanical details, artistic sci-fi concept.",

  // 9. 🗿 Marble Statue
  marble_statue: "Classical white marble bust sculpture of a pet, carved stone texture, museum lighting, static pose, roman art style, 3d render of an animal statue, monochromatic white, subsurface scattering.",

  // 10. 🧊 3D Animation
  three_d_animation: "3D Disney Pixar style pet character, cute stylized 3d render, big expressive eyes, fluffy fur texture, octane render, soft studio lighting, volumetric 3d, cartoon aesthetic, unreal engine 5, family friendly.",

  // 11. 🌸 Emotional Anime
  emotional_anime: "Studio Ghibli style cute pet illustration, soft anime art of an animal, watercolor background, warm sunlight, sentimental, 2D animation frame, family friendly, hand drawn.",

  // 12. 🎨 Renaissance
  renaissance: "Renaissance royal portrait of a pet wearing vintage noble clothes, oil on wood, regal atmosphere, intricate clothing details, museum masterpiece, Leonardo da Vinci style, classic art."
};

/**
 * Constructs the full prompt by combining the quality prefix, the specific style description, and the quality suffix.
 * @param styleId The ID key of the style (e.g., 'watercolor', 'cyberpunk')
 */
export const getEnhancedPrompt = (styleId: string): string => {
  // Use the ID to fetch the prompt description. Fallback to the ID itself if not found.
  // We use 'as keyof typeof STYLE_PROMPTS' to satisfy TypeScript indexing.
  const styleDescription = (STYLE_PROMPTS as any)[styleId] || styleId;
  
  // Combine: Prefix + Style Description + Suffix
  return `${STYLE_PROMPTS.qualityPrefix}${styleDescription}${STYLE_PROMPTS.qualitySuffix}`;
};