import struct
import zlib
import math
import os

def create_png_bytes(width, height, get_pixel_func):
    """Encodes raw RGBA pixels into standard PNG bytes without any external libraries."""
    raw = bytearray()
    for y in range(height):
        raw.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw.extend((
                max(0, min(255, int(r))),
                max(0, min(255, int(g))),
                max(0, min(255, int(b))),
                max(0, min(255, int(a)))
            ))
    
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')

def render_creami_icon(x, y, w, h, is_maskable=False):
    # Normalized coordinates (-1.0 to 1.0)
    nx = (x / (w - 1)) * 2.0 - 1.0
    ny = (y / (h - 1)) * 2.0 - 1.0

    # Maskable icons need content contained in the inner 80% safe zone
    scale = 0.72 if is_maskable else 0.88
    sx = nx / scale
    sy = ny / scale

    # Background: dark cosmic gradient with subtle radial glow
    dist_center = math.sqrt(nx * nx + ny * ny)
    bg_r = 12 + max(0, int(25 * (1.0 - dist_center * 0.7)))
    bg_g = 15 + max(0, int(15 * (1.0 - dist_center * 0.7)))
    bg_b = 26 + max(0, int(45 * (1.0 - dist_center * 0.7)))

    # Outer rounded squircle background (if not maskable, soften edges)
    # Maskable covers entire area; standard icons have sleek rounded rect
    if not is_maskable:
        # Corner radius check
        corner_r = 0.28
        ax = abs(nx) - (1.0 - corner_r)
        ay = abs(ny) - (1.0 - corner_r)
        if ax > 0 and ay > 0:
            corner_dist = math.sqrt(ax * ax + ay * ay)
            if corner_dist > corner_r:
                # Anti-aliased transparent edge
                alpha_edge = max(0.0, min(1.0, (corner_r + 0.03 - corner_dist) / 0.03))
                return (0, 0, 0, int(alpha_edge * 255))

    # Base background color
    cur_r, cur_g, cur_b, cur_a = bg_r, bg_g, bg_b, 255

    # Glowing emblem circle in center
    emblem_radius = 0.76
    emblem_dist = math.sqrt(sx * sx + (sy + 0.05) ** 2)
    if emblem_dist < emblem_radius:
        # Outer ring glow: magenta/pink to purple gradient
        angle = math.atan2(sy + 0.05, sx)
        glow_factor = (emblem_dist / emblem_radius)
        if emblem_dist > emblem_radius - 0.08:
            ring_alpha = min(1.0, (emblem_dist - (emblem_radius - 0.08)) / 0.04)
            cur_r = int(cur_r * (1 - ring_alpha) + (236 if angle > 0 else 168) * ring_alpha)
            cur_g = int(cur_g * (1 - ring_alpha) + (72 if angle > 0 else 85) * ring_alpha)
            cur_b = int(cur_b * (1 - ring_alpha) + (153 if angle > 0 else 247) * ring_alpha)
        else:
            # Inner circle fill
            inner_glow = 1.0 - (emblem_dist / (emblem_radius - 0.08))
            cur_r = min(255, cur_r + int(40 * inner_glow))
            cur_g = min(255, cur_g + int(10 * inner_glow))
            cur_b = min(255, cur_b + int(45 * inner_glow))

    # Creami Pint Cup shape (trapezoid at bottom: sy between 0.08 and 0.55)
    cup_top_y = 0.08
    cup_bot_y = 0.52
    if cup_top_y <= sy <= cup_bot_y:
        cup_prog = (sy - cup_top_y) / (cup_bot_y - cup_top_y)
        cup_half_w = 0.38 - 0.08 * cup_prog
        if abs(sx) <= cup_half_w:
            # Pint body: frosted glass gradient
            rim_dist = cup_half_w - abs(sx)
            cup_shade = 0.7 + 0.3 * (rim_dist / cup_half_w)
            # Tinted with soft purple/cyan
            cur_r = int(28 * cup_shade + 180 * (1 - cup_shade))
            cur_g = int(36 * cup_shade + 120 * (1 - cup_shade))
            cur_b = int(62 * cup_shade + 230 * (1 - cup_shade))

    # Creami Pint Rim Ring
    if abs(sy - 0.08) < 0.035 and abs(sx) < 0.42:
        cur_r = 236
        cur_g = 72
        cur_b = 153

    # Ice Cream Soft-Serve Swirls (sy from -0.52 to 0.08)
    # Tier 1 (bottom swirl)
    t1_y = -0.04
    t1_w = 0.36 * (1.0 - ((sy - t1_y) / 0.16) ** 2) if abs(sy - t1_y) < 0.14 else 0
    if t1_w > 0 and abs(sx) < t1_w:
        shading = 0.85 + 0.15 * math.sin(sx * 10)
        cur_r = int(253 * shading)
        cur_g = int(232 * shading)
        cur_b = int(242 * shading)

    # Tier 2 (middle swirl)
    t2_y = -0.20
    t2_w = 0.28 * (1.0 - ((sy - t2_y) / 0.14) ** 2) if abs(sy - t2_y) < 0.12 else 0
    if t2_w > 0 and abs(sx - 0.02) < t2_w:
        shading = 0.9 + 0.1 * math.sin(sx * 12)
        cur_r = int(244 * shading)
        cur_g = int(114 * shading)
        cur_b = int(182 * shading)

    # Tier 3 (top swirl tip)
    t3_y = -0.34
    t3_w = 0.18 * (1.0 - ((sy - t3_y) / 0.12) ** 2) if abs(sy - t3_y) < 0.10 else 0
    if t3_w > 0 and abs(sx + 0.01) < t3_w:
        cur_r = 255
        cur_g = 255
        cur_b = 255

    # Swirl peak curl at the very top (cherry on top)
    cherry_cx = 0.04
    cherry_cy = -0.44
    cherry_dist = math.sqrt((sx - cherry_cx) ** 2 + (sy - cherry_cy) ** 2)
    if cherry_dist < 0.075:
        cur_r = 239
        cur_g = 68
        cur_b = 68
        if cherry_dist < 0.03 and sx < cherry_cx:
            # Highlight glint
            cur_r, cur_g, cur_b = 255, 200, 200

    return (cur_r, cur_g, cur_b, cur_a)

def generate_all():
    sizes = [
        ('icon-192.png', 192, False),
        ('icon-512.png', 512, False),
        ('icon-maskable-192.png', 192, True),
        ('icon-maskable-512.png', 512, True),
        ('apple-touch-icon.png', 180, False)
    ]

    for fname, size, is_maskable in sizes:
        print(f"Generating {fname} ({size}x{size})...")
        png_data = create_png_bytes(size, size, lambda x, y, w, h: render_creami_icon(x, y, w, h, is_maskable))
        with open(fname, 'wb') as f:
            f.write(png_data)
        print(f"Saved {fname} ({len(png_data)} bytes)")

    # SVG Favicon / Vector Icon
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1026"/>
      <stop offset="100%" stop-color="#090c15"/>
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="50%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
    <linearGradient id="swirlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#fbcfe8"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="none" stroke="url(#ringGrad)" stroke-width="8" opacity="0.6"/>

  <!-- Glowing Emblem Circle -->
  <circle cx="256" cy="256" r="190" fill="#131726" stroke="url(#ringGrad)" stroke-width="12" filter="url(#glow)"/>

  <!-- Pint Cup -->
  <path d="M 160 280 L 180 400 Q 185 415 200 415 L 312 415 Q 327 415 332 400 L 352 280 Z" fill="#20273f" stroke="#8b5cf6" stroke-width="6"/>
  <!-- Rim -->
  <rect x="150" y="270" width="212" height="18" rx="9" fill="#ec4899"/>

  <!-- Swirl Tiers -->
  <!-- Tier 1 -->
  <path d="M 170 270 Q 256 220 342 270 Q 310 230 256 230 Q 200 230 170 270 Z" fill="#f472b6"/>
  <!-- Tier 2 -->
  <path d="M 190 235 Q 256 185 322 235 Q 300 195 256 195 Q 210 195 190 235 Z" fill="#fbcfe8"/>
  <!-- Tier 3 Tip -->
  <path d="M 220 200 Q 256 150 285 190 Q 275 160 256 160 Q 235 160 220 200 Z" fill="#ffffff"/>

  <!-- Cherry / Sparkle -->
  <circle cx="268" cy="145" r="22" fill="#ef4444" filter="url(#glow)"/>
  <circle cx="262" cy="139" r="6" fill="#ffffff" opacity="0.8"/>
  <path d="M 268 123 Q 285 95 315 105" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round"/>
</svg>
'''
    with open('favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print("Saved favicon.svg")

if __name__ == '__main__':
    generate_all()
