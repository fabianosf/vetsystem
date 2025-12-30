from ml.disease_classifier import classifier
import sys

print("\n🧪 Testando classificador...\n")

# Testar com imagem do dataset
image_path = 'ml/datasets/train/dermatite/dermatite_000.jpg'

resultado = classifier.predict(image_path)

print("=" * 60)
print("🔬 RESULTADO DO DIAGNÓSTICO")
print("=" * 60)
print(f"\n📊 Classe Predita: {resultado['classe_predita']}")
print(f"📊 Confiança: {resultado['confianca']:.2f}%")
print(f"\n📝 Descrição:")
print(f"   {resultado['descricao']}")
print(f"\n💡 Recomendação:")
print(f"   {resultado['recomendacao']}")

if resultado['alerta']:
    print(f"\n{resultado['alerta']}")

print(f"\n📈 Top 5 Predições:")
for i, pred in enumerate(resultado['todas_predicoes'][:5], 1):
    print(f"   {i}. {pred['classe']}: {pred['probabilidade']:.2f}%")
print()
