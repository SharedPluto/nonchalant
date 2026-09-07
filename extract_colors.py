from PIL import Image
import collections

img = Image.open(r'C:\Users\bryan\nonchalant\public\assets\logo-wide.png').convert('RGBA')

# Sample colors from known regions
w, h = img.size

# Grey "Non" region (left side, middle)
grey_x = int(w * 0.15)
grey_y = int(h * 0.5)

# Purple "Chalant" region (right side, middle)  
purple_x = int(w * 0.55)
purple_y = int(h * 0.5)

# Sample a small area and get most common non-transparent color
def sample_color(cx, cy, radius=10):
    colors = []
    for x in range(max(0, cx-radius), min(w, cx+radius)):
        for y in range(max(0, cy-radius), min(h, cy+radius)):
            r, g, b, a = img.getpixel((x, y))
            if a > 128:  # Not transparent
                colors.append((r, g, b))
    if not colors:
        return None
    # Return most common color
    counter = collections.Counter(colors)
    return counter.most_common(1)[0][0]

grey = sample_color(grey_x, grey_y)
purple = sample_color(purple_x, purple_y)

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(*rgb)

print(f'Grey Non: {rgb_to_hex(grey)} (RGB: {grey})')
print(f'Purple Chalant: {rgb_to_hex(purple)} (RGB: {purple})')

# Also check the N mark favicon
n_img = Image.open(r'C:\Users\bryan\nonchalant\public\assets\logo.png').convert('RGBA')
nw, nh = n_img.size
n_grey = sample_color(int(nw*0.5), int(nh*0.5), 20)
print(f'Logo PNG grey N: {rgb_to_hex(n_grey)} (RGB: {n_grey})')
