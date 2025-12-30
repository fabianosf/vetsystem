import { useToast } from '../contexts/ToastContext';
import { pdfService } from '../services/pdfService';

export function usePDF() {
  const toast = useToast();

  const gerarReceitaMedica = (data: any) => {
    try {
      pdfService.gerarReceitaMedica(data);
      toast.success('📄 Receita médica gerada com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao gerar receita médica');
      console.error(error);
    }
  };

  const gerarLaudoExame = (data: any) => {
    try {
      pdfService.gerarLaudoExame(data);
      toast.success('📄 Laudo de exame gerado com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao gerar laudo');
      console.error(error);
    }
  };

  const gerarRelatorioTutores = (tutores: any[]) => {
    try {
      if (tutores.length === 0) {
        toast.warning('⚠️ Nenhum tutor para gerar relatório');
        return;
      }
      pdfService.gerarRelatorioTutores(tutores);
      toast.success('📊 Relatório de tutores gerado com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao gerar relatório');
      console.error(error);
    }
  };

  const gerarRelatorioAnimais = (animais: any[], tutores: any[]) => {
    try {
      if (animais.length === 0) {
        toast.warning('⚠️ Nenhum animal para gerar relatório');
        return;
      }
      pdfService.gerarRelatorioAnimais(animais, tutores);
      toast.success('📊 Relatório de animais gerado com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao gerar relatório');
      console.error(error);
    }
  };

  const gerarFichaConsulta = (data: any) => {
    try {
      pdfService.gerarFichaConsulta(data);
      toast.success('📋 Ficha de consulta gerada com sucesso!');
    } catch (error) {
      toast.error('❌ Erro ao gerar ficha');
      console.error(error);
    }
  };

  return {
    gerarReceitaMedica,
    gerarLaudoExame,
    gerarRelatorioTutores,
    gerarRelatorioAnimais,
    gerarFichaConsulta,
  };
}
