import os
from PIL import Image

def create_seamless_splash_logo():
    # Source icon path using lanchuricon.png
    src_path = r"d:\amrutam\mobile_app\assets\images\lanchuricon.png"
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return

    # Load original icon
    img = Image.open(src_path).convert("RGBA")
    
    # Target size: 1024x1024
    target_dim = 1024
    bg_color = (0, 0, 0, 0) # 100% Transparent PNG Alpha Background

    # Create solid background canvas matching splash screen exactly (#0F172A)
    canvas = Image.new("RGBA", (target_dim, target_dim), bg_color)
    
    # Scale inner emblem to 80% of target_dim for a prominent, large splash screen logo
    scaled_dim = int(target_dim * 0.80)
    resized_img = img.resize((scaled_dim, scaled_dim), Image.Resampling.LANCZOS)
    
    # Center position
    offset = (target_dim - scaled_dim) // 2
    
    # Paste resized image onto canvas
    canvas.paste(resized_img, (offset, offset), resized_img)
    
    # Save processed seamless logo
    output_path = r"d:\amrutam\mobile_app\assets\images\splash_logo_seamless.png"
    canvas.save(output_path, "PNG")
    print(f"✅ Successfully created seamless splash logo at: {output_path}")

    # Copy to all android drawable locations
    drawable_paths = [
        r"d:\amrutam\mobile_app\assets\images\splash-icon.png",
        r"d:\amrutam\mobile_app\assets\images\android-icon-foreground.png",
        r"d:\amrutam\mobile_app\android\app\src\main\res\drawable-mdpi\splashscreen_logo.png",
        r"d:\amrutam\mobile_app\android\app\src\main\res\drawable-hdpi\splashscreen_logo.png",
        r"d:\amrutam\mobile_app\android\app\src\main\res\drawable-xhdpi\splashscreen_logo.png",
        r"d:\amrutam\mobile_app\android\app\src\main\res\drawable-xxhdpi\splashscreen_logo.png",
        r"d:\amrutam\mobile_app\android\app\src\main\res\drawable-xxxhdpi\splashscreen_logo.png",
    ]
    
    for dp in drawable_paths:
        canvas.save(dp, "PNG")
        print(f"Updated: {dp}")

if __name__ == "__main__":
    create_seamless_splash_logo()
