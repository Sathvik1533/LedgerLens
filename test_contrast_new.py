import math

def hex_to_rgb(hex_code):
    hex_code = hex_code.lstrip('#')
    return tuple(int(hex_code[i:i+2], 16) for i in (0, 2, 4))

def luminance(r, g, b):
    a = [v / 255 for v in (r, g, b)]
    for i, v in enumerate(a):
        a[i] = v / 12.92 if v <= 0.03928 else math.pow((v + 0.055) / 1.055, 2.4)
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast_ratio(hex1, hex2):
    lum1 = luminance(*hex_to_rgb(hex1))
    lum2 = luminance(*hex_to_rgb(hex2))
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)

palettes = {
    "Candidate 6: Deep Monolith (Blue-Gray & Amber)": ["#0F1115", "#1A1D24", "#F5A623", "#E63946", "#2A9D8F"],
    "Candidate 7: Vercel-esque (Onyx & Frost Blue)": ["#111111", "#1E1E1E", "#3B82F6", "#EF4444", "#10B981"],
    "Candidate 8: Brutalist Cocoa (Dark Brown & Vermilion)": ["#141110", "#211D1C", "#FF4500", "#DC143C", "#32CD32"],
    "Candidate 9: Twilight (Deep Purple-Grey & Mint)": ["#13111C", "#1F1D2B", "#00B4D8", "#FF006E", "#06D6A0"],
    "Candidate 10: Executive Charcoal (Graphite & Sapphire)": ["#121314", "#1C1D1F", "#4361EE", "#F72585", "#4CC9F0"],
}

print("Contrast Ratios against White (#FFFFFF) text on the Surface color:")
for name, colors in palettes.items():
    surface = colors[1]
    cr = contrast_ratio(surface, "#FFFFFF")
    print(f"{name}: Surface {surface} vs #FFFFFF -> {cr:.2f}:1")
    url = f"https://coolors.co/palette/{'-'.join([c.strip('#').lower() for c in colors])}"
    print(f"URL: {url}")
    print()
