import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import math

def add_watermark(base64_image, watermark_text):
    # Decode base64 image
    image_data = base64.b64decode(base64_image)
    image = Image.open(BytesIO(image_data)).convert("RGBA")
    width, height = image.size
    
    # Create a transparent layer the same size as the image
    txt_layer = Image.new("RGBA", image.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(txt_layer)
    
    # Load a font and set a large size relative to the image size
    font_size = int(min(width, height) / 30)  # Adjust for large watermark
    font = ImageFont.load_default(font_size)  # Replace with a TTF file if needed
    
    # Calculate diagonal positioning
    angle = -math.degrees(math.atan(height / width))  # Calculate angle based on image ratio
    
    # Create a temporary text image to hold rotated text
    text_size = draw.textbbox((0, 0), watermark_text, font=font)
    # print(text_size)
    text_width = text_size[2] - text_size[0] 
   
    text_height = text_size[3] - text_size[1] 
    text_image = Image.new("RGBA", (text_width * 2, text_height * 2), (255, 255, 255, 0))
    text_draw = ImageDraw.Draw(text_image)
    text_draw.text((text_width // 2, text_height // 2), watermark_text, fill=(255, 255, 255, 128), font=font)
    text_image = text_image.rotate(angle, expand=1)
    
    # Tile the text across the image diagonally
    # print(width)
    step_x = int(text_width * .8)
    step_y = int(text_height * 3)
    for x in range(-width , width , step_x):
        for y in range(-height , height, step_y):
            txt_layer.paste(text_image, (x, y), text_image)

    
    # Merge layers
    watermarked_image = Image.alpha_composite(image, txt_layer)
    
    # Convert back to RGB and save to a BytesIO buffer
    buffered = BytesIO()
    watermarked_image.convert("RGB").save(buffered, format="JPEG")
    
    # Encode image back to base64
    return base64.b64encode(buffered.getvalue()).decode("utf-8")