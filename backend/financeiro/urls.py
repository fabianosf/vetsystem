from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaFinanceiraViewSet, FormaPagamentoViewSet,
    TransacaoViewSet, FluxoCaixaViewSet
)

router = DefaultRouter()
router.register(r'categorias', CategoriaFinanceiraViewSet, basename='categoria')
router.register(r'formas-pagamento', FormaPagamentoViewSet, basename='forma-pagamento')
router.register(r'transacoes', TransacaoViewSet, basename='transacao')
router.register(r'fluxo-caixa', FluxoCaixaViewSet, basename='fluxo-caixa')

urlpatterns = [
    path('', include(router.urls)),
]
