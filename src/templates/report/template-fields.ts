import { Criterion } from 'src/criteria/schemas/criterion.schema';
import { Indicator } from 'src/indicators/schemas/indicator.schema';

const docx = require('docx');
const {
  Paragraph,
  AlignmentType,
  ExternalHyperlink,
  TextRun,
  HeadingLevel,
  Tab,
} = docx;

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
        children: [
          'University',
          new Tab(),
          ':',
          new Tab(),
          'Andres Bello Guayana Catholic University',
        ],
      }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        children: [
          'Country',
          new Tab(),
          new Tab(),
          ':',
          new Tab(),
          'Venezuela',
        ],
      }),
    ],
  }),
  new Paragraph({
    children: [
      new TextRun({
        children: ['Web Address', new Tab(), ':', new Tab()],
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
];

export function templateFields(indicator: Indicator, criterion: Criterion) {
  return [
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
          children: [
            'University',
            new Tab(),
            ':',
            new Tab(),
            'Andres Bello Guayana Catholic University',
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          children: [
            'Country',
            new Tab(),
            new Tab(),
            ':',
            new Tab(),
            'Venezuela',
          ],
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          children: ['Web Address', new Tab(), ':', new Tab()],
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
    new Paragraph({
      text: `[${indicator.index}] ${indicator.englishName}`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      text: ``,
    }),
    new Paragraph({
      text: `[${criterion.indicatorIndex}.${criterion.subindex}] ${criterion.englishName}`,
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      text: ``,
    }),
    new Paragraph({
      text: `Description:`,
      heading: HeadingLevel.HEADING_3,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      text: ``,
    }),
    new Paragraph({
      text: `Additional evidence link (i.e., for videos, more images, or other files that are not included in this file):`,
      heading: HeadingLevel.HEADING_3,
      alignment: AlignmentType.LEFT,
    }),
    new Paragraph({
      text: ``,
    }),
  ];
}
