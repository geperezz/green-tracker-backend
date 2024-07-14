const docx = require('docx');
const {
  Paragraph,
  ImageRun,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
} = docx;
import { readFileSync } from 'fs';

export const header = [
  new Paragraph({
    children: [
      new ImageRun({
        data: readFileSync('src/templates/report/assets/ucabLogo.png'),
        transformation: {
          width: 283,
          height: 44,
        },
      }),
      new ImageRun({
        data: readFileSync('src/templates/report/assets/greenMetricLogo.png'),
        transformation: {
          width: 115,
          height: 85,
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.COLUMN,
            offset: 5093208,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PARAGRAPH,
            offset: -320040,
          },
        },
      }),
    ],
  }),
];
