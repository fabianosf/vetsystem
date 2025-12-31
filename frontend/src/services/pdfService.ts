import api from './api';

export const pdfService = {
  // Ficha do Animal
  async downloadFichaAnimal(animalId: number) {
    const response = await api.get(`/pdf/animal/${animalId}/ficha/`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ficha_animal_${animalId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Prescrição
  async downloadPrescricao(consultaId: number, medicamentos: any[]) {
    const response = await api.post(
      `/pdf/consulta/${consultaId}/prescricao/`,
      { medicamentos },
      { responseType: 'blob' }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `prescricao_${consultaId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Atestado
  async downloadAtestado(
    consultaId: number,
    tipo: 'saude' | 'comparecimento',
    diasRepouso?: number,
    observacoes?: string
  ) {
    const response = await api.post(
      `/pdf/consulta/${consultaId}/atestado/`,
      {
        tipo,
        dias_repouso: diasRepouso,
        observacoes,
      },
      { responseType: 'blob' }
    );
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `atestado_${consultaId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Relatório de Consulta
  async downloadRelatorioConsulta(consultaId: number) {
    const response = await api.get(`/pdf/consulta/${consultaId}/relatorio/`, {
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_consulta_${consultaId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
