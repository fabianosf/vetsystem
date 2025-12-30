#!/usr/bin/env python
"""Criar dataset sintético mais realista"""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
from pathlib import Path
import random

print("🎨 Criando dataset sintético MELHORADO...")

base_dir = Path('ml/datasets')
classes = {
    'saudavel': (200, 180, 160),      # Tom de pele saudável
    'dermatite': (220, 100, 100),     # Vermelho inflamado
    'alergia': (255, 150, 150),       # Rosa avermelhado
    'sarna': (180, 160, 140),         # Tom seco/escamoso
    'micose': (200, 200, 180),        # Manchas claras
    'infeccao_bacteriana': (180, 140, 100),  # Tom amarelado/pus
    'tumor': (160, 120, 120),         # Massa escura
    'ferida': (200, 80, 80)           # Vermelho sangue
}

for split in ['train', 'validation', 'test']:
    n_images = {'train': 100, 'validation': 30, 'test': 30}[split]
    
    for class_name, base_color in classes.items():
        class_dir = base_dir / split / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        
        for i in range(n_images):
            # Criar imagem base com variação
            img = Image.new('RGB', (224, 224))
            pixels = img.load()
            
            # Preencher com cor base + ruído
            for x in range(224):
                for y in range(224):
                    noise = random.randint(-30, 30)
                    r = max(0, min(255, base_color[0] + noise))
                    g = max(0, min(255, base_color[1] + noise))
                    b = max(0, min(255, base_color[2] + noise))
                    pixels[x, y] = (r, g, b)
            
            # Adicionar texturas específicas por doença
            draw = ImageDraw.Draw(img)
            
            if class_name == 'saudavel':
                # Textura lisa
                img = img.filter(ImageFilter.SMOOTH_MORE)
            
            elif class_name == 'dermatite':
                # Manchas vermelhas
                for _ in range(random.randint(5, 15)):
                    x, y = random.randint(0, 200), random.randint(0, 200)
                    r = random.randint(15, 40)
                    draw.ellipse([x, y, x+r, y+r], fill=(255, 80, 80, 180))
            
            elif class_name == 'alergia':
                # Muitas manchas pequenas
                for _ in range(random.randint(20, 50)):
                    x, y = random.randint(0, 220), random.randint(0, 220)
                    draw.ellipse([x, y, x+5, y+5], fill=(255, 120, 120))
            
            elif class_name == 'sarna':
                # Áreas escamosas
                for _ in range(random.randint(10, 20)):
                    x, y = random.randint(0, 200), random.randint(0, 200)
                    draw.rectangle([x, y, x+15, y+15], fill=(160, 150, 130))
            
            elif class_name == 'micose':
                # Círculos característicos
                for _ in range(random.randint(2, 5)):
                    x, y = random.randint(20, 180), random.randint(20, 180)
                    r = random.randint(20, 40)
                    draw.ellipse([x-r, y-r, x+r, y+r], outline=(255, 255, 200), width=3)
            
            elif class_name == 'infeccao_bacteriana':
                # Pontos de pus
                for _ in range(random.randint(10, 25)):
                    x, y = random.randint(0, 220), random.randint(0, 220)
                    draw.ellipse([x, y, x+8, y+8], fill=(255, 255, 150))
            
            elif class_name == 'tumor':
                # Massa única maior
                x, y = random.randint(50, 150), random.randint(50, 150)
                r = random.randint(30, 60)
                draw.ellipse([x-r, y-r, x+r, y+r], fill=(140, 100, 100))
            
            elif class_name == 'ferida':
                # Ferida aberta
                x, y = random.randint(50, 150), random.randint(50, 150)
                points = [(x+random.randint(-30, 30), y+random.randint(-30, 30)) for _ in range(6)]
                draw.polygon(points, fill=(200, 60, 60))
            
            # Aplicar filtros para mais realismo
            img = img.filter(ImageFilter.GaussianBlur(random.uniform(0.5, 2)))
            
            # Ajustar contraste e brilho aleatoriamente
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(random.uniform(0.8, 1.2))
            
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(random.uniform(0.9, 1.1))
            
            # Salvar
            img.save(class_dir / f'{class_name}_{i:03d}.jpg', quality=85)
    
    print(f"✅ {split}: {n_images * len(classes)} imagens")

print("\n✅ Dataset sintético MELHORADO criado!")
print("📊 Total: 1280 imagens (160 por classe)")
