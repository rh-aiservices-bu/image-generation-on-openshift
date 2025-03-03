import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

def add_watermark(base64_image, watermark_text):
    # Decode base64 image
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data)).convert("RGBA")
    width, height = image.size
    
    # Create a transparent layer the same size as the image
    txt_layer = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt_layer)
    
    # Load a font and set a large size relative to the image size
    font_size = int(min(width, height) / 13)  # Adjust for large watermark
    font = ImageFont.load_default(font_size)  # You can use a TTF file like ImageFont.truetype("arial.ttf", 50)
    
    # Get text size and position it at the center
    text_size = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = text_size[2] - text_size[0]
    text_height = text_size[3] - text_size[1]
    position = ((width - text_width) // 2, (height - text_height) // 2)
    
    # Draw the text with transparency
    draw.text(position, watermark_text, fill=(255, 255, 255, 128), font=font)
    
    # Merge layers
    watermarked_image = Image.alpha_composite(image, txt_layer)
    
    # Convert back to RGB and save to a BytesIO buffer
    buffered = BytesIO()
    watermarked_image.convert("RGB").save(buffered, format="JPEG")
    
    # Encode image back to base64
    return base64.b64encode(buffered.getvalue()).decode("utf-8")
