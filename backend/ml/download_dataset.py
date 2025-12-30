#!/usr/bin/env python
"""
Script para baixar e preparar datasets de doenças veterinárias
"""
import os
import requests
import zipfile
from pathlib import Path
import shutil

# URLs de datasets públicos (exemplos)
DATASETS = {
    # Dataset de doenças de pele em cães (exemplo)
    'dog_skin_diseases': {
        'url': 'https://example.com/dog_skin_dataset.zip',  # Substituir por URL real
        'description': 'Dataset de doenças de pele em cães'
    },
    # Adicione mais datasets conforme disponibilidade
}

def download_file(url, destination):
    """Download de arquivo com barra de progresso"""
    print(f"📥 Baixando de {url}...")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as file:
        downloaded = 0
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                file.write(chunk)
                downloaded += len(chunk)
                progress = (downloaded / total_size) * 100
                print(f"\rProgresso: {progress:.1f}%", end='')
    print("\n✅ Download concluído!")

def extract_zip(zip_path, extract_to):
    """Extrair arquivo ZIP"""
    print(f"📦 Extraindo {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print("✅ Extração concluída!")

def organize_dataset(source_dir, dest_dir, train_split=0.7, val_split=0.15):
    """
    Organizar dataset em train/validation/test
    """
    import random
    from collections import defaultdict
    
    print("📁 Organizando dataset...")
    
    # Criar estrutura de diretórios
    splits = ['train', 'validation', 'test']
    for split in splits:
        os.makedirs(os.path.join(dest_dir, split), exist_ok=True)
    
    # Agrupar imagens por classe
    images_by_class = defaultdict(list)
    for root, dirs, files in os.walk(source_dir):
        class_name = os.path.basename(root)
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                images_by_class[class_name].append(os.path.join(root, file))
    
    # Dividir e copiar imagens
    for class_name, images in images_by_class.items():
        random.shuffle(images)
        n_total = len(images)
        n_train = int(n_total * train_split)
        n_val = int(n_total * val_split)
        
        # Criar diretórios de classe em cada split
        for split in splits:
            os.makedirs(os.path.join(dest_dir, split, class_name), exist_ok=True)
        
        # Copiar imagens
        for i, img_path in enumerate(images):
            if i < n_train:
                split = 'train'
            elif i < n_train + n_val:
                split = 'validation'
            else:
                split = 'test'
            
            dest_path = os.path.join(dest_dir, split, class_name, os.path.basename(img_path))
            shutil.copy2(img_path, dest_path)
        
        print(f"  ✅ {class_name}: {n_train} train, {n_val} val, {n_total-n_train-n_val} test")
    
    print("✅ Dataset organizado!")

def create_synthetic_dataset():
    """
    Criar dataset sintético para testes (caso não tenha dataset real)
    """
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
    
    print("🎨 Criando dataset sintético para testes...")
    
    base_dir = Path('ml/datasets')
    classes = [
        'saudavel', 'dermatite', 'alergia', 'sarna', 
        'micose', 'infeccao_bacteriana', 'tumor', 'ferida'
    ]
    
    for split in ['train', 'validation', 'test']:
        n_images = {'train': 50, 'validation': 15, 'test': 15}[split]
        
        for class_name in classes:
            class_dir = base_dir / split / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            for i in range(n_images):
                # Criar imagem sintética
                img = Image.new('RGB', (224, 224), color=(
                    np.random.randint(50, 200),
                    np.random.randint(50, 200),
                    np.random.randint(50, 200)
                ))
                
                # Adicionar texto
                draw = ImageDraw.Draw(img)
                draw.text((10, 10), f"{class_name}\n#{i+1}", fill='white')
                
                # Adicionar padrões simulando textura de pele
                for _ in range(50):
                    x, y = np.random.randint(0, 224, 2)
                    r = np.random.randint(2, 8)
                    draw.ellipse([x-r, y-r, x+r, y+r], fill=(
                        np.random.randint(0, 255),
                        np.random.randint(0, 255),
                        np.random.randint(0, 255)
                    ))
                
                img.save(class_dir / f'{class_name}_{i:03d}.jpg')
    
    print("✅ Dataset sintético criado!")

if __name__ == '__main__':
    print("=" * 60)
    print("🐕 DOWNLOAD E PREPARAÇÃO DE DATASET VETERINÁRIO")
    print("=" * 60)
    
    choice = input("\n1. Baixar dataset real (requer URL)\n2. Criar dataset sintético para testes\n\nEscolha (1 ou 2): ")
    
    if choice == '1':
        print("\n⚠️  Adicione URLs de datasets reais em DATASETS no código")
        print("Exemplos de fontes:")
        print("- Kaggle: https://www.kaggle.com/datasets")
        print("- ImageNet: http://www.image-net.org/")
        print("- Papers with Code: https://paperswithcode.com/datasets")
    elif choice == '2':
        create_synthetic_dataset()
        print("\n✅ Dataset pronto em ml/datasets/")
        print("\n📊 Estatísticas:")
        for split in ['train', 'validation', 'test']:
            split_dir = Path(f'ml/datasets/{split}')
            if split_dir.exists():
                n_images = sum(1 for _ in split_dir.rglob('*.jpg'))
                print(f"  {split}: {n_images} imagens")
