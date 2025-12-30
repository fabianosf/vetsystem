from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from api.models import HealthCheck, Animal
from api.serializers import HealthCheckSerializer, HealthCheckCreateSerializer
from api.services.ai_health_service import AIHealthService


class HealthCheckViewSet(viewsets.ModelViewSet):
    queryset = HealthCheck.objects.select_related('animal').all()
    serializer_class = HealthCheckSerializer
    parser_classes = [MultiPartParser, FormParser]
    
    def create(self, request, *args, **kwargs):
        serializer = HealthCheckCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        animal_id = serializer.validated_data['animal_id']
        image = serializer.validated_data['image']
        
        try:
            animal = Animal.objects.get(id=animal_id)
            analysis_result = AIHealthService.analyze_image(image)
            
            health_check = HealthCheck.objects.create(
                animal=animal,
                image=image,
                **analysis_result
            )
            
            response_serializer = HealthCheckSerializer(health_check)
            
            return Response({
                'success': True,
                'message': 'Análise realizada com sucesso!',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Animal.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Animal não encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Erro: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        urgent_cases = self.get_queryset().filter(urgency_level='ALTA')
        serializer = self.get_serializer(urgent_cases, many=True)
        return Response({
            'success': True,
            'count': urgent_cases.count(),
            'data': serializer.data
        })
