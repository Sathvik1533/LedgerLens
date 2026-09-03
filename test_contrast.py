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
    "Candidate 1 (Institutional Navy)": ["#0A1128", "#121C3A", "#256EFF", "#D72638", "#0B9F7B"],
    "Candidate 2 (Graphite & Gold)": ["#1A1A1D", "#26262B", "#C99700", "#C92A2A", "#2F8F5B"],
    "Candidate 3 (Slate & Teal)": ["#181C25", "#222733", "#14B8A6", "#F43F5E", "#10B981"],
    "Candidate 4 (Obsidian & Indigo)": ["#09090B", "#18181B", "#6366F1", "#EF4444", "#22C55E"],
    "Candidate 5 (Midnight Forest)": ["#0F1714", "#1A2421", "#0EA5E9", "#E11D48", "#34D399"],
}

print("Contrast Ratios against White (#FFFFFF) text on the Surface color:")
for name, colors in palettes.items():
    surface = colors[1]
    cr = contrast_ratio(surface, "#FFFFFF")
    print(f"{name}: Surface {surface} vs #FFFFFF -> {cr:.2f}:1")
    url = f"https://coolors.co/palette/{'-'.join([c.strip('#').lower() for c in colors])}"
    print(f"URL: {url}")
    print()
