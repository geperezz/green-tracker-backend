const docx = require('docx');
const { Paragraph, AlignmentType, ExternalHyperlink, TextRun, HeadingLevel } =
  docx;

export const universityInfo = [
  new Paragraph({
    text: `Template for Evidence(s)`,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({
    text: `UI GreenMetric Questionnaire`,
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({ text: '' }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'University	:	Andres Bello Guayana Catholic University',
      }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Country		:	Venezuela',
      }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: 'Web Address	:	',
      }),
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: 'http://guayanaweb.ucab.edu.ve/',
            style: 'Hyperlink',
          }),
        ],
        link: 'http://guayanaweb.ucab.edu.ve/',
      }),
    ],
  }),
  new Paragraph({ text: '' }),
  new Paragraph({ text: '' }),
];
