#!/usr/bin/env python
"""
Script de treinamento RÁPIDO do modelo (otimizado para CPU)
"""

# ========================================
# SUPRIMIR WARNINGS - DEVE VIR ANTES DE TUDO
# ========================================
import os
import warnings

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
warnings.filterwarnings('ignore')
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=DeprecationWarning)

import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from datetime import datetime
import json
import numpy as np

# ========================================
# CONFIGURAÇÕES OTIMIZADAS PARA CPU
# ========================================
IMG_SIZE = 128  # Reduzido de 224 para 128 (4x mais rápido)
BATCH_SIZE = 64  # Aumentado de 32 para 64 (2x mais rápido)
EPOCHS = 15  # Reduzido de 50 para 15 (3.3x mais rápido)
LEARNING_RATE = 0.001

# Diretórios
DATASET_DIR = 'ml/datasets'
TRAIN_DIR = os.path.join(DATASET_DIR, 'train')
VAL_DIR = os.path.join(DATASET_DIR, 'validation')
MODEL_DIR = 'ml/models'
LOGS_DIR = 'ml/training_logs'

# Criar diretórios
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

def create_data_generators():
    """Criar geradores de dados com augmentation reduzido"""
    print("📊 Criando geradores de dados...")
    
    # Data augmentation REDUZIDO para treinar mais rápido
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=15,  # Reduzido
        width_shift_range=0.1,  # Reduzido
        height_shift_range=0.1,  # Reduzido
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    val_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    val_generator = val_datagen.flow_from_directory(
        VAL_DIR,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    return train_generator, val_generator

def create_model(num_classes):
    """Criar modelo LEVE com MobileNetV3Small"""
    print(f"🧠 Criando modelo leve com {num_classes} classes...")
    
    # Usar MobileNetV3Small (mais leve que V2)
    base_model = keras.applications.MobileNetV3Small(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet',
        minimalistic=True  # Versão ainda mais leve
    )
    
    # Congelar TODAS as camadas do base model
    base_model.trainable = False
    
    # Adicionar camadas customizadas SIMPLIFICADAS
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),  # Reduzido de 512
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model, base_model

def compile_model(model):
    """Compilar modelo"""
    print("⚙️  Compilando modelo...")
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']  # Removido top_3_accuracy para acelerar
    )
    
    return model

def create_callbacks(model_name):
    """Criar callbacks otimizados"""
    callbacks = [
        # Salvar melhor modelo
        ModelCheckpoint(
            os.path.join(MODEL_DIR, f'{model_name}_best.h5'),
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=0  # Silencioso
        ),
        
        # Early stopping AGRESSIVO
        EarlyStopping(
            monitor='val_loss',
            patience=5,  # Reduzido de 10 para 5
            restore_best_weights=True,
            verbose=1
        ),
        
        # Reduzir learning rate
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,  # Reduzido de 5 para 3
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    return callbacks

def plot_training_history(history, model_name):
    """Plotar histórico de treinamento"""
    print("📈 Gerando gráficos...")
    
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy
    axes[0].plot(history.history['accuracy'], label='Train', linewidth=2)
    axes[0].plot(history.history['val_accuracy'], label='Validation', linewidth=2)
    axes[0].set_title('Model Accuracy', fontsize=14)
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)
    
    # Loss
    axes[1].plot(history.history['loss'], label='Train', linewidth=2)
    axes[1].plot(history.history['val_loss'], label='Validation', linewidth=2)
    axes[1].set_title('Model Loss', fontsize=14)
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(os.path.join(LOGS_DIR, f'{model_name}_training_history.png'), dpi=150)
    print(f"✅ Gráficos salvos em {LOGS_DIR}/{model_name}_training_history.png")

def save_class_mapping(train_generator, model_name):
    """Salvar mapeamento de classes"""
    class_indices = train_generator.class_indices
    class_mapping = {v: k for k, v in class_indices.items()}
    
    mapping_file = os.path.join(MODEL_DIR, f'{model_name}_classes.json')
    with open(mapping_file, 'w') as f:
        json.dump(class_mapping, f, indent=2)
    
    print(f"✅ Mapeamento de classes salvo em {mapping_file}")
    return class_mapping

def main():
    print("=" * 70)
    print("⚡ TREINAMENTO RÁPIDO - MODELO DE DIAGNÓSTICO VETERINÁRIO")
    print("=" * 70)
    print("\n🚀 Modo: CPU Otimizado (10-15 minutos)")
    print("📊 Imagem: 128x128 (4x mais rápido)")
    print("📦 Batch: 64 (2x mais rápido)")
    print("🔄 Épocas: 15 (3x mais rápido)")
    print("🧠 Modelo: MobileNetV3Small (mais leve)")
    
    # Verificar GPU
    print(f"\n🔧 GPUs disponíveis: {len(tf.config.list_physical_devices('GPU'))}")
    
    # Criar geradores
    train_generator, val_generator = create_data_generators()
    
    num_classes = len(train_generator.class_indices)
    print(f"\n📊 Classes encontradas: {num_classes}")
    print(f"📊 Imagens de treino: {train_generator.samples}")
    print(f"📊 Imagens de validação: {val_generator.samples}")
    
    # Criar modelo
    model, base_model = create_model(num_classes)
    model = compile_model(model)
    
    print("\n📋 Resumo do Modelo:")
    model.summary()
    
    # Callbacks
    model_name = f'vet_disease_classifier_fast_{datetime.now().strftime("%Y%m%d")}'
    callbacks = create_callbacks(model_name)
    
    # Treinar
    print("\n🚀 Iniciando treinamento RÁPIDO...")
    print("⏱️  Tempo estimado: 10-15 minutos\n")
    
    start_time = datetime.now()
    
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds() / 60
    
    # Salvar modelo final
    final_model_path = os.path.join(MODEL_DIR, f'{model_name}_final.h5')
    model.save(final_model_path)
    print(f"\n✅ Modelo final salvo em {final_model_path}")
    
    # Salvar mapeamento de classes
    class_mapping = save_class_mapping(train_generator, model_name)
    
    # Plotar histórico
    plot_training_history(history, model_name)
    
    # Avaliar modelo
    print("\n📊 Avaliação Final:")
    results = model.evaluate(val_generator, verbose=0)
    print(f"  Loss: {results[0]:.4f}")
    print(f"  Accuracy: {results[1]:.4f}")
    
    print("\n" + "=" * 70)
    print("✅ TREINAMENTO CONCLUÍDO COM SUCESSO!")
    print("=" * 70)
    print(f"\n⏱️  Tempo total: {duration:.1f} minutos")
    print(f"\n📁 Arquivos gerados:")
    print(f"  - Modelo: {final_model_path}")
    print(f"  - Classes: {MODEL_DIR}/{model_name}_classes.json")
    print(f"  - Gráficos: {LOGS_DIR}/{model_name}_training_history.png")
    
    print("\n💡 Dica: Para melhor acurácia, use Google Colab com GPU!")
    
    return model, class_mapping

if __name__ == '__main__':
    main()
