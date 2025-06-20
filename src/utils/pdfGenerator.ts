import gmailIcon from '../assets/images/icons/gmail.png';
import logo from '../assets/images/FIVE ONE LOGO QUADRADA FUNDO BRANCO.png';
import instagramIcon from '../assets/images/icons/instagram.png';
import youtubeIcon from '../assets/images/icons/youtube.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomMinisterial, perfisMinisteriais } from '../data/perfisMinisteriais';

export const generatePDF = ({
  name,
  date,
  domPrincipal,
  percentuais,
}: {
  name: string;
  date: string;
  domPrincipal: DomMinisterial;
  percentuais: { dom: string; valor: number }[];
}) => {
  const doc = new jsPDF();

  // Borda da página (A4 padrão = 210mm x 297mm)
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  // Cabeçalho com fundo
  doc.setFillColor(15, 38, 50); // Cor azul escuro
  doc.rect(0, 0, 210, 40, 'F'); // Retângulo de fundo no topo (A4 = 210mm largura)

  // Adicionar logo à esquerda
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'PNG', 10, 5, 30, 30); // posição X=10, Y=5, tamanho=30x30

  // Texto "FIVE ONE MOVEMENT"
  doc.setTextColor(255, 255, 255); // branco
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FIVE ONE MOVEMENT', 60, 20);

  // Dados abaixo do texto
  doc.setFontSize(10);
  doc.text(`Data da Avaliação: ${date}`, 60, 26);
  doc.text(`Nome da Pessoa: ${name}`, 60, 31);
  doc.text(`Dom Ministerial: ${domPrincipal}`, 60, 36);

  // Linha separadora
  doc.setTextColor(0, 0, 0);
  doc.line(10, 45, 200, 45);

  // Seção: Meu Perfil Ministerial
  doc.setFontSize(14);
  doc.text('Meu Perfil Ministerial', 14, 55);

  // Conteúdo do Perfil Ministerial
  const perfilContent = perfisMinisteriais[domPrincipal];

  let currentHeight = 65;
  perfilContent.forEach(paragraph => {
    const splitText = doc.splitTextToSize(paragraph, 180);
    doc.text(splitText, 14, currentHeight);
    currentHeight += splitText.length * 7;
    if (currentHeight > 270) {
      doc.addPage();
      currentHeight = 20;
    }
  });

  // Seção: Percentuais
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Resumo dos Seus Dons', 14, 20);

  const tableData = percentuais.map(p => [p.dom, `${p.valor.toFixed(1)}%`]);

  autoTable(doc, {
    head: [['Dom', 'Percentual']],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: { halign: 'center' },
    headStyles: { fillColor: [49, 75, 86] },
  });

  // Rodapé com barra colorida
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(15, 38, 50);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');

  // Adicionar logo no rodapé (lado esquerdo)
  doc.addImage(img, 'PNG', 10, pageHeight - 18, 12, 12);

  // Adicionar ícone do Instagram
  const instagram = new Image();
  instagram.src = instagramIcon;
  doc.addImage(instagram, 'PNG', 60, pageHeight - 11, 4, 4);

  // Texto do Instagram ao lado do ícone
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('@fiveone.oficial', 66, pageHeight - 8);

  // Adicionar ícone do YouTube
  const youtube = new Image();
  youtube.src = youtubeIcon;
  doc.addImage(youtube, 'PNG', 100, pageHeight - 11, 4, 4);

  // Texto do YouTube ao lado do ícone
  doc.text('@Five_One_Movement', 106, pageHeight - 8);

  // Adicionar ícone do Gmail
  const gmail = new Image();
  gmail.src = gmailIcon;
  doc.addImage(gmail, 'PNG', 150, pageHeight - 11, 4, 4);

  // Texto do email ao lado do ícone
  doc.text('escolafiveone@gmail.com', 156, pageHeight - 8);


  doc.save(`Resultado-${name}.pdf`);
};