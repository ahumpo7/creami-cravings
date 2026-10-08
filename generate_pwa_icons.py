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

def create_ico_bytes(png_images):
    """Encodes a multi-resolution ICO file containing PNG streams."""
    header = struct.pack('<HHH', 0, 1, len(png_images))
    entries = []
    offset = 6 + len(png_images) * 16
    for width, height, png_bytes in png_images:
        w_byte = 0 if width >= 256 else width
        h_byte = 0 if height >= 256 else height
        entry = struct.pack('<BBBBHHII', w_byte, h_byte, 0, 0, 1, 32, len(png_bytes), offset)
        entries.append(entry)
        offset += len(png_bytes)
    return header + b''.join(entries) + b''.join([p[2] for p in png_images])

def render_creami_icon(x, y, w, h, is_maskable=False):
    # Normalized coordinates (-1.0 to 1.0)
    nx = (x / (w - 1)) * 2.0 - 1.0
    ny = (y / (h - 1)) * 2.0 - 1.0

    # Safe zone scaling for maskable vs standard
    scale = 0.74 if is_maskable else 0.88
    sx = nx / scale
    sy = ny / scale

    # 1. Base squircle with corner smoothing
    if not is_maskable:
        corner_r = 0.28
        ax = abs(nx) - (1.0 - corner_r)
        ay = abs(ny) - (1.0 - corner_r)
        if ax > 0 and ay > 0:
            corner_dist = math.sqrt(ax * ax + ay * ay)
            if corner_dist > corner_r:
                alpha_edge = max(0.0, min(1.0, (corner_r + 0.025 - corner_dist) / 0.025))
                return (0, 0, 0, int(alpha_edge * 255))

    # Dark plum cosmic background
    dist_c = math.sqrt(nx * nx + ny * ny)
    cur_r = int(26 + 18 * max(0, 1.0 - dist_c * 0.8))
    cur_g = int(14 + 10 * max(0, 1.0 - dist_c * 0.8))
    cur_b = int(36 + 22 * max(0, 1.0 - dist_c * 0.8))
    cur_a = 255

    # Glowing neon border ring
    if not is_maskable:
        ring_box = max(abs(nx), abs(ny))
        if ring_box > 0.86:
            ring_factor = min(1.0, (ring_box - 0.86) / 0.07)
            # Magenta to violet gradient based on angle
            angle = math.atan2(ny, nx)
            mix = (math.sin(angle) + 1.0) * 0.5
            ring_r = int(255 * (1 - mix) + 139 * mix)
            ring_g = int(42 * (1 - mix) + 92 * mix)
            ring_b = int(133 * (1 - mix) + 246 * mix)
            cur_r = int(cur_r * (1 - ring_factor) + ring_r * ring_factor)
            cur_g = int(cur_g * (1 - ring_factor) + ring_g * ring_factor)
            cur_b = int(cur_b * (1 - ring_factor) + ring_b * ring_factor)

    # 2. Golden Sparkles
    # Star 1 (upper-left)
    s1_x, s1_y = -0.58, -0.42
    d1 = abs(sx - s1_x) + abs(sy - s1_y)
    if d1 < 0.16:
        glow_s = max(0, 1.0 - d1 / 0.16)
        cur_r = min(255, cur_r + int(250 * glow_s))
        cur_g = min(255, cur_g + int(200 * glow_s))
        cur_b = min(255, cur_b + int(80 * glow_s))

    # Star 2 (right-middle)
    s2_x, s2_y = 0.62, -0.22
    d2 = abs(sx - s2_x) + abs(sy - s2_y)
    if d2 < 0.12:
        glow_s2 = max(0, 1.0 - d2 / 0.12)
        cur_r = min(255, cur_r + int(250 * glow_s2))
        cur_g = min(255, cur_g + int(210 * glow_s2))
        cur_b = min(255, cur_b + int(90 * glow_s2))

    # 3. Creami Pint Cup Body (sy from 0.12 to 0.84)
    cup_t, cup_b = 0.12, 0.84
    if cup_t <= sy <= cup_b:
        prog = (sy - cup_t) / (cup_b - cup_t)
        cup_w = 0.48 - 0.10 * prog
        if abs(sx) <= cup_w:
            # Inside core ice cream
            inner_w = cup_w - 0.035
            if abs(sx) <= inner_w and sy < cup_b - 0.04:
                # Strawberry cream gradient
                core_p = (sy - cup_t) / (cup_b - cup_t)
                cur_r = int(251 - 20 * core_p)
                cur_g = int(113 - 40 * core_p)
                cur_b = int(133 + 60 * core_p)
            else:
                # Dark frosted container edge
                cur_r, cur_g, cur_b = 30, 41, 59

            # Frosted glass reflection ridges
            for rx, rw, op in [(0.0, 0.04, 0.5), (-0.16, 0.03, 0.35), (0.16, 0.025, 0.25)]:
                if abs(sx - rx) < rw:
                    cur_r = min(255, cur_r + int(120 * op))
                    cur_g = min(255, cur_g + int(120 * op))
                    cur_b = min(255, cur_b + int(140 * op))

    # Pint Rim Collar (sy from 0.06 to 0.14)
    if 0.06 <= sy <= 0.14 and abs(sx) <= 0.54:
        # Hot pink rim
        edge_f = max(0.0, 1.0 - (sy - 0.06) / 0.08)
        cur_r = int(255 * edge_f + 225 * (1 - edge_f))
        cur_g = int(42 * edge_f + 29 * (1 - edge_f))
        cur_b = int(133 * edge_f + 72 * (1 - edge_f))
        if abs(sy - 0.07) < 0.02: # Glint on top of rim
            cur_r = min(255, cur_r + 60)
            cur_g = min(255, cur_g + 50)
            cur_b = min(255, cur_b + 50)

    # 4. Ice Cream Soft-Serve Swirl Tiers
    # Tier 1 (Bottom wide swirl: sy from -0.10 to 0.08)
    t1_y = -0.01
    if abs(sy - t1_y) < 0.11:
        t1_w = 0.50 * math.sqrt(max(0.0, 1.0 - ((sy - t1_y) / 0.11) ** 2))
        if abs(sx) < t1_w:
            fold = math.sin((sx / t1_w) * math.pi * 1.5)
            # Delicious strawberry cream shading
            cur_r = int(255 - max(0, fold * 35))
            cur_g = int(210 - max(0, fold * 90))
            cur_b = int(230 - max(0, fold * 60))
            # Bright crest highlight
            if abs(sy - (t1_y - 0.03)) < 0.025:
                cur_r = 255
                cur_g = 250
                cur_b = 255

    # Tier 2 (Middle swirl: sy from -0.28 to -0.06)
    t2_y = -0.17
    if abs(sy - t2_y) < 0.11:
        t2_w = 0.40 * math.sqrt(max(0.0, 1.0 - ((sy - t2_y) / 0.11) ** 2))
        if abs(sx - 0.02) < t2_w:
            fold = math.sin(((sx - 0.02) / t2_w) * math.pi * 1.5)
            cur_r = int(255 - max(0, fold * 25))
            cur_g = int(225 - max(0, fold * 80))
            cur_b = int(240 - max(0, fold * 50))
            if abs(sy - (t2_y - 0.03)) < 0.025:
                cur_r = 255
                cur_g = 252
                cur_b = 255

    # Tier 3 (Top swirl peak: sy from -0.46 to -0.24)
    t3_y = -0.35
    if abs(sy - t3_y) < 0.11:
        t3_w = 0.28 * math.sqrt(max(0.0, 1.0 - ((sy - t3_y) / 0.11) ** 2))
        if abs(sx + 0.01) < t3_w:
            cur_r = 255
            cur_g = 248
            cur_b = 252
            if sy < t3_y:
                cur_r = 255
                cur_g = 255
                cur_b = 255

    # Swirl Curl Tip (sy from -0.52 to -0.42)
    curl_cx, curl_cy = 0.05, -0.48
    curl_d = math.sqrt((sx - curl_cx) ** 2 + (sy - curl_cy) ** 2)
    if curl_d < 0.08:
        cur_r = 255
        cur_g = 255
        cur_b = 255

    # Colorful Sprinkles on Swirl
    sprinkles = [
        (-0.25, 0.00, 56, 189, 248),  # Sky blue
        (0.24, -0.02, 168, 85, 247),  # Purple
        (-0.08, -0.18, 251, 191, 36), # Gold
        (0.18, -0.16, 74, 222, 128)   # Green
    ]
    for sp_x, sp_y, sr, sg, sb in sprinkles:
        sp_d = math.sqrt((sx - sp_x) ** 2 + (sy - sp_y) ** 2)
        if sp_d < 0.032:
            cur_r, cur_g, cur_b = sr, sg, sb

    # 5. Cherry on Top
    # Stem
    stem_dx = sx - 0.18
    stem_dy = sy - (-0.68)
    if -0.74 <= sy <= -0.58 and abs(stem_dx - (sy + 0.65) * 0.8) < 0.022:
        cur_r, cur_g, cur_b = 34, 197, 94

    # Cherry Body
    ch_x, ch_y = 0.14, -0.57
    ch_d = math.sqrt((sx - ch_x) ** 2 + (sy - ch_y) ** 2)
    if ch_d < 0.125:
        # Glossy ruby red
        ch_shade = min(1.0, ch_d / 0.125)
        cur_r = int(255 * (1 - ch_shade * 0.4))
        cur_g = int(30 * (1 - ch_shade))
        cur_b = int(70 * (1 - ch_shade))
        # Glint reflection
        if math.sqrt((sx - (ch_x - 0.04)) ** 2 + (sy - (ch_y - 0.04)) ** 2) < 0.042:
            cur_r = 255
            cur_g = 220
            cur_b = 230

    return (cur_r, cur_g, cur_b, cur_a)

def generate_all():
    print("Generating icons with vibrant ice cream pint & cherry...")
    
    # Generate multi-size PNGs for ICO
    ico_pngs = []
    for s in [16, 32, 48]:
        print(f"Generating favicon {s}x{s}...")
        pdata = create_png_bytes(s, s, lambda x, y, w, h: render_creami_icon(x, y, w, h, False))
        ico_pngs.append((s, s, pdata))
    
    ico_bytes = create_ico_bytes(ico_pngs)
    with open('favicon.ico', 'wb') as f:
        f.write(ico_bytes)
    print(f"Saved favicon.ico ({len(ico_bytes)} bytes)")

    # Standard PWA, Google Search, and Touch Icons
    sizes = [
        ('icon-48.png', 48, False),
        ('icon-96.png', 96, False),
        ('icon-144.png', 144, False),
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

if __name__ == '__main__':
    generate_all()
