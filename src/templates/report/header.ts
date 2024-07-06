const docx = require('docx');
const {
  Paragraph,
  AlignmentType,
  ImageRun,
  HorizontalPositionRelativeFrom,
  HorizontalPositionAlign,
  VerticalPositionRelativeFrom,
  Tab,
} = docx;
import { readFileSync } from 'fs';

export const header = [
  new Paragraph({
    alignment: AlignmentType.BOTH,
    children: [
      new ImageRun({
        data: readFileSync('src/templates/report/assets/ucabLogo.png'),
        transformation: {
          width: 283,
          height: 44,
        },
      }),
      new ImageRun({
        data: readFileSync('src/templates/report/assets/greenmetricLogo.png'),
        transformation: {
          width: 110,
          height: 83,
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.COLUMN,
            align: HorizontalPositionAlign.RIGHT,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            offset: 10,
          },
        },
      }),
    ],
  }),
];
