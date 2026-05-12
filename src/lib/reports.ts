import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const generateResidentReport = (residents: any[]) => {
  const doc = new jsPDF() as any;
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm');

  // Header
  doc.setFontSize(10);
  doc.text('Republic of the Philippines', 105, 15, { align: 'center' });
  doc.text('Province of Misamis Oriental', 105, 20, { align: 'center' });
  doc.text('Municipality of Tagoloan', 105, 25, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BARANGAY BALUARTE', 105, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text('OFFICE OF THE BARANGAY SECRETARY', 105, 38, { align: 'center' });
  doc.line(20, 42, 190, 42);

  doc.setFontSize(12);
  doc.text('MASTER LIST OF RESIDENTS', 105, 52, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Generated on: ${timestamp}`, 190, 52, { align: 'right' });

  // Table
  const tableData = residents.map((r, index) => [
    index + 1,
    `${r.lastName}, ${r.firstName}`,
    r.gender,
    r.birthDate,
    r.voterStatus,
    r.isSeniorCitizen ? 'YES' : 'NO',
    r.isPWD ? 'YES' : 'NO'
  ]);

  doc.autoTable({
    startY: 60,
    head: [['#', 'Name', 'Gender', 'Birth Date', 'Voters', 'Senior', 'PWD']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 8 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    doc.text('Barangay Baluarte MIS - Confidential Document', 20, 285);
  }

  doc.save(`Resident_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
