import time
import random
from PIL import Image


class AIHealthService:
    """Serviço para análise de imagens de pets"""
    
    MOCK_CONDITIONS = [
        {
            'name': 'Dermatite Alérgica',
            'category': 'PELE',
            'urgency': 'MEDIA',
            'symptoms': ['Vermelhidão', 'Coceira', 'Perda de pelo'],
            'recommendations': 'Consulte um veterinário dermatologista em 3-7 dias. Evite que o animal coce a região afetada.'
        },
        {
            'name': 'Conjuntivite',
            'category': 'OLHOS',
            'urgency': 'MEDIA',
            'symptoms': ['Olhos vermelhos', 'Secreção ocular', 'Lacrimejamento'],
            'recommendations': 'Agende consulta veterinária. Limpe os olhos com soro fisiológico.'
        },
        {
            'name': 'Ferida Aberta',
            'category': 'PELE',
            'urgency': 'ALTA',
            'symptoms': ['Sangramento', 'Ferimento visível', 'Dor'],
            'recommendations': 'URGENTE: Procure veterinário imediatamente. Mantenha a ferida limpa.'
        },
        {
            'name': 'Animal Saudável',
            'category': 'OUTRO',
            'urgency': 'BAIXA',
            'symptoms': ['Nenhum sintoma visível detectado'],
            'recommendations': 'Animal aparenta estar saudável. Continue com cuidados preventivos.'
        },
    ]
    
    @staticmethod
    def validate_image(image_file):
        """Valida se a imagem é válida"""
        try:
            img = Image.open(image_file)
            img.verify()
            return True
        except Exception as e:
            raise ValueError(f"Imagem inválida: {str(e)}")
    
    @classmethod
    def analyze_image(cls, image_file):
        """Analisa imagem e retorna predição"""
        start_time = time.time()
        
        cls.validate_image(image_file)
        image_file.seek(0)
        
        # MOCK: Selecionar condição aleatória
        condition = random.choice(cls.MOCK_CONDITIONS)
        confidence = random.uniform(75, 98)
        
        processing_time = time.time() - start_time
        
        return {
            'predicted_condition': condition['name'],
            'condition_category': condition['category'],
            'confidence_score': round(confidence, 2),
            'urgency_level': condition['urgency'],
            'detected_symptoms': condition['symptoms'],
            'recommendations': condition['recommendations'],
            'processing_time': round(processing_time, 3),
            'model_version': 'mock-v1.0',
        }
