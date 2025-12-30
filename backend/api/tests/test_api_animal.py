"""
Testes de API para Animal
"""
import pytest
from rest_framework import status
from rest_framework.test import APIClient

from api.models import Animal
from api.tests.factories import TutorFactory, AnimalFactory


@pytest.mark.django_db
class TestAnimalAPI:
    """Testes da API de Animais"""
    
    def setup_method(self):
        """Setup para cada teste"""
        self.client = APIClient()
        self.list_url = '/api/animais/'
        self.detail_url = lambda pk: f'/api/animais/{pk}/'
    
    def test_list_animais(self):
        """Testa listagem de animais"""
        AnimalFactory.create_batch(5)
        
        response = self.client.get(self.list_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5
    
    def test_create_animal(self):
        """Testa criação de animal"""
        tutor = TutorFactory()
        
        data = {
            'tutor': tutor.id,
            'name': 'Rex',
            'species': 'CACHORRO',
            'breed': 'Labrador',
            'gender': 'M',
            'age': 3,
            'weight': 25.5,
            'color': 'Dourado'
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Rex'
        assert response.data['species'] == 'CACHORRO'
        assert Animal.objects.count() == 1
    
    def test_retrieve_animal(self):
        """Testa recuperação de um animal específico"""
        animal = AnimalFactory()
        
        response = self.client.get(self.detail_url(animal.id))
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == animal.id
        assert response.data['name'] == animal.name
    
    def test_update_animal(self):
        """Testa atualização de animal"""
        animal = AnimalFactory(name='Rex', weight=20.0)
        
        data = {
            'tutor': animal.tutor.id,
            'name': 'Rex Atualizado',
            'species': animal.species,
            'breed': animal.breed,
            'gender': animal.gender,
            'age': animal.age,
            'weight': 25.5,  # Peso atualizado
        }
        
        response = self.client.put(
            self.detail_url(animal.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Rex Atualizado'
        assert float(response.data['weight']) == 25.5
    
    def test_partial_update_animal_weight(self):
        """Testa atualização parcial do peso do animal"""
        animal = AnimalFactory(weight=20.0)
        
        data = {'weight': 22.5}
        
        response = self.client.patch(
            self.detail_url(animal.id),
            data,
            format='json'
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert float(response.data['weight']) == 22.5
    
    def test_delete_animal(self):
        """Testa deleção de animal"""
        animal = AnimalFactory()
        
        response = self.client.delete(self.detail_url(animal.id))
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Animal.objects.count() == 0
    
    def test_filter_animais_by_species(self):
        """Testa filtro de animais por espécie"""
        AnimalFactory(species='CACHORRO')
        AnimalFactory(species='GATO')
        AnimalFactory(species='CACHORRO')
        
        response = self.client.get(self.list_url, {'species': 'CACHORRO'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_filter_animais_by_tutor(self):
        """Testa filtro de animais por tutor"""
        tutor1 = TutorFactory()
        tutor2 = TutorFactory()
        
        AnimalFactory.create_batch(3, tutor=tutor1)
        AnimalFactory.create_batch(2, tutor=tutor2)
        
        response = self.client.get(self.list_url, {'tutor': tutor1.id})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 3
    
    def test_search_animais_by_name(self):
        """Testa busca de animais por nome"""
        AnimalFactory(name='Rex')
        AnimalFactory(name='Bella')
        AnimalFactory(name='Rex Jr')
        
        response = self.client.get(self.list_url, {'search': 'Rex'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2
    
    def test_create_animal_microchip_duplicado(self):
        """Testa criação de animal com microchip duplicado"""
        existing_animal = AnimalFactory(microchip='BR123456789')
        tutor = TutorFactory()
        
        data = {
            'tutor': tutor.id,
            'name': 'Novo Animal',
            'species': 'CACHORRO',
            'breed': 'Poodle',
            'gender': 'F',
            'age': 2,
            'weight': 10.0,
            'microchip': 'BR123456789',  # Microchip duplicado
        }
        
        response = self.client.post(self.list_url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'microchip' in response.data
